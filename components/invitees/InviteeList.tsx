"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { InviteeFormDialog } from "@/components/invitees/InviteeFormDialog";
import { useToast } from "@/hooks/use-toast";
import { INVITEE_STATUS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Search, Download, Plus, Trash2, ExternalLink } from "lucide-react";

interface Invitee {
  id: string;
  name: string;
  contact: string | null;
  relation: string | null;
  status: string;
  memo: string | null;
  inviteToken: string;
  lastContactedAt: Date | string | null;
  rsvpResponses: Array<{ responseStatus: string; comment: string | null }>;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  note: string | null;
}

interface Props {
  initialInvitees: Invitee[];
  event: Event | null;
}

export function InviteeList({ initialInvitees, event }: Props) {
  const [invitees, setInvitees] = useState(initialInvitees);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const router = useRouter();
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return invitees.filter((inv) => {
      const matchesSearch =
        !search ||
        inv.name.includes(search) ||
        inv.contact?.includes(search) ||
        inv.relation?.includes(search);
      const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invitees, search, statusFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    try {
      const res = await fetch(`/api/invitees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      setInvitees((prev) => prev.filter((i) => i.id !== id));
      toast({ title: `${name}を削除しました` });
    } catch {
      toast({ title: "削除に失敗しました", variant: "destructive" });
    }
  };

  const handleAdd = (newInvitee: Invitee) => {
    setInvitees((prev) => [...prev, newInvitee]);
  };

  const handleExport = () => {
    const url = event ? `/api/export?eventId=${event.id}` : "/api/export";
    window.location.href = url;
  };

  const getRsvpUrl = (token: string) => {
    return `${window.location.origin}/rsvp/${token}`;
  };

  const copyRsvpUrl = (token: string) => {
    navigator.clipboard.writeText(getRsvpUrl(token));
    toast({ title: "招待URLをコピーしました" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="名前・連絡先で検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">すべて</SelectItem>
              {Object.entries(INVITEE_STATUS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          {event && (
            <InviteeFormDialog eventId={event.id} onSuccess={handleAdd}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> 追加
              </Button>
            </InviteeFormDialog>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length}人表示中（全{invitees.length}人）</p>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {invitees.length === 0 ? "参加者がまだ登録されていません" : "条件に一致する参加者が見つかりません"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv) => (
            <Card key={inv.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/invitees/${inv.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {inv.name}
                      </Link>
                      <StatusBadge status={inv.status} />
                      {inv.relation && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {inv.relation}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      {inv.contact && <span>{inv.contact}</span>}
                      {inv.lastContactedAt && (
                        <span>最終連絡: {formatDateTime(inv.lastContactedAt)}</span>
                      )}
                    </div>
                    {inv.rsvpResponses[0] && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        💬 {inv.rsvpResponses[0].comment}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => copyRsvpUrl(inv.inviteToken)}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="招待URLをコピー"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id, inv.name)}
                      className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors dark:hover:bg-red-950"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
