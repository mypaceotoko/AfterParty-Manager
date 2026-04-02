import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  date: z.string().min(1, "日付は必須です"),
  time: z.string().min(1, "時間は必須です"),
  location: z.string().min(1, "場所は必須です"),
  note: z.string().optional(),
});

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { invitees: true } },
      },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "イベントの取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const event = await prisma.event.create({ data: parsed.data });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "イベントの作成に失敗しました" }, { status: 500 });
  }
}
