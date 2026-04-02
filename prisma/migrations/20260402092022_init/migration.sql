-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Invitee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "relation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_CONTACTED',
    "memo" TEXT,
    "inviteToken" TEXT NOT NULL,
    "lastContactedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invitee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RSVPResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inviteeId" TEXT NOT NULL,
    "responseStatus" TEXT NOT NULL,
    "comment" TEXT,
    "respondedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RSVPResponse_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "Invitee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inviteeId" TEXT,
    "purpose" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageDraft_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "Invitee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitee_inviteToken_key" ON "Invitee"("inviteToken");
