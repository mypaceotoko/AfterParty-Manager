import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Create a sample event
  const event = await prisma.event.upsert({
    where: { id: "sample-event-001" },
    update: {},
    create: {
      id: "sample-event-001",
      title: "田中・山田 結婚式二次会",
      date: "2026-06-15",
      time: "19:00",
      location: "Restaurant Bella Vista（渋谷区神南1-2-3）",
      note: "会費：男性5,000円 / 女性4,000円\n服装：スマートカジュアル\n幹事：佐藤（090-XXXX-XXXX）",
    },
  });

  console.log("Created event:", event.title);

  // Sample invitees
  const invitees = [
    {
      name: "鈴木 太郎",
      contact: "suzuki@example.com",
      relation: "友人",
      status: "ATTENDING",
      memo: "大学の同期。新郎と仲良し。",
      lastContactedAt: new Date("2026-04-01"),
    },
    {
      name: "佐藤 花子",
      contact: "sato@example.com",
      relation: "職場",
      status: "ATTENDING",
      memo: "新婦の同僚。",
      lastContactedAt: new Date("2026-04-01"),
    },
    {
      name: "田中 健一",
      contact: "tanaka@example.com",
      relation: "友人",
      status: "DECLINED",
      memo: "先約があるとのこと。",
      lastContactedAt: new Date("2026-03-28"),
    },
    {
      name: "山田 美咲",
      contact: "yamada@example.com",
      relation: "友人",
      status: "UNDECIDED",
      memo: "仕事の都合次第とのこと。",
      lastContactedAt: new Date("2026-03-30"),
    },
    {
      name: "伊藤 次郎",
      contact: "ito@example.com",
      relation: "先輩",
      status: "WAITING",
      memo: "返信待ち。",
      lastContactedAt: new Date("2026-04-01"),
    },
    {
      name: "渡辺 恵",
      contact: "watanabe@example.com",
      relation: "後輩",
      status: "CONTACTED",
      memo: "連絡済み、まだ返信なし。",
      lastContactedAt: new Date("2026-04-02"),
    },
    {
      name: "中村 亮",
      contact: "nakamura@example.com",
      relation: "久しぶり",
      status: "NOT_CONTACTED",
      memo: "高校の同期。連絡先は確認済み。",
    },
    {
      name: "小林 さくら",
      contact: "kobayashi@example.com",
      relation: "友人",
      status: "ATTENDING",
      memo: "新婦の親友。",
      lastContactedAt: new Date("2026-03-29"),
    },
    {
      name: "加藤 信二",
      contact: "kato@example.com",
      relation: "職場",
      status: "WAITING",
      memo: "",
      lastContactedAt: new Date("2026-04-01"),
    },
    {
      name: "松本 留美",
      contact: "matsumoto@example.com",
      relation: "友人",
      status: "ATTENDING",
      memo: "余興を手伝ってくれる予定。",
      lastContactedAt: new Date("2026-03-31"),
    },
  ];

  for (const inviteeData of invitees) {
    const existing = await prisma.invitee.findFirst({
      where: { eventId: event.id, name: inviteeData.name },
    });
    if (!existing) {
      const invitee = await prisma.invitee.create({
        data: {
          eventId: event.id,
          ...inviteeData,
        },
      });

      // Add RSVP responses for attending/declined
      if (inviteeData.status === "ATTENDING") {
        await prisma.rSVPResponse.create({
          data: {
            inviteeId: invitee.id,
            responseStatus: "ATTENDING",
            comment: "ぜひ参加します！楽しみにしています。",
            respondedAt: inviteeData.lastContactedAt ?? new Date(),
          },
        });
      } else if (inviteeData.status === "DECLINED") {
        await prisma.rSVPResponse.create({
          data: {
            inviteeId: invitee.id,
            responseStatus: "DECLINED",
            comment: "残念ながら先約があり参加できません。おめでとうございます！",
            respondedAt: inviteeData.lastContactedAt ?? new Date(),
          },
        });
      }
    }
  }

  console.log(`Created ${invitees.length} invitees`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
