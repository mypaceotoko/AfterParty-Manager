"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export function EventCreateForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "19:00",
    location: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.location) {
      toast({ title: "タイトル・日付・場所は必須です", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast({ title: "イベントを作成しました！" });
      router.refresh();
    } catch {
      toast({ title: "作成に失敗しました", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="lg">
        <Plus className="h-5 w-5 mr-2" /> イベントを作成する
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left max-w-sm mx-auto">
      <div>
        <Label htmlFor="title">イベント名 *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="田中・山田 結婚式二次会"
          className="mt-1"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="date">日付 *</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="time">時間</Label>
          <Input
            id="time"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="location">場所 *</Label>
        <Input
          id="location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Restaurant XX（渋谷区〇〇1-2-3）"
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="note">メモ（任意）</Label>
        <Textarea
          id="note"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="会費・服装など"
          className="mt-1"
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
          キャンセル
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "作成中..." : "作成する"}
        </Button>
      </div>
    </form>
  );
}
