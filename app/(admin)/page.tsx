import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { INVITEE_STATUS, type InviteeStatusKey } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, UserCheck, UserX, Clock, AlertCircle, CalendarHeart } from "lucide-react";
import Link from "next/link";
import { EventEditForm } from "@/components/dashboard/EventEditForm";
import { EventCreateForm } from "@/components/dashboard/EventCreateForm";

async function getDashboardData() {
  try {
    const event = await prisma.event.findFirst({ orderBy: { createdAt: "asc" } });
    if (!event) return null;

    const invitees = await prisma.invitee.findMany({
      where: { eventId: event.id },
      include: { rsvpResponses: { orderBy: { respondedAt: "desc" }, take: 1 } },
      orderBy: { updatedAt: "desc" },
    });

  const stats = {
    total: invitees.length,
    attending: invitees.filter((i) => i.status === "ATTENDING").length,
    declined: invitees.filter((i) => i.status === "DECLINED").length,
    undecided: invitees.filter((i) => i.status === "UNDECIDED").length,
    waiting: invitees.filter((i) => i.status === "WAITING").length,
    contacted: invitees.filter((i) => i.status === "CONTACTED").length,
    notContacted: invitees.filter((i) => i.status === "NOT_CONTACTED").length,
  };

  const unreplied = invitees.filter((i) =>
    ["NOT_CONTACTED", "CONTACTED", "WAITING"].includes(i.status)
  );

  const recentActivity = invitees
    .filter((i) => i.lastContactedAt)
    .slice(0, 5);

    return { event, stats, unreplied, recentActivity };
  } catch (error) {
    console.error("DB connection error:", error);
    return "DB_ERROR" as const;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (data === "DB_ERROR") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CalendarHeart className="h-7 w-7 text-rose-500" />
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
        </div>
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">データベースに接続できません</p>
            <p className="text-sm text-muted-foreground mb-4">
              Vercelの環境変数 <code className="bg-muted px-1 rounded">TURSO_DATABASE_URL</code> と{" "}
              <code className="bg-muted px-1 rounded">TURSO_AUTH_TOKEN</code> が正しく設定されているか確認してください。
            </p>
            <p className="text-xs text-muted-foreground">
              設定後はVercelで再デプロイが必要です。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CalendarHeart className="h-7 w-7 text-rose-500" />
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-3">まずイベントを登録してください</p>
            <EventCreateForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  const { event, stats, unreplied, recentActivity } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <CalendarHeart className="h-7 w-7 text-rose-500" />
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
        </div>
        <EventEditForm event={event} />
      </div>

      {/* Event Info */}
      <Card className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-100 dark:border-rose-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-rose-700 dark:text-rose-300 text-lg">
            🎉 {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">日時：</span>
              <span className="font-medium">{formatDate(event.date)} {event.time}〜</span>
            </div>
            <div>
              <span className="text-muted-foreground">場所：</span>
              <span className="font-medium">{event.location}</span>
            </div>
          </div>
          {event.note && (
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{event.note}</p>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">招待者総数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.attending}</p>
                <p className="text-xs text-muted-foreground">参加予定</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.declined}</p>
                <p className="text-xs text-muted-foreground">不参加</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.waiting + stats.contacted + stats.notContacted}
                </p>
                <p className="text-xs text-muted-foreground">未回答</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">回答状況</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex rounded-full overflow-hidden h-4 mb-3">
              {stats.attending > 0 && (
                <div
                  className="bg-green-500"
                  style={{ width: `${(stats.attending / stats.total) * 100}%` }}
                  title={`参加: ${stats.attending}人`}
                />
              )}
              {stats.declined > 0 && (
                <div
                  className="bg-red-500"
                  style={{ width: `${(stats.declined / stats.total) * 100}%` }}
                  title={`不参加: ${stats.declined}人`}
                />
              )}
              {stats.undecided > 0 && (
                <div
                  className="bg-yellow-400"
                  style={{ width: `${(stats.undecided / stats.total) * 100}%` }}
                  title={`未定: ${stats.undecided}人`}
                />
              )}
              <div className="bg-gray-200 dark:bg-gray-700 flex-1" />
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> 参加 {stats.attending}人</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> 不参加 {stats.declined}人</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> 未定 {stats.undecided}人</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" /> 未回答 {stats.waiting + stats.contacted + stats.notContacted}人</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Unreplied list */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              未回答の方 ({unreplied.length}人)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unreplied.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">全員から回答済みです 🎉</p>
            ) : (
              <div className="space-y-2">
                {unreplied.slice(0, 8).map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invitees/${inv.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{inv.name}</p>
                      <p className="text-xs text-muted-foreground">{inv.relation ?? "—"}</p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </Link>
                ))}
                {unreplied.length > 8 && (
                  <Link href="/invitees" className="text-xs text-primary hover:underline block text-center pt-1">
                    他 {unreplied.length - 8}人を見る →
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">最近の連絡履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">連絡履歴がまだありません</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invitees/${inv.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{inv.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(inv.lastContactedAt)}
                      </p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
