import { prisma } from "@/lib/prisma";
import { InviteeList } from "@/components/invitees/InviteeList";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getInvitees() {
  const event = await prisma.event.findFirst({ orderBy: { createdAt: "asc" } });
  if (!event) return { event: null, invitees: [] };

  const invitees = await prisma.invitee.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "asc" },
    include: {
      rsvpResponses: { orderBy: { respondedAt: "desc" }, take: 1 },
    },
  });

  return { event, invitees };
}

export default async function InviteesPage() {
  const { event, invitees } = await getInvitees();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-7 w-7 text-rose-500" />
        <h1 className="text-2xl font-bold">参加者一覧</h1>
      </div>
      <InviteeList initialInvitees={invitees} event={event} />
    </div>
  );
}
