import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inviteeSchema = z.object({
  eventId: z.string().min(1, "イベントIDは必須です"),
  name: z.string().min(1, "名前は必須です"),
  contact: z.string().optional(),
  relation: z.string().optional(),
  status: z
    .enum(["NOT_CONTACTED", "CONTACTED", "ATTENDING", "DECLINED", "UNDECIDED", "WAITING"])
    .default("NOT_CONTACTED"),
  memo: z.string().optional(),
  lastContactedAt: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contact: { contains: search } },
        { relation: { contains: search } },
      ];
    }

    const invitees = await prisma.invitee.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        rsvpResponses: { orderBy: { respondedAt: "desc" }, take: 1 },
      },
    });
    return NextResponse.json(invitees);
  } catch (error) {
    console.error("GET /api/invitees error:", error);
    return NextResponse.json({ error: "参加者の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = inviteeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { lastContactedAt, ...rest } = parsed.data;
    const invitee = await prisma.invitee.create({
      data: {
        ...rest,
        lastContactedAt: lastContactedAt ? new Date(lastContactedAt) : undefined,
      },
    });
    return NextResponse.json(invitee, { status: 201 });
  } catch (error) {
    console.error("POST /api/invitees error:", error);
    return NextResponse.json({ error: "参加者の作成に失敗しました" }, { status: 500 });
  }
}
