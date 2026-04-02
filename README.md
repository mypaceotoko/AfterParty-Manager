# 結婚式二次会 出欠管理 & 声掛け文ジェネレーター

結婚式二次会の幹事向けに作られた、出欠管理と招待メッセージ生成のWebアプリです。

## 主な機能

- **ダッシュボード** — 参加者の状況を一目で把握。未回答者・参加人数・不参加人数をリアルタイム表示
- **参加者一覧** — 検索・フィルター・ソート付きの一覧管理。CSVエクスポート対応
- **参加者詳細** — ステータス変更・返信履歴・メモ管理・招待URL生成
- **公開RSVPページ** — スマホ対応の回答フォーム。専用URLから「参加」「不参加」「未定」を回答可能
- **声掛け文ジェネレーター** — AI（Claude / OpenAI）で自然な声掛け文を3パターン生成。APIキーなしでもモック生成で動作

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js 16 (App Router) + TypeScript |
| スタイリング | Tailwind CSS v4 + Radix UI |
| データベース | SQLite (Prisma 7 + libsql) |
| バリデーション | Zod v4 |
| AI | Anthropic Claude / OpenAI 互換 API（モックフォールバック付き） |

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/afterparty-manager.git
cd afterparty-manager
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集してください:

```env
DATABASE_URL="file:./prisma/dev.db"

# AI機能を使う場合（どちらか一方）
# ANTHROPIC_API_KEY="sk-ant-..."
# OPENAI_API_KEY="sk-..."
```

> APIキーを設定しない場合、サンプルの声掛け文が自動生成されます（AI機能なしでも動作します）

### 4. データベースのセットアップ

```bash
npx prisma migrate dev
```

### 5. サンプルデータの投入（任意）

```bash
npx tsx prisma/seed.ts
```

サンプルイベントと10人の招待者データが追加されます。

### 6. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

## 画面構成

| パス | 説明 |
|-----|------|
| `/` | ダッシュボード（イベント概要・集計） |
| `/invitees` | 参加者一覧 |
| `/invitees/[id]` | 参加者詳細 |
| `/messages` | 声掛け文ジェネレーター |
| `/rsvp/[token]` | 公開回答フォーム（招待者向け） |

## 招待URLの使い方

1. 参加者一覧 or 詳細ページで「招待URLをコピー」をクリック
2. URLを相手に送信（LINE・メール・SMSなど）
3. 相手がURLを開いて「参加」「不参加」「未定」を選択して送信
4. 回答がダッシュボードと参加者ページに反映される

## NPMスクリプト

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動
npm run db:migrate   # DBマイグレーション実行
npm run db:seed      # サンプルデータ投入
npm run db:studio    # Prisma Studio（DBブラウザ）起動
```

## プロジェクト構造

```
.
├── app/
│   ├── (admin)/          # 管理画面（ダッシュボード・一覧・詳細・メッセージ）
│   ├── api/              # API Routes
│   │   ├── events/       # イベントCRUD
│   │   ├── invitees/     # 招待者CRUD
│   │   ├── messages/     # メッセージ生成・保存
│   │   ├── rsvp/         # 回答受付
│   │   └── export/       # CSVエクスポート
│   └── rsvp/[token]/     # 公開回答フォーム
├── components/
│   ├── ui/               # 基本UIコンポーネント
│   ├── layout/           # レイアウト（サイドバーなど）
│   ├── dashboard/        # ダッシュボード用コンポーネント
│   ├── invitees/         # 招待者管理コンポーネント
│   ├── messages/         # 声掛け文生成コンポーネント
│   └── rsvp/             # 公開フォームコンポーネント
├── lib/
│   ├── prisma.ts         # Prismaクライアント
│   ├── ai.ts             # AI生成ロジック（Anthropic/OpenAI/モック）
│   ├── constants.ts      # ステータス定数・選択肢
│   └── utils.ts          # ユーティリティ関数
├── prisma/
│   ├── schema.prisma     # データモデル
│   └── seed.ts           # サンプルデータ
└── types/
    └── index.ts          # 型定義
```

## 🌐 Vercel へのデプロイ（無料で公開URL取得）

### Step 1: Turso でDBを作成（無料）

1. [https://turso.tech](https://turso.tech) でアカウント作成
2. ダッシュボードから「Create Database」→ 名前を入力（例: `afterparty-db`）
3. 作成後、「Generate Token」でトークンを取得
4. 以下の2つの値をメモ：
   - `Database URL` → `libsql://afterparty-db-xxxxxxx.turso.io`
   - `Auth Token` → `eyJhbGciOiJFZERTQSJ9...`

### Step 2: Vercel にデプロイ（無料）

1. [https://vercel.com](https://vercel.com) でアカウント作成（GitHubでログイン）
2. 「Add New Project」→ `afterparty-manager` リポジトリを選択
3. 「Environment Variables」に以下を追加：

| 変数名 | 値 |
|--------|-----|
| `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | Tursoのトークン |
| `ANTHROPIC_API_KEY` | （任意）Claude APIキー |

4. 「Deploy」ボタンを押す
5. デプロイ完了後、`https://your-app.vercel.app` でアクセス可能 🎉

### Step 3: 初期データの投入

デプロイ後、ローカルから本番DBにシードを流す：

```bash
# .env に本番のTurso URLを設定してから
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx tsx prisma/seed.ts
```

---

## ライセンス

MIT
