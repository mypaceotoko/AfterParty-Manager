import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMessages } from "@/lib/ai";
import { z } from "zod";

const generateSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  relation: z.string().min(1, "関係性は必須です"),
  tone: z.enum(["formal", "casual", "frank", "very_formal"]),
  purpose: z.enum(["first_contact", "reminder", "deadline_reminder", "thank_you"]),
  eventDate: z.string().min(1, "日付は必須です"),
  eventTime: z.string().min(1, "時間は必須です"),
  eventLocation: z.string().min(1, "場所は必須です"),
  replyNote: z.string().default(""),
});

const saveSchema = z.object({
  inviteeId: z.string().optional().nullable(),
  purpose: z.string().min(1),
  tone: z.string().min(1),
  content: z.string().min(1, "内容は必須です"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "save") {
      const parsed = saveSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
      }
      const draft = await prisma.messageDraft.create({ data: parsed.data });
      return NextResponse.json(draft, { status: 201 });
    }

    // Default: generate messages
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await generateMessages(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "メッセージの生成に失敗しました" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteeId = searchParams.get("inviteeId");

    const drafts = await prisma.messageDraft.findMany({
      where: inviteeId ? { inviteeId } : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "メッセージの取得に失敗しました" }, { status: 500 });
  }
}
