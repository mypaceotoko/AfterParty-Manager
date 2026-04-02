"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { CalendarDays, MapPin, Clock, CheckCircle2, XCircle, HelpCircle, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  note: string | null;
}

interface PreviousResponse {
  responseStatus: string;
  comment: string | null;
  respondedAt: Date;
}

interface Props {
  token: string;
  inviteeName: string;
  event: Event;
  previousResponse: PreviousResponse | null;
}

type RSVPStatus = "ATTENDING" | "DECLINED" | "UNDECIDED";

const STATUS_OPTIONS: Array<{
  value: RSVPStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  colors: string;
  selectedColors: string;
}> = [
  {
    value: "ATTENDING",
    label: "参加します",
    description: "ぜひ参加したいです！",
    icon: CheckCircle2,
    colors: "border-gray-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/30",
    selectedColors: "border-green-500 bg-green-50 dark:bg-green-950/50",
  },
  {
    value: "DECLINED",
    label: "不参加",
    description: "残念ながら都合がつきません",
    icon: XCircle,
    colors: "border-gray-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30",
    selectedColors: "border-red-400 bg-red-50 dark:bg-red-950/50",
  },
  {
    value: "UNDECIDED",
    label: "未定",
    description: "まだ確認中です",
    icon: HelpCircle,
    colors: "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
    selectedColors: "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/50",
  },
];

export function RSVPForm({ token, inviteeName, event, previousResponse }: Props) {
  const [status, setStatus] = useState<RSVPStatus | null>(
    (previousResponse?.responseStatus as RSVPStatus) ?? null
  );
  const [comment, setComment] = useState(previousResponse?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!status) {
      setError("出欠を選択してください");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken: token, responseStatus: status, comment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "送信に失敗しました");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <PartyPopper className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">ご回答ありがとうございます！</h2>
          <p className="text-muted-foreground text-sm mb-4">
            {inviteeName}さんの回答を受け付けました。
          </p>
          {status === "ATTENDING" && (
            <p className="text-green-600 font-medium text-sm">
              当日お会いできるのを楽しみにしています 🎉
            </p>
          )}
          {status === "DECLINED" && (
            <p className="text-muted-foreground text-sm">
              またの機会にぜひお会いしましょう。
            </p>
          )}
          {status === "UNDECIDED" && (
            <p className="text-muted-foreground text-sm">
              決まりましたらまたご連絡ください。
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-base text-center">
          {inviteeName}さん、ご確認をお願いします
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Event Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{event.time}〜</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{event.location}</span>
          </div>
          {event.note && (
            <p className="text-xs text-muted-foreground pt-1 whitespace-pre-line border-t mt-2 pt-2">
              {event.note}
            </p>
          )}
        </div>

        {/* Status Selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium">ご出欠を教えてください</p>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = status === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    isSelected ? opt.selectedColors : opt.colors
                  )}
                >
                  <Icon className={cn(
                    "h-6 w-6 shrink-0",
                    opt.value === "ATTENDING" && (isSelected ? "text-green-600" : "text-gray-400"),
                    opt.value === "DECLINED" && (isSelected ? "text-red-500" : "text-gray-400"),
                    opt.value === "UNDECIDED" && (isSelected ? "text-yellow-500" : "text-gray-400"),
                  )} />
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="text-sm font-medium">コメント（任意）</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="一言メッセージをどうぞ"
            className="mt-1"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{comment.length}/500</p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
            {error}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting || !status}
          className="w-full"
          size="lg"
        >
          {submitting ? "送信中..." : "回答を送信する"}
        </Button>

        {previousResponse && (
          <p className="text-xs text-center text-muted-foreground">
            ※ 以前の回答を変更することができます
          </p>
        )}
      </CardContent>
    </Card>
  );
}
