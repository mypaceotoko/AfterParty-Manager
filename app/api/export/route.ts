import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INVITEE_STATUS, RSVP_STATUS, type InviteeStatusKey, type RSVPStatusKey } from "@/lib/constants";
import { escapeCSV, formatDateTime } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const invitees = await prisma.invitee.findMany({
      where: eventId ? { eventId } : {},
      orderBy: { createdAt: "asc" },
      include: {
        rsvpResponses: { orderBy: { respondedAt: "desc" }, take: 1 },
        event: true,
      },
    });

    const headers = ["名前", "連絡先", "関係性", "ステータス", "メモ", "最終連絡日時", "最新の回答", "コメント", "回答日時"];

    const rows = invitees.map((inv) => {
      const latestRsvp = inv.rsvpResponses[0];
      return [
        inv.name,
        inv.contact ?? "",
        inv.relation ?? "",
        INVITEE_STATUS[inv.status as InviteeStatusKey] ?? inv.status,
        inv.memo ?? "",
        formatDateTime(inv.lastContactedAt),
        latestRsvp ? (RSVP_STATUS[latestRsvp.responseStatus as RSVPStatusKey] ?? latestRsvp.responseStatus) : "",
        latestRsvp?.comment ?? "",
        latestRsvp ? formatDateTime(latestRsvp.respondedAt) : "",
      ].map(escapeCSV);
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Add BOM for Excel compatibility
    const bom = "\uFEFF";
    const body = bom + csvContent;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="invitees_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "CSVエクスポートに失敗しました" }, { status: 500 });
  }
}
