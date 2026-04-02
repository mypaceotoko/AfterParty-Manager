"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RELATION_OPTIONS, TONE_OPTIONS, PURPOSE_OPTIONS } from "@/lib/constants";
import { Sparkles, Copy, Save, RefreshCw, Check } from "lucide-react";

interface Event {
  id: string;
  date: string;
  time: string;
  location: string;
}

interface Props {
  defaultName?: string;
  defaultRelation?: string;
  defaultInviteeId?: string;
  event: Event | null;
}

export function MessageGenerator({ defaultName, defaultRelation, defaultInviteeId, event }: Props) {
  const [form, setForm] = useState({
    name: defaultName ?? "",
    relation: defaultRelation ?? "",
    tone: "casual",
    purpose: "first_contact",
    eventDate: event?.date ?? "",
    eventTime: event?.time ?? "",
    eventLocation: event?.location ?? "",
    replyNote: "このメッセージに「参加」または「不参加」と返信してください",
  });

  const [patterns, setPatterns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!form.name.trim()) {
      toast({ title: "名前を入力してください", variant: "destructive" });
      return;
    }
    setLoading(true);
    setPatterns([]);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("生成に失敗しました");
      const data = await res.json();
      setPatterns(data.patterns ?? []);
    } catch {
      toast({ title: "メッセージの生成に失敗しました", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "コピーしました" });
  };

  const handleSave = async (content: string, index: number) => {
    try {
      const res = await fetch("/api/messages?action=save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteeId: defaultInviteeId || null,
          purpose: form.purpose,
          tone: form.tone,
          content,
        }),
      });
      if (!res.ok) throw new Error();
      setSavedIndex(index);
      setTimeout(() => setSavedIndex(null), 2000);
      toast({ title: "メッセージを保存しました" });
    } catch {
      toast({ title: "保存に失敗しました", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">生成条件の設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">相手の名前 *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="田中 太郎"
                className="mt-1"
              />
            </div>
            <div>
              <Label>関係性</Label>
              <Select value={form.relation} onValueChange={(v) => setForm({ ...form, relation: v })}>
                <SelectTrigger className="mt-1">
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
              <Label>文体</Label>
              <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>用途</Label>
              <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSE_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="eventDate">二次会の日付</Label>
              <Input
                id="eventDate"
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="eventTime">二次会の時間</Label>
              <Input
                id="eventTime"
                type="time"
                value={form.eventTime}
                onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="eventLocation">場所</Label>
              <Input
                id="eventLocation"
                value={form.eventLocation}
                onChange={(e) => setForm({ ...form, eventLocation: e.target.value })}
                placeholder="Restaurant XX（渋谷区〇〇1-2-3）"
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="replyNote">返信用の一言（任意）</Label>
              <Input
                id="replyNote"
                value={form.replyNote}
                onChange={(e) => setForm({ ...form, replyNote: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 w-full sm:w-auto"
            size="lg"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" /> 3パターン生成
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Patterns */}
      {patterns.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">生成結果</h2>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-1" /> 再生成
            </Button>
          </div>
          {patterns.map((pattern, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  パターン {index + 1}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(pattern, index)}
                  >
                    {copiedIndex === index ? (
                      <><Check className="h-4 w-4 mr-1 text-green-500" /> コピー済み</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-1" /> コピー</>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSave(pattern, index)}
                  >
                    {savedIndex === index ? (
                      <><Check className="h-4 w-4 mr-1 text-green-500" /> 保存済み</>
                    ) : (
                      <><Save className="h-4 w-4 mr-1" /> 保存</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={pattern}
                  onChange={(e) => {
                    const newPatterns = [...patterns];
                    newPatterns[index] = e.target.value;
                    setPatterns(newPatterns);
                  }}
                  className="min-h-[140px] text-sm leading-relaxed resize-y"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && patterns.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              条件を設定して「3パターン生成」ボタンを押してください
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              AIキーが未設定の場合はサンプル文が生成されます
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
