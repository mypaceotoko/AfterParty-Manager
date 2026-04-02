import { MessageGenerator } from "@/components/messages/MessageGenerator";
import { MessageSquarePlus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; relation?: string; inviteeId?: string }>;
}) {
  const params = await searchParams;
  const event = await prisma.event.findFirst({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquarePlus className="h-7 w-7 text-rose-500" />
        <h1 className="text-2xl font-bold">声掛け文ジェネレーター</h1>
      </div>
      <MessageGenerator
        defaultName={params.name ?? ""}
        defaultRelation={params.relation ?? ""}
        defaultInviteeId={params.inviteeId ?? ""}
        event={event}
      />
    </div>
  );
}
