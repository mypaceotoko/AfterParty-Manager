import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const rsvpSchema = z.object({
  inviteToken: z.string().min(1, "招待トークンは必須です"),
  responseStatus: z.enum(["ATTENDING", "DECLINED", "UNDECIDED"], {
    error: "回答ステータスが不正です",
  }),
  comment: z.string().max(500, "コメントは500文字以内で入力してください").optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = rsvpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { inviteToken, responseStatus, comment } = parsed.data;

    const invitee = await prisma.invitee.findUnique({
      where: { inviteToken },
    });

    if (!invitee) {
      return NextResponse.json({ error: "招待リンクが無効です" }, { status: 404 });
    }

    // Create RSVP response
    const rsvpResponse = await prisma.rSVPResponse.create({
      data: {
        inviteeId: invitee.id,
        responseStatus,
        comment: comment ?? null,
      },
    });

    // Update invitee status based on response
    const statusMap: Record<string, string> = {
      ATTENDING: "ATTENDING",
      DECLINED: "DECLINED",
      UNDECIDED: "UNDECIDED",
    };

    await prisma.invitee.update({
      where: { id: invitee.id },
      data: {
        status: statusMap[responseStatus],
        lastContactedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, response: rsvpResponse }, { status: 201 });
  } catch (error) {
    console.error("POST /api/rsvp error:", error);
    return NextResponse.json({ error: "回答の送信に失敗しました" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "トークンが必要です" }, { status: 400 });
    }

    const invitee = await prisma.invitee.findUnique({
      where: { inviteToken: token },
      include: {
        event: true,
        rsvpResponses: { orderBy: { respondedAt: "desc" }, take: 1 },
      },
    });

    if (!invitee) {
      return NextResponse.json({ error: "招待リンクが無効です" }, { status: 404 });
    }

    return NextResponse.json({
      name: invitee.name,
      event: invitee.event,
      previousResponse: invitee.rsvpResponses[0] ?? null,
    });
  } catch (error) {
    console.error("GET /api/rsvp error:", error);
    return NextResponse.json({ error: "情報の取得に失敗しました" }, { status: 500 });
  }
}
