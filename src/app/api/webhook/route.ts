import type {
  CallSessionStartedEvent,
  CallSessionParticipantLeftEvent,
} from "@stream-io/node-sdk";
// import {
//   CallEndedEvent,
//   CallTranscriptionReadyEvent,
//   CallRecordingReadyEvent,
// } from "@stream-io/node-sdk";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { stream } from "@/lib/stream";
import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { env } from "@/env";

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
        .select()
        .from(meetings)
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

      const existingAgent = await db
        .select()
        .from(agents)
        .where(eq(agents.id, existingMeeting.agentId))
        .then((res) => res.at(0));

      if (!existingAgent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }
      const call = stream.video.call("default", meetingId);
      const realtimeClient = await stream.video.connectOpenAi({
        call,
        openAiApiKey: env.OPENAI_API_KEY,
        agentUserId: existingAgent.id,
      });

      realtimeClient.updateSession({
        instructions: existingAgent.instructions,
      });
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
    }
  }

  return NextResponse.json({ status: "ok" });
}
