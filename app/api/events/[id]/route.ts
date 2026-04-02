import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const eventUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  time: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  note: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        invitees: {
          orderBy: { createdAt: "asc" },
          include: { rsvpResponses: { orderBy: { respondedAt: "desc" }, take: 1 } },
        },
      },
    });
    if (!event) {
      return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json({ error: "イベントの取得に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = eventUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const event = await prisma.event.update({ where: { id }, data: parsed.data });
    return NextResponse.json(event);
  } catch (error) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json({ error: "イベントの更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ error: "イベントの削除に失敗しました" }, { status: 500 });
  }
}
