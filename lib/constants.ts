export const INVITEE_STATUS = {
  NOT_CONTACTED: "未連絡",
  CONTACTED: "連絡済み",
  ATTENDING: "参加",
  DECLINED: "不参加",
  UNDECIDED: "未定",
  WAITING: "返信待ち",
} as const;

export type InviteeStatusKey = keyof typeof INVITEE_STATUS;

export const STATUS_COLORS: Record<InviteeStatusKey, string> = {
  NOT_CONTACTED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  CONTACTED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  ATTENDING: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  DECLINED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  UNDECIDED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  WAITING: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

export const RELATION_OPTIONS = [
  "友人",
  "職場",
  "久しぶり",
  "先輩",
  "後輩",
  "大学の同期",
  "高校の同期",
  "家族・親族",
  "その他",
] as const;

export const TONE_OPTIONS = [
  { value: "formal", label: "丁寧" },
  { value: "casual", label: "くだけた" },
  { value: "frank", label: "フランク" },
  { value: "very_formal", label: "かなり丁寧" },
] as const;

export const PURPOSE_OPTIONS = [
  { value: "first_contact", label: "初回連絡" },
  { value: "reminder", label: "リマインド" },
  { value: "deadline_reminder", label: "締切前の再確認" },
  { value: "thank_you", label: "お礼" },
] as const;

export const RSVP_STATUS = {
  ATTENDING: "参加します",
  DECLINED: "不参加",
  UNDECIDED: "未定",
} as const;

export type RSVPStatusKey = keyof typeof RSVP_STATUS;
