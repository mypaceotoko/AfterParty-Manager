export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invitee {
  id: string;
  eventId: string;
  name: string;
  contact: string | null;
  relation: string | null;
  status: string;
  memo: string | null;
  inviteToken: string;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
  rsvpResponses?: RSVPResponse[];
  messageDrafts?: MessageDraft[];
}

export interface RSVPResponse {
  id: string;
  inviteeId: string;
  responseStatus: string;
  comment: string | null;
  respondedAt: string;
}

export interface MessageDraft {
  id: string;
  inviteeId: string | null;
  purpose: string;
  tone: string;
  content: string;
  createdAt: string;
}

export interface InviteeStats {
  total: number;
  attending: number;
  declined: number;
  undecided: number;
  waiting: number;
  contacted: number;
  notContacted: number;
}
