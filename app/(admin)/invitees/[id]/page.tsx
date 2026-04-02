import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InviteeDetail } from "@/components/invitees/InviteeDetail";

export default async function InviteeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invitee = await prisma.invitee.findUnique({
    where: { id },
    include: {
      event: true,
      rsvpResponses: { orderBy: { respondedAt: "desc" } },
      messageDrafts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!invitee) notFound();

  return <InviteeDetail invitee={invitee} />;
}
