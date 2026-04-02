import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RSVPForm } from "@/components/rsvp/RSVPForm";
import { CalendarHeart } from "lucide-react";

export default async function RSVPPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invitee = await prisma.invitee.findUnique({
    where: { inviteToken: token },
    include: {
      event: true,
      rsvpResponses: { orderBy: { respondedAt: "desc" }, take: 1 },
    },
  });

  if (!invitee) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900 mb-4">
            <CalendarHeart className="h-8 w-8 text-rose-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {invitee.event.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ご出欠のご確認をお願いします
          </p>
        </div>
        <RSVPForm
          token={token}
          inviteeName={invitee.name}
          event={invitee.event}
          previousResponse={invitee.rsvpResponses[0] ?? null}
        />
      </div>
    </div>
  );
}
