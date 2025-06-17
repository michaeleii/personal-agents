import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  meetingIdSchema,
  meetingInsertSchema,
  meetingUpdateSchema,
} from "./schema";
import { z } from "zod";
import { and, desc, eq, getTableColumns, ilike, inArray } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  meetingStatus,
  MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";
import { stream, streamChat } from "@/lib/stream";
import { generateAvatarURI } from "@/lib/utils";
import JSONL from "jsonl-parse-stringify";
import type { StreamTranscriptItem } from "./types";
import { env } from "@/env";

export const meetingsRouter = createTRPCRouter({
  connectAIToCall: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { meetingId } = input;
      try {
        const existingMeeting = await db
          .select({
            ...getTableColumns(meetings),
            agent: {
              id: agents.id,
              name: agents.name,
              instructions: agents.instructions,
              voice: agents.voice,
            },
          })
          .from(meetings)
          .innerJoin(agents, eq(meetings.agentId, agents.id))
          .where(and(eq(meetings.id, meetingId), eq(meetings.userId, user.id)))
          .then((res) => res[0]);

        if (!existingMeeting) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Meeting not found",
          });
        }

        await db
          .update(meetings)
          .set({
            status: "active",
            startedAt: new Date(),
          })
          .where(
            and(
              eq(meetings.id, existingMeeting.id),
              eq(meetings.userId, user.id)
            )
          );
        const call = stream.video.call("default", meetingId);
        const realtimeClient = await stream.video.connectOpenAi({
          call,
          openAiApiKey: env.OPENAI_API_KEY,
          agentUserId: existingMeeting.agent.id,
        });
        realtimeClient.updateSession({
          instructions: existingMeeting.agent.instructions,
          voice: existingMeeting.agent.voice,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }),
  generateChatToken: protectedProcedure.mutation(async ({ ctx }) => {
    const token = streamChat.createToken(ctx.user.id);
    await streamChat.upsertUser({
      id: ctx.user.id,
      role: "admin",
    });
    return token;
  }),
  getTranscript: protectedProcedure
    .input(meetingIdSchema)
    .query(async ({ ctx, input }) => {
      const existingMeeting = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.user.id)))
        .then((res) => res.at(0));

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      if (!existingMeeting.transcriptUrl) {
        return [];
      }

      const transcript = await fetch(existingMeeting.transcriptUrl)
        .then((res) => res.text())
        .then((text) => JSONL.parse<StreamTranscriptItem>(text))
        .catch(() => []);

      const speakerIds = [
        ...new Set(transcript.map((item) => item.speaker_id)),
      ];
      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) =>
          users.map((user) => ({
            ...user,
            image: user.image ?? generateAvatarURI("initials", user.name),
          }))
        );
      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) =>
          agents.map((agent) => ({
            ...agent,
            image: generateAvatarURI("glass", agent.name),
          }))
        );
      const speakers = [...userSpeakers, ...agentSpeakers];

      const transcriptWithSpeakers = transcript.map((item) => {
        const speaker = speakers.find(
          (speaker) => speaker.id === item.speaker_id
        );
        if (!speaker) {
          return {
            ...item,
            user: {
              name: "Unknown",
              image: generateAvatarURI("initials", "Unknown"),
            },
          };
        }

        return {
          ...item,
          user: {
            name: speaker.name,
            image: speaker.image,
          },
        };
      });
      return transcriptWithSpeakers;
    }),
  generateToken: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx;
    await stream.upsertUsers([
      {
        id: user.id,
        name: user.name,
        role: "admin",
        image: user?.image || generateAvatarURI("initials", user.name),
      },
    ]);
    const expirationDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const token = stream.generateUserToken({
      user_id: user.id,
      exp: expirationDate,
    });

    return token;
  }),
  getOne: protectedProcedure
    .input(meetingIdSchema)
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const existingMeeting = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(and(eq(meetings.id, id), eq(meetings.userId, ctx.user.id)))
        .then((res) => res.at(0));

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }
      return existingMeeting;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z.enum([...meetingStatus, ""]).nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status, agentId } = input;
      const data = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined
          )
        )
        .orderBy(desc(meetings.createdAt), desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const totalPages = Math.ceil(data.length / pageSize);
      return {
        items: data,
        totalPages,
      };
    }),
  create: protectedProcedure
    .input(meetingInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { name, agentId } = input;
      const existingAgent = await db
        .select()
        .from(agents)
        .where(eq(agents.id, agentId))
        .then((res) => res.at(0));

      if (!existingAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      if (existingAgent.userId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You do not have permission to create a meeting with this agent",
        });
      }

      const createdMeeting = await db
        .insert(meetings)
        .values({ name, userId: user.id, agentId })
        .returning()
        .then((res) => res[0]);

      const call = stream.video.call("default", createdMeeting.id);
      await call.create({
        data: {
          created_by_id: user.id,
          custom: {
            meetingId: createdMeeting.id,
            meetingName: createdMeeting.name,
          },
          settings_override: {
            transcription: {
              language: "en",
              mode: "auto-on",
              closed_caption_mode: "auto-on",
            },
            recording: {
              mode: "auto-on",
              quality: "1080p",
            },
          },
        },
      });

      await stream.upsertUsers([
        {
          id: existingAgent.id,
          name: existingAgent.name,
          role: "user",
          image: generateAvatarURI("glass", existingAgent.name),
        },
      ]);

      return createdMeeting;
    }),
  update: protectedProcedure
    .input(meetingUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { id, name } = input;
      const updatedMeeting = await db
        .update(meetings)
        .set({
          name,
        })
        .where(and(eq(meetings.id, id), eq(meetings.userId, user.id)))
        .returning()
        .then((res) => res.at(0));

      if (!updatedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }
      return updatedMeeting;
    }),
  delete: protectedProcedure
    .input(meetingIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { id } = input;
      const deletedMeeting = await db
        .delete(meetings)
        .where(and(eq(meetings.id, id), eq(meetings.userId, user.id)))
        .returning()
        .then((res) => res.at(0));

      if (!deletedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }
      return deletedMeeting;
    }),
});
