import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inviteeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  contact: z.string().optional().nullable(),
  relation: z.string().optional().nullable(),
  status: z
    .enum(["NOT_CONTACTED", "CONTACTED", "ATTENDING", "DECLINED", "UNDECIDED", "WAITING"])
    .optional(),
  memo: z.string().optional().nullable(),
  lastContactedAt: z.string().optional().nullable(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invitee = await prisma.invitee.findUnique({
      where: { id },
      include: {
        rsvpResponses: { orderBy: { respondedAt: "desc" } },
        messageDrafts: { orderBy: { createdAt: "desc" } },
        event: true,
      },
    });
    if (!invitee) {
      return NextResponse.json({ error: "参加者が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(invitee);
  } catch (error) {
    console.error("GET /api/invitees/[id] error:", error);
    return NextResponse.json({ error: "参加者の取得に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = inviteeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { lastContactedAt, ...rest } = parsed.data;
    const invitee = await prisma.invitee.update({
      where: { id },
      data: {
        ...rest,
        ...(lastContactedAt !== undefined
          ? { lastContactedAt: lastContactedAt ? new Date(lastContactedAt) : null }
          : {}),
      },
    });
    return NextResponse.json(invitee);
  } catch (error) {
    console.error("PATCH /api/invitees/[id] error:", error);
    return NextResponse.json({ error: "参加者の更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.invitee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/invitees/[id] error:", error);
    return NextResponse.json({ error: "参加者の削除に失敗しました" }, { status: 500 });
  }
}
