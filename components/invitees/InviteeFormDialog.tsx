"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { INVITEE_STATUS, RELATION_OPTIONS } from "@/lib/constants";

interface Props {
  eventId: string;
  onSuccess: (invitee: any) => void;
  children: React.ReactNode;
  defaultValues?: {
    id?: string;
    name?: string;
    contact?: string;
    relation?: string;
    status?: string;
    memo?: string;
  };
}

export function InviteeFormDialog({ eventId, onSuccess, children, defaultValues }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEdit = !!defaultValues?.id;

  const [form, setForm] = useState({
    name: defaultValues?.name ?? "",
    contact: defaultValues?.contact ?? "",
    relation: defaultValues?.relation ?? "",
    status: defaultValues?.status ?? "NOT_CONTACTED",
    memo: defaultValues?.memo ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "名前を入力してください", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const url = isEdit ? `/api/invitees/${defaultValues!.id}` : "/api/invitees";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit ? form : { ...form, eventId };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      const data = await res.json();
      toast({ title: isEdit ? "参加者情報を更新しました" : "参加者を追加しました" });
      onSuccess(data);
      setOpen(false);
      if (!isEdit) {
        setForm({ name: "", contact: "", relation: "", status: "NOT_CONTACTED", memo: "" });
      }
    } catch {
      toast({ title: "保存に失敗しました", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "参加者情報の編集" : "参加者の追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">名前 *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="田中 太郎"
              required
            />
          </div>
          <div>
            <Label htmlFor="contact">連絡先（任意）</Label>
            <Input
              id="contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="090-XXXX-XXXX / example@mail.com"
            />
          </div>
          <div>
            <Label htmlFor="relation">関係性（任意）</Label>
            <Select value={form.relation} onValueChange={(v) => setForm({ ...form, relation: v })}>
              <SelectTrigger>
                <SelectValue placeholder="関係性を選択" />
              </SelectTrigger>
              <SelectContent>
                {RELATION_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">ステータス</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger>
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
            <Label htmlFor="memo">メモ（任意）</Label>
            <Textarea
              id="memo"
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              rows={2}
              placeholder="備考など"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : isEdit ? "更新する" : "追加する"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
