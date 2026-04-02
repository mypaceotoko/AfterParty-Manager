export interface MessageGenerationInput {
  name: string;
  relation: string;
  tone: string;
  purpose: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  replyNote: string;
}

interface GeneratedMessages {
  patterns: string[];
}

const TONE_LABELS: Record<string, string> = {
  formal: "丁寧",
  casual: "くだけた",
  frank: "フランク",
  very_formal: "かなり丁寧",
};

const PURPOSE_LABELS: Record<string, string> = {
  first_contact: "初回連絡",
  reminder: "リマインド",
  deadline_reminder: "締切前の再確認",
  thank_you: "お礼",
};

function buildPrompt(input: MessageGenerationInput): string {
  const toneLabel = TONE_LABELS[input.tone] ?? input.tone;
  const purposeLabel = PURPOSE_LABELS[input.purpose] ?? input.purpose;

  return `あなたは結婚式二次会の幹事です。以下の条件で、招待する相手への声掛けメッセージを3パターン作成してください。

条件:
- 相手の名前: ${input.name}
- 関係性: ${input.relation}
- 文体: ${toneLabel}
- 用途: ${purposeLabel}
- 二次会の日付: ${input.eventDate}
- 二次会の時間: ${input.eventTime}
- 二次会の場所: ${input.eventLocation}
- 返信用の一言: ${input.replyNote}

要件:
- 3パターンそれぞれ個性を変えてください
- 不自然な敬語や重複表現は避けてください
- 結婚式二次会向けに、やわらかく感じのいい文面にしてください
- 各パターンは「---」で区切ってください
- パターン番号や前置きは不要です。本文だけ出力してください
- LINEやメッセージアプリで送りやすい長さにしてください`;
}

function splitPatterns(text: string): string[] {
  const parts = text
    .split(/---+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (parts.length === 0) return [text.trim()];
  return parts.slice(0, 3);
}

function generateMockMessages(input: MessageGenerationInput): string[] {
  const { name, relation, eventDate, eventTime, eventLocation } = input;

  return [
    `${name}さん、こんにちは！\n\n実は○○と△△の結婚式二次会を企画しています🎉\n\n【日時】${eventDate} ${eventTime}〜\n【場所】${eventLocation}\n\nぜひ一緒にお祝いできたら嬉しいです。参加できそうですか？`,

    `${name}さん！\n\nお元気ですか？○○と△△の結婚式二次会のご案内です✨\n\n日時：${eventDate} ${eventTime}〜\n場所：${eventLocation}\n\n${relation}の皆さんと楽しいひとときが過ごせたら嬉しいです。ぜひご検討ください！`,

    `${name}さん、突然のご連絡すみません。\n\n○○と△△の結婚式二次会を開催します。ぜひお越しいただけませんか。\n\n◆日時：${eventDate} ${eventTime}開始\n◆場所：${eventLocation}\n\nご都合をお知らせいただけますと幸いです。`,
  ];
}

async function generateWithAnthropic(
  input: MessageGenerationInput
): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: buildPrompt(input) }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${error}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  const text = data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");
  return splitPatterns(text);
}

async function generateWithOpenAI(
  input: MessageGenerationInput
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const baseUrl =
    process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [{ role: "user", content: buildPrompt(input) }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const text = data.choices[0]?.message?.content ?? "";
  return splitPatterns(text);
}

export async function generateMessages(
  input: MessageGenerationInput
): Promise<GeneratedMessages> {
  try {
    let patterns: string[];

    if (process.env.ANTHROPIC_API_KEY) {
      patterns = await generateWithAnthropic(input);
    } else if (process.env.OPENAI_API_KEY) {
      patterns = await generateWithOpenAI(input);
    } else {
      // Fallback to mock generation
      patterns = generateMockMessages(input);
    }

    // Ensure we always have 3 patterns
    while (patterns.length < 3) {
      patterns.push(generateMockMessages(input)[patterns.length] ?? patterns[0]);
    }

    return { patterns: patterns.slice(0, 3) };
  } catch (error) {
    console.error("AI message generation failed, using mock:", error);
    return { patterns: generateMockMessages(input) };
  }
}
