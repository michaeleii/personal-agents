import type {
  CallSessionStartedEvent,
  CallSessionParticipantLeftEvent,
  CallEndedEvent,
  CallTranscriptionReadyEvent,
  CallRecordingReadyEvent,
  MessageNewEvent,
} from "@stream-io/node-sdk";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { stream, streamChat } from "@/lib/stream";
import { NextResponse, type NextRequest } from "next/server";
import { and, eq, getTableColumns } from "drizzle-orm";
import { env } from "@/env";
import { inngest } from "@/inngest/client";

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { generateAvatarURI } from "@/lib/utils";

const openai = new OpenAI();

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return stream.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const apiKey = req.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json(
      { error: "Missing signature or API key" },
      { status: 400 }
    );
  }

  const body = await req.text();
  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const eventType = (payload as Record<string, unknown>)?.type;

  switch (eventType) {
    case "call.session_started": {
      const event = payload as CallSessionStartedEvent;
      const meetingId = event.call.custom?.meetingId as string;

      if (!meetingId) {
        return NextResponse.json(
          { error: "Missing meetingId" },
          { status: 400 }
        );
      }
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
        .where(and(eq(meetings.id, meetingId), eq(meetings.status, "upcoming")))
        .then((res) => res.at(0));

      if (!existingMeeting) {
        return NextResponse.json(
          { error: "Meeting not found" },
          { status: 404 }
        );
      }

      await db
        .update(meetings)
        .set({
          status: "active",
          startedAt: new Date(),
        })
        .where(eq(meetings.id, existingMeeting.id));

      const call = stream.video.call("default", meetingId);
      const realtimeClient = await stream.video.connectOpenAi({
        call,
        openAiApiKey: env.OPENAI_API_KEY,
        agentUserId: existingMeeting.agent.id,
      });
      realtimeClient.updateSession({
        instructions: existingMeeting.agent.instructions,
      });
      realtimeClient.updateSession({
        voice: existingMeeting.agent.voice,
      });
      break;
    }
    case "call.session_participant_left": {
      const event = payload as CallSessionParticipantLeftEvent;
      const meetingId = event.call_cid.split(":")[1];

      if (!meetingId) {
        return NextResponse.json(
          { error: "Missing meetingId" },
          { status: 400 }
        );
      }

      const call = stream.video.call("default", meetingId);
      await call.end();
      break;
    }
    case "call.session_ended": {
      const event = payload as CallEndedEvent;
      const meetingId = event.call.custom?.meetingId;

      if (!meetingId) {
        return NextResponse.json(
          { error: "Missing meetingId" },
          { status: 400 }
        );
      }

      await db
        .update(meetings)
        .set({
          status: "processing",
          endedAt: new Date(),
        })
        .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
      break;
    }
    case "call.transcription_ready": {
      const event = payload as CallTranscriptionReadyEvent;
      const meetingId = event.call_cid.split(":")[1];

      if (!meetingId) {
        return NextResponse.json(
          { error: "Missing meetingId" },
          { status: 400 }
        );
      }
      const updatedMeeting = await db
        .update(meetings)
        .set({
          transcriptUrl: event.call_transcription.url,
        })
        .where(eq(meetings.id, meetingId))
        .returning()
        .then((res) => res.at(0));

      if (!updatedMeeting) {
        return NextResponse.json(
          { error: "Meeting not found" },
          { status: 404 }
        );
      }
      await inngest.send({
        name: "meetings/processing",
        data: {
          meetingId: updatedMeeting.id,
          transcriptUrl: updatedMeeting.transcriptUrl,
        },
      });
      break;
    }
    case "call.recording_ready": {
      const event = payload as CallRecordingReadyEvent;
      const meetingId = event.call_cid.split(":")[1];

      if (!meetingId) {
        return NextResponse.json(
          { error: "Missing meetingId" },
          { status: 400 }
        );
      }

      await db
        .update(meetings)
        .set({
          recordingUrl: event.call_recording.url,
        })
        .where(eq(meetings.id, meetingId))
        .returning()
        .then((res) => res.at(0));
      break;
    }
    case "message.new": {
      const event = payload as MessageNewEvent;

      const userId = event.user?.id;
      const channelId = event.channel_id;
      const text = event.message?.text;

      if (!userId || !channelId || !text) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      const existingMeeting = await db
        .select()
        .from(meetings)
        .where(
          and(eq(meetings.id, channelId), eq(meetings.status, "completed"))
        )
        .then((res) => res[0]);

      if (!existingMeeting) {
        return NextResponse.json(
          { error: "Meeting not found" },
          { status: 404 }
        );
      }

      const existingAgent = await db
        .select()
        .from(agents)
        .where(eq(agents.id, existingMeeting.agentId))
        .then((res) => res[0]);

      if (!existingAgent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }
      if (userId !== existingAgent.id) {
        const instructions = `
      You are an AI assistant helping the user revisit a recently completed meeting.
      Below is a summary of the meeting, generated from the transcript:
      
      ${existingMeeting.summary}
      
      The following are your original instructions from the live meeting assistant. Please continue to follow these behavioral guidelines as you assist the user:
      
      ${existingAgent.instructions}
      
      The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
      Always base your responses on the meeting summary above.
      
      You also have access to the recent conversation history between you and the user. Use the context of previous messages to provide relevant, coherent, and helpful responses. If the user's question refers to something discussed earlier, make sure to take that into account and maintain continuity in the conversation.
      
      If the summary does not contain enough information to answer a question, politely let the user know.
      
      Be concise, helpful, and focus on providing accurate information from the meeting and the ongoing conversation.
      `;
        const channel = streamChat.channel("messaging", channelId);
        await channel.watch();
        const previousMessages = channel.state.messages
          .slice(-5)
          .filter((msg) => msg.text && msg.text.trim() !== "")
          .map<ChatCompletionMessageParam>((message) => ({
            role: message.user?.id === existingAgent.id ? "assistant" : "user",
            content: message.text || "",
          }));
        const GPTResponse = await openai.chat.completions.create({
          messages: [
            { role: "system", content: instructions },
            ...previousMessages,
            { role: "user", content: text },
          ],
          model: "gpt-4o",
        });

        const GPTResponseText = GPTResponse.choices[0].message.content;

        if (!GPTResponseText) {
          return NextResponse.json(
            { error: "No response from GPT" },
            { status: 400 }
          );
        }
        const agentAvatarURI = generateAvatarURI("glass", existingAgent.name);
        streamChat.upsertUser({
          id: existingAgent.id,
          name: existingAgent.name,
          image: agentAvatarURI,
        });

        channel.sendMessage({
          text: GPTResponseText,
          user: {
            id: existingAgent.id,
            name: existingAgent.name,
            image: agentAvatarURI,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ status: "ok" });
}
