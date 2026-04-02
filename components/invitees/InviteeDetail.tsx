"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { InviteeFormDialog } from "@/components/invitees/InviteeFormDialog";
import { useToast } from "@/hooks/use-toast";
import { INVITEE_STATUS, RSVP_STATUS, type RSVPStatusKey } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, Copy, ExternalLink, Pencil, MessageSquarePlus } from "lucide-react";

interface Invitee {
  id: string;
  eventId: string;
  name: string;
  contact: string | null;
  relation: string | null;
  status: string;
  memo: string | null;
  inviteToken: string;
  lastContactedAt: Date | null;
  rsvpResponses: Array<{
    id: string;
    responseStatus: string;
    comment: string | null;
    respondedAt: Date;
  }>;
  messageDrafts: Array<{
    id: string;
    purpose: string;
    tone: string;
    content: string;
    createdAt: Date;
  }>;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  };
}

export function InviteeDetail({ invitee: initial }: { invitee: Invitee }) {
  const [invitee, setInvitee] = useState(initial);
  const [savingStatus, setSavingStatus] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const rsvpUrl = typeof window !== "undefined"
    ? `${window.location.origin}/rsvp/${invitee.inviteToken}`
    : `/rsvp/${invitee.inviteToken}`;

  const copyRsvpUrl = () => {
    navigator.clipboard.writeText(rsvpUrl);
    toast({ title: "招待URLをコピーしました" });
  };

  const handleStatusChange = async (status: string) => {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/invitees/${invitee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, lastContactedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setInvitee((prev) => ({ ...prev, ...updated }));
      toast({ title: "ステータスを更新しました" });
    } catch {
      toast({ title: "更新に失敗しました", variant: "destructive" });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleEditSuccess = (updated: Invitee) => {
    setInvitee((prev) => ({ ...prev, ...updated }));
    router.refresh();
  };

  const PURPOSE_LABELS: Record<string, string> = {
    first_contact: "初回連絡",
    reminder: "リマインド",
    deadline_reminder: "締切前の再確認",
    thank_you: "お礼",
  };

  const TONE_LABELS: Record<string, string> = {
    formal: "丁寧",
    casual: "くだけた",
    frank: "フランク",
    very_formal: "かなり丁寧",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/invitees">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> 一覧に戻る
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{invitee.name}</h1>
        <StatusBadge status={invitee.status} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">基本情報</CardTitle>
            <InviteeFormDialog
              eventId={invitee.eventId}
              onSuccess={handleEditSuccess}
              defaultValues={{
                id: invitee.id,
                name: invitee.name,
                contact: invitee.contact ?? "",
                relation: invitee.relation ?? "",
                status: invitee.status,
                memo: invitee.memo ?? "",
              }}
            >
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </InviteeFormDialog>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground text-xs">連絡先</p>
                <p>{invitee.contact || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">関係性</p>
                <p>{invitee.relation || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">最終連絡日時</p>
                <p>{formatDateTime(invitee.lastContactedAt)}</p>
              </div>
            </div>
            {invitee.memo && (
              <div>
                <p className="text-muted-foreground text-xs">メモ</p>
                <p className="whitespace-pre-line">{invitee.memo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & RSVP URL */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">ステータス管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>現在のステータス</Label>
              <Select
                value={invitee.status}
                onValueChange={handleStatusChange}
                disabled={savingStatus}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INVITEE_STATUS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>招待URL</Label>
              <div className="flex gap-2 mt-1">
                <input
                  readOnly
                  value={rsvpUrl}
                  className="flex-1 text-xs border rounded-md px-3 py-2 bg-muted"
                />
                <Button variant="outline" size="icon" onClick={copyRsvpUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Link href={`/rsvp/${invitee.inviteToken}`} target="_blank">
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RSVP Response History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">返信履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {invitee.rsvpResponses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">返信がありません</p>
            ) : (
              <div className="space-y-3">
                {invitee.rsvpResponses.map((resp) => (
                  <div key={resp.id} className="border rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${
                        resp.responseStatus === "ATTENDING" ? "text-green-600" :
                        resp.responseStatus === "DECLINED" ? "text-red-600" : "text-yellow-600"
                      }`}>
                        {RSVP_STATUS[resp.responseStatus as RSVPStatusKey] ?? resp.responseStatus}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(resp.respondedAt)}
                      </span>
                    </div>
                    {resp.comment && (
                      <p className="text-muted-foreground">{resp.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Drafts */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">保存済みメッセージ</CardTitle>
            <Link
              href={`/messages?name=${encodeURIComponent(invitee.name)}&relation=${encodeURIComponent(invitee.relation ?? "")}&inviteeId=${invitee.id}`}
            >
              <Button variant="ghost" size="sm">
                <MessageSquarePlus className="h-4 w-4 mr-1" /> 新規生成
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {invitee.messageDrafts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">保存済みメッセージがありません</p>
            ) : (
              <div className="space-y-3">
                {invitee.messageDrafts.map((draft) => (
                  <div key={draft.id} className="border rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        {PURPOSE_LABELS[draft.purpose] ?? draft.purpose}
                      </span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        {TONE_LABELS[draft.tone] ?? draft.tone}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDateTime(draft.createdAt)}
                      </span>
                    </div>
                    <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                      {draft.content}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(draft.content);
                        toast({ title: "コピーしました" });
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" /> コピー
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
