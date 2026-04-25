// Schema-faithful dummy data. All fields match backend/prisma/schema.prisma.
// The frontend reads from here while wiring to the real API is still TODO.

import type {
  User,
  Book,
  UserBook,
  CustomData,
  FriendConnection,
  Conversation,
  Message,
  Discussion,
  Comment,
  Like,
  UserBookWithBook,
  FeedItem,
  ConversationPreview,
  DiscussionWithCounts,
  CommentWithUser,
} from "@/types/schema";

// ---------- Users (10, one per Radiant order) ----------

export const CURRENT_USER_ID = "u-1";

export const USERS: User[] = [
  { id: "u-1", name: "Kal Stormblessed", email: "kal@coppermind.dev", photo: "windrunners.svg", role: "user", active: true },
  { id: "u-2", name: "Szeth Vallano", email: "szeth@coppermind.dev", photo: "skybreakers.svg", role: "user", active: true },
  { id: "u-3", name: "Malata Fireheart", email: "malata@coppermind.dev", photo: "dustbringers.svg", role: "user", active: true },
  { id: "u-4", name: "Lift Mistwalker", email: "lift@coppermind.dev", photo: "edgedancers.svg", role: "user", active: true },
  { id: "u-5", name: "Renarin Kholin", email: "renarin@coppermind.dev", photo: "truthwatchers.svg", role: "user", active: true },
  { id: "u-6", name: "Shallan Davar", email: "shallan@coppermind.dev", photo: "lightweavers.svg", role: "user", active: true },
  { id: "u-7", name: "Jasnah Kholin", email: "jasnah@coppermind.dev", photo: "elsecallers.svg", role: "author", active: true },
  { id: "u-8", name: "Venli Listener", email: "venli@coppermind.dev", photo: "willshapers.svg", role: "user", active: true },
  { id: "u-9", name: "Sigzil Truthborn", email: "sigzil@coppermind.dev", photo: "stonewards.svg", role: "user", active: true },
  { id: "u-10", name: "Dalinar Kholin", email: "dalinar@coppermind.dev", photo: "bondsmiths.svg", role: "admin", active: true },
];

export const getUser = (id: string) => USERS.find((u) => u.id === id)!;
export const currentUser = () => getUser(CURRENT_USER_ID);

// ---------- Books (20) ----------

// coverImage stores a hex color - the <BookCover/> renders a stylized block from it.

export const BOOKS: Book[] = [
  { id: "b-1", title: "Piranesi", author: "Susanna Clarke", genres: ["Fiction", "Fantasy"], coverImage: "#2D4A3E", externalApiId: null },
  { id: "b-2", title: "The Overstory", author: "Richard Powers", genres: ["Fiction", "Literary"], coverImage: "#7A5C2E", externalApiId: null },
  { id: "b-3", title: "Babel", author: "R.F. Kuang", genres: ["Fantasy", "Historical"], coverImage: "#4A3763", externalApiId: null },
  { id: "b-4", title: "The Pale Observer", author: "Elena Morrow", genres: ["Mystery", "Fiction"], coverImage: "#1E3A5F", externalApiId: null },
  { id: "b-5", title: "Ink and Salt", author: "Harun Ayaz", genres: ["Fiction", "Historical"], coverImage: "#923B2E", externalApiId: null },
  { id: "b-6", title: "North of Memory", author: "Ines Vargas", genres: ["Memoir"], coverImage: "#3B5F7A", externalApiId: null },
  { id: "b-7", title: "The Cartographer's Wife", author: "Mireille Dubois", genres: ["Fiction", "Historical"], coverImage: "#8A4158", externalApiId: null },
  { id: "b-8", title: "A Slow, Measured Fire", author: "Tomas Reyna", genres: ["Fiction"], coverImage: "#7A2E28", externalApiId: null },
  { id: "b-9", title: "Small Mercies", author: "Dennis Lehane", genres: ["Mystery", "Fiction"], coverImage: "#4A3763", externalApiId: null },
  { id: "b-10", title: "The Light Eaters", author: "Zoe Schlanger", genres: ["Non-fiction", "Science"], coverImage: "#2D4A3E", externalApiId: null },
  { id: "b-11", title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", genres: ["Fiction", "Literary"], coverImage: "#8A6A2E", externalApiId: null },
  { id: "b-12", title: "Lessons in Chemistry", author: "Bonnie Garmus", genres: ["Fiction", "Historical"], coverImage: "#8E5670", externalApiId: null },
  { id: "b-13", title: "Sea of Tranquility", author: "Emily St. John Mandel", genres: ["Fiction", "Sci-fi & Fantasy"], coverImage: "#1E3A5F", externalApiId: null },
  { id: "b-14", title: "The Bee Sting", author: "Paul Murray", genres: ["Fiction"], coverImage: "#7A5C2E", externalApiId: null },
  { id: "b-15", title: "Trust", author: "Hernan Diaz", genres: ["Fiction", "Historical"], coverImage: "#2D4A3E", externalApiId: null },
  { id: "b-16", title: "The Seven Moons of Maali Almeida", author: "Shehan Karunatilaka", genres: ["Fiction"], coverImage: "#923B2E", externalApiId: null },
  { id: "b-17", title: "Wandering Stars", author: "Tommy Orange", genres: ["Fiction"], coverImage: "#4A3763", externalApiId: null },
  { id: "b-18", title: "Birnam Wood", author: "Eleanor Catton", genres: ["Mystery", "Fiction"], coverImage: "#3B5F7A", externalApiId: null },
  { id: "b-19", title: "Hollow Kingdom", author: "Kira Jane Buxton", genres: ["Fiction", "Sci-fi & Fantasy"], coverImage: "#8A4158", externalApiId: null },
  { id: "b-20", title: "The Unseen Shore", author: "Aran Kavani", genres: ["Poetry"], coverImage: "#8A6A2E", externalApiId: null },
];

export const getBook = (id: string) => BOOKS.find((b) => b.id === id)!;

// ---------- UserBooks (current user's shelf) ----------

export const USER_BOOKS: UserBook[] = [
  { id: "ub-1", progress: "READING", isPrivate: false, createdAt: "2026-03-01T12:00:00Z", progressUpdatedAt: "2026-04-14T09:00:00Z", userId: "u-1", bookId: "b-1" },
  { id: "ub-2", progress: "READING", isPrivate: true, createdAt: "2026-03-10T12:00:00Z", progressUpdatedAt: "2026-04-10T09:00:00Z", userId: "u-1", bookId: "b-13" },
  { id: "ub-3", progress: "READ", isPrivate: false, createdAt: "2026-01-15T12:00:00Z", progressUpdatedAt: "2026-02-28T09:00:00Z", userId: "u-1", bookId: "b-2" },
  { id: "ub-4", progress: "READ", isPrivate: false, createdAt: "2025-12-02T12:00:00Z", progressUpdatedAt: "2026-01-20T09:00:00Z", userId: "u-1", bookId: "b-11" },
  { id: "ub-5", progress: "READ", isPrivate: false, createdAt: "2025-11-01T12:00:00Z", progressUpdatedAt: "2025-12-05T09:00:00Z", userId: "u-1", bookId: "b-15" },
  { id: "ub-6", progress: "WANT_TO_READ", isPrivate: false, createdAt: "2026-04-01T12:00:00Z", progressUpdatedAt: null, userId: "u-1", bookId: "b-3" },
  { id: "ub-7", progress: "WANT_TO_READ", isPrivate: false, createdAt: "2026-04-05T12:00:00Z", progressUpdatedAt: null, userId: "u-1", bookId: "b-5" },
  { id: "ub-8", progress: "WANT_TO_READ", isPrivate: true, createdAt: "2026-04-10T12:00:00Z", progressUpdatedAt: null, userId: "u-1", bookId: "b-9" },
  { id: "ub-9", progress: "WANT_TO_READ", isPrivate: false, createdAt: "2026-04-12T12:00:00Z", progressUpdatedAt: null, userId: "u-1", bookId: "b-14" },
  { id: "ub-10", progress: "READ", isPrivate: false, createdAt: "2025-09-12T12:00:00Z", progressUpdatedAt: "2025-10-28T09:00:00Z", userId: "u-1", bookId: "b-16" },
  { id: "ub-11", progress: "READ", isPrivate: false, createdAt: "2025-08-02T12:00:00Z", progressUpdatedAt: "2025-09-01T09:00:00Z", userId: "u-1", bookId: "b-6" },
  { id: "ub-12", progress: "READ", isPrivate: true, createdAt: "2025-07-12T12:00:00Z", progressUpdatedAt: "2025-08-01T09:00:00Z", userId: "u-1", bookId: "b-12" },
];

export const getUserBook = (id: string) => USER_BOOKS.find((ub) => ub.id === id)!;

export function userBooksWithBook(userId: string = CURRENT_USER_ID): UserBookWithBook[] {
  return USER_BOOKS.filter((ub) => ub.userId === userId).map((ub) => ({
    ...ub,
    book: getBook(ub.bookId),
    customDataCount: CUSTOM_DATA.filter((c) => c.userBookId === ub.id).length,
  }));
}

// ---------- CustomData (the hero feature) ----------

export const CUSTOM_DATA: CustomData[] = [
  {
    id: "cd-1",
    title: "On unreliable narrators",
    content:
      "The thing I keep coming back to is how the narrator never technically lies, but the framing makes truth feel like a loose suggestion. Everything they describe is accurate; the architecture is real, the tides are real, the Other is real. And yet.\n\nWhat I find striking is the way Clarke writes memory as a kind of tidepool - the tides come in and erase, then recede, and whatever was left behind on the floor of the mind is all that remains to be sure of.\n\nI spent half the book assuming this was a fantasy about a beautiful labyrinth. The other half it dawned on me: this is a horror novel, disguised as contentment. The narrator's peace is the worst part.\n\nStill, I loved it. Maybe because of that.",
    isPrivate: false,
    createdAt: "2026-04-14T10:00:00Z",
    updatedAt: "2026-04-14T10:00:00Z",
    userId: "u-1",
    userBookId: "ub-1",
  },
  {
    id: "cd-2",
    title: "A line I keep returning to",
    content:
      "\"The Beauty of the House is immeasurable; its Kindness infinite.\"\n\nIt reads like liturgy. Like something a monk would say at morning prayer. And that's the trick - it's a belief system, and we are inside it before we realize we joined.",
    isPrivate: false,
    createdAt: "2026-04-10T10:00:00Z",
    updatedAt: null,
    userId: "u-1",
    userBookId: "ub-1",
  },
  {
    id: "cd-3",
    title: "Chapter 7 - thoughts while reading",
    content:
      "The shift from the Halls to the upper floors is where the book changes shape. Up until here it's been a meditation; after, it's a puzzle.\n\nI noticed I started taking notes more frantically. Before: slow, appreciative. After: investigative. Clarke is playing with the reader's attention the same way the labyrinth plays with the narrator's.",
    isPrivate: true,
    createdAt: "2026-04-05T10:00:00Z",
    updatedAt: null,
    userId: "u-1",
    userBookId: "ub-1",
  },
  {
    id: "cd-4",
    title: "Questions for book club",
    content:
      "1. When does Piranesi stop being Piranesi?\n2. Is the House a trap or a gift?\n3. Does the ending feel like a rescue or a theft?\n4. What would you choose?\n5. Would you remember, if you had to?",
    isPrivate: false,
    createdAt: "2026-04-02T10:00:00Z",
    updatedAt: null,
    userId: "u-1",
    userBookId: "ub-1",
  },
  {
    id: "cd-5",
    title: "On trees as characters",
    content: "Powers writes trees the way most authors write their most careful, most wounded protagonists. The redwoods have motive.",
    isPrivate: false,
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: null,
    userId: "u-1",
    userBookId: "ub-3",
  },
  {
    id: "cd-6",
    title: "Structure",
    content: "Roots / Trunk / Crown / Seeds - the novel's four-part structure is telling you how to read it before the words even start. I missed that until halfway through.",
    isPrivate: false,
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: null,
    userId: "u-1",
    userBookId: "ub-3",
  },
  {
    id: "cd-7",
    title: "Reread notes",
    content: "Second read this year. What I missed the first time: how much tenderness is hidden under the satire. Zevin's characters are cruel to each other, then generous, then cruel again - like actual people.",
    isPrivate: false,
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: null,
    userId: "u-1",
    userBookId: "ub-4",
  },
  {
    id: "cd-8",
    title: "Quotes worth keeping",
    content: "\"You can't have love without grief\" - simple line. Doing all the work.",
    isPrivate: false,
    createdAt: "2025-12-28T10:00:00Z",
    updatedAt: null,
    userId: "u-1",
    userBookId: "ub-4",
  },
];

export function customDataForUserBook(userBookId: string) {
  return CUSTOM_DATA.filter((cd) => cd.userBookId === userBookId);
}

// ---------- Friend connections ----------

export const FRIEND_CONNECTIONS: FriendConnection[] = [
  { id: "f-1", status: "ACCEPTED", createdAt: "2026-01-10T10:00:00Z", requesterId: "u-1", addresseeId: "u-2" },
  { id: "f-2", status: "ACCEPTED", createdAt: "2026-01-12T10:00:00Z", requesterId: "u-3", addresseeId: "u-1" },
  { id: "f-3", status: "ACCEPTED", createdAt: "2026-02-05T10:00:00Z", requesterId: "u-1", addresseeId: "u-4" },
  { id: "f-4", status: "ACCEPTED", createdAt: "2026-02-14T10:00:00Z", requesterId: "u-5", addresseeId: "u-1" },
  { id: "f-5", status: "ACCEPTED", createdAt: "2026-03-01T10:00:00Z", requesterId: "u-1", addresseeId: "u-6" },
  { id: "f-6", status: "ACCEPTED", createdAt: "2026-03-15T10:00:00Z", requesterId: "u-7", addresseeId: "u-1" },
  { id: "f-7", status: "PENDING", createdAt: "2026-04-18T10:00:00Z", requesterId: "u-8", addresseeId: "u-1" },
  { id: "f-8", status: "PENDING", createdAt: "2026-04-19T10:00:00Z", requesterId: "u-9", addresseeId: "u-1" },
  { id: "f-9", status: "PENDING", createdAt: "2026-04-20T10:00:00Z", requesterId: "u-1", addresseeId: "u-10" },
];

export function friendsOf(userId: string = CURRENT_USER_ID): User[] {
  return FRIEND_CONNECTIONS.filter(
    (f) => f.status === "ACCEPTED" && (f.requesterId === userId || f.addresseeId === userId),
  ).map((f) => getUser(f.requesterId === userId ? f.addresseeId : f.requesterId));
}

export function pendingIncoming(userId: string = CURRENT_USER_ID) {
  return FRIEND_CONNECTIONS.filter((f) => f.status === "PENDING" && f.addresseeId === userId).map((f) => ({
    connection: f,
    user: getUser(f.requesterId),
  }));
}

export function pendingOutgoing(userId: string = CURRENT_USER_ID) {
  return FRIEND_CONNECTIONS.filter((f) => f.status === "PENDING" && f.requesterId === userId).map((f) => ({
    connection: f,
    user: getUser(f.addresseeId),
  }));
}

export function mutualFriendsCount(otherUserId: string, viewerId: string = CURRENT_USER_ID): number {
  const mine = new Set(friendsOf(viewerId).map((f) => f.id));
  return friendsOf(otherUserId).filter((f) => mine.has(f.id)).length;
}

// ---------- Conversations / Messages ----------

export const CONVERSATIONS: Conversation[] = [
  { id: "c-1", createdAt: "2026-04-20T09:00:00Z" },
  { id: "c-2", createdAt: "2026-04-18T14:00:00Z" },
  { id: "c-3", createdAt: "2026-04-15T18:00:00Z" },
  { id: "c-4", createdAt: "2026-04-10T11:00:00Z" },
  { id: "c-5", createdAt: "2026-04-05T20:00:00Z" },
  { id: "c-6", createdAt: "2026-03-30T11:00:00Z" },
];

// Schema is many-to-many but the UI assumes 1-on-1 chats for now,
// so this map gives us "the other person" per conversation without
// having to query ConversationParticipant. Drop this once group chat lands.
const CONVO_OTHER: Record<string, string> = {
  "c-1": "u-2",
  "c-2": "u-6",
  "c-3": "u-3",
  "c-4": "u-4",
  "c-5": "u-5",
  "c-6": "u-7",
};

export const MESSAGES: Message[] = [
  // Conversation c-1 - with u-2 (active thread about Piranesi)
  { id: "m-1", text: "just finished Piranesi", createdAt: "2026-04-20T09:00:00Z", userId: "u-1", conversationId: "c-1" },
  { id: "m-2", text: "and??", createdAt: "2026-04-20T09:02:00Z", userId: "u-2", conversationId: "c-1" },
  { id: "m-3", text: "it wrecked me.", createdAt: "2026-04-20T09:02:30Z", userId: "u-1", conversationId: "c-1" },
  { id: "m-4", text: "the ending??", createdAt: "2026-04-20T09:03:00Z", userId: "u-2", conversationId: "c-1" },
  { id: "m-5", text: "the whole thing. the way Clarke makes peace feel ominous", createdAt: "2026-04-20T09:03:45Z", userId: "u-1", conversationId: "c-1" },
  { id: "m-6", text: "YES", createdAt: "2026-04-20T09:04:00Z", userId: "u-2", conversationId: "c-1" },
  { id: "m-7", text: "that's the trick of it", createdAt: "2026-04-20T09:04:15Z", userId: "u-2", conversationId: "c-1" },
  { id: "m-8", text: "I want to reread it already", createdAt: "2026-04-20T09:05:00Z", userId: "u-1", conversationId: "c-1" },
  { id: "m-9", text: "same. it's the kind of book that gets bigger on the second pass", createdAt: "2026-04-20T09:05:30Z", userId: "u-2", conversationId: "c-1" },
  { id: "m-10", text: "wait - did you take notes?", createdAt: "2026-04-20T09:06:00Z", userId: "u-2", conversationId: "c-1" },
  { id: "m-11", text: "pages of them. I'll share the public ones", createdAt: "2026-04-20T09:06:30Z", userId: "u-1", conversationId: "c-1" },
  { id: "m-12", text: "please. I've been waiting for a reading partner on this one", createdAt: "2026-04-20T09:07:00Z", userId: "u-2", conversationId: "c-1" },
  // c-2 - Shallan
  { id: "m-13", text: "you reading anything new?", createdAt: "2026-04-18T14:00:00Z", userId: "u-6", conversationId: "c-2" },
  { id: "m-14", text: "sea of tranquility. loving it", createdAt: "2026-04-18T14:15:00Z", userId: "u-1", conversationId: "c-2" },
  // c-3 - Malata
  { id: "m-15", text: "book club this week?", createdAt: "2026-04-15T18:00:00Z", userId: "u-3", conversationId: "c-3" },
  { id: "m-16", text: "in. what are we reading", createdAt: "2026-04-15T18:30:00Z", userId: "u-1", conversationId: "c-3" },
  // c-4 - Lift
  { id: "m-17", text: "i have a recommendation for you", createdAt: "2026-04-10T11:00:00Z", userId: "u-4", conversationId: "c-4" },
  // c-5 - Renarin
  { id: "m-18", text: "thanks for the Babel rec", createdAt: "2026-04-05T20:00:00Z", userId: "u-5", conversationId: "c-5" },
  // c-6 - Jasnah
  { id: "m-19", text: "did you finish the chapter?", createdAt: "2026-03-30T11:00:00Z", userId: "u-7", conversationId: "c-6" },
];

export function conversationPreviews(): ConversationPreview[] {
  return CONVERSATIONS.map((c) => {
    const otherId = CONVO_OTHER[c.id];
    const messages = MESSAGES.filter((m) => m.conversationId === c.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      id: c.id,
      other: { id: otherId, name: getUser(otherId).name, photo: getUser(otherId).photo },
      lastMessage: messages[0] ?? null,
    };
  }).sort((a, b) => (b.lastMessage?.createdAt ?? "").localeCompare(a.lastMessage?.createdAt ?? ""));
}

export function messagesFor(conversationId: string): Message[] {
  return MESSAGES.filter((m) => m.conversationId === conversationId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function conversationOther(conversationId: string) {
  const otherId = CONVO_OTHER[conversationId];
  return otherId ? getUser(otherId) : null;
}

// ---------- Discussions / Comments / Likes ----------

export const DISCUSSIONS: Discussion[] = [
  {
    id: "d-1",
    title: "The case for rereading",
    description:
      "I used to think rereading was wasted time - all those unread books still on the shelf. Lately I've been rereading more, and finding myself more patient with the text, less hungry to finish. Anyone else?",
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-04-20T18:00:00Z",
    creatorId: "u-7",
  },
  {
    id: "d-2",
    title: "Why do we hate 3-star reviews?",
    description: "A 3-star review is the most honest grade you can give a competent, readable, forgettable book. And yet everyone writes like it's 1 or 5.",
    createdAt: "2026-04-18T12:00:00Z",
    updatedAt: "2026-04-19T09:00:00Z",
    creatorId: "u-6",
  },
  {
    id: "d-3",
    title: "Best dystopian novels of the decade?",
    description: "Starting a list. Currently: Sea of Tranquility, The Memory Police, Station Eleven. What am I missing?",
    createdAt: "2026-04-15T17:00:00Z",
    updatedAt: "2026-04-19T14:00:00Z",
    creatorId: "u-10",
  },
  {
    id: "d-4",
    title: "Book you almost DNF'd but loved",
    description: "Babel. I put it down twice. Third time I finally committed past page 120, and then couldn't stop.",
    createdAt: "2026-04-12T09:00:00Z",
    updatedAt: "2026-04-15T11:00:00Z",
    creatorId: "u-3",
  },
  {
    id: "d-5",
    title: "Translated fiction recommendations",
    description: "Looking for recent translated work - last 5 years, any language. Especially short story collections.",
    createdAt: "2026-04-08T14:00:00Z",
    updatedAt: "2026-04-10T10:00:00Z",
    creatorId: "u-5",
  },
  {
    id: "d-6",
    title: "What makes a prologue work?",
    description: "Half the time I skip them and don't feel I missed anything. But a great prologue can reset the whole book.",
    createdAt: "2026-04-04T11:00:00Z",
    updatedAt: "2026-04-04T18:00:00Z",
    creatorId: "u-1",
  },
  {
    id: "d-7",
    title: "Quiet books",
    description: "Books where not much happens but you can't put them down. Recs welcome.",
    createdAt: "2026-03-30T10:00:00Z",
    updatedAt: "2026-04-02T09:00:00Z",
    creatorId: "u-4",
  },
  {
    id: "d-8",
    title: "Are you team footnotes or team no-footnotes?",
    description: "I love them. But I know they're divisive. Defend your side.",
    createdAt: "2026-03-22T13:00:00Z",
    updatedAt: "2026-03-25T08:00:00Z",
    creatorId: "u-2",
  },
];

export const getDiscussion = (id: string) => DISCUSSIONS.find((d) => d.id === id)!;

export const COMMENTS: Comment[] = [
  { id: "cm-1", content: "Yes. The third time I read Middlemarch was the first time I actually read it.", createdAt: "2026-04-20T11:00:00Z", userId: "u-6", discussionId: "d-1" },
  { id: "cm-2", content: "I reread The Left Hand of Darkness every few years and it's a different book each time. Maybe I'm the one changing.", createdAt: "2026-04-20T12:00:00Z", userId: "u-2", discussionId: "d-1" },
  { id: "cm-3", content: "Counter: reading time is finite. I'd rather hit something new.", createdAt: "2026-04-20T13:00:00Z", userId: "u-10", discussionId: "d-1" },
  { id: "cm-4", content: "Finite, sure. But hitting something new isn't automatically more valuable than going deeper on something you already love.", createdAt: "2026-04-20T13:30:00Z", userId: "u-7", discussionId: "d-1" },
  { id: "cm-5", content: "I've started keeping notes specifically BECAUSE of rereads. My past self left me a trail and I'm glad for it.", createdAt: "2026-04-20T16:00:00Z", userId: "u-1", discussionId: "d-1" },
  { id: "cm-6", content: "Three stars means 'yeah, it was fine' and the culture around reviewing has decided fine is a kind of insult.", createdAt: "2026-04-18T14:00:00Z", userId: "u-5", discussionId: "d-2" },
  { id: "cm-7", content: "Most books are fine. Most meals are fine. Most films are fine. Fine is the honest median.", createdAt: "2026-04-19T08:00:00Z", userId: "u-1", discussionId: "d-2" },
  { id: "cm-8", content: "The Memory Police is on your list - try The Hole by Hye-young Pyun next.", createdAt: "2026-04-16T10:00:00Z", userId: "u-6", discussionId: "d-3" },
  { id: "cm-9", content: "Severance by Ling Ma should be on any list like this.", createdAt: "2026-04-17T09:00:00Z", userId: "u-3", discussionId: "d-3" },
  { id: "cm-10", content: "I DNF'd Babel at 80 pages and felt guilty for months. Still haven't gone back.", createdAt: "2026-04-13T10:00:00Z", userId: "u-6", discussionId: "d-4" },
];

export function commentsFor(discussionId: string): CommentWithUser[] {
  return COMMENTS.filter((c) => c.discussionId === discussionId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((c) => ({ ...c, user: { id: c.userId, name: getUser(c.userId).name, photo: getUser(c.userId).photo } }));
}

export const LIKES: Like[] = [
  ...Array.from({ length: 12 }).map((_, i) => ({ id: `l-1-${i}`, createdAt: "2026-04-20T13:00:00Z", userId: `u-${(i % 9) + 2}`, discussionId: "d-1" })),
  ...Array.from({ length: 8 }).map((_, i) => ({ id: `l-2-${i}`, createdAt: "2026-04-18T14:00:00Z", userId: `u-${(i % 9) + 2}`, discussionId: "d-2" })),
  ...Array.from({ length: 24 }).map((_, i) => ({ id: `l-3-${i}`, createdAt: "2026-04-15T18:00:00Z", userId: `u-${(i % 9) + 2}`, discussionId: "d-3" })),
  ...Array.from({ length: 6 }).map((_, i) => ({ id: `l-4-${i}`, createdAt: "2026-04-12T10:00:00Z", userId: `u-${(i % 9) + 2}`, discussionId: "d-4" })),
  ...Array.from({ length: 4 }).map((_, i) => ({ id: `l-5-${i}`, createdAt: "2026-04-09T10:00:00Z", userId: `u-${(i % 9) + 2}`, discussionId: "d-5" })),
  ...Array.from({ length: 9 }).map((_, i) => ({ id: `l-6-${i}`, createdAt: "2026-04-04T12:00:00Z", userId: `u-${(i % 9) + 2}`, discussionId: "d-6" })),
  ...Array.from({ length: 17 }).map((_, i) => ({ id: `l-7-${i}`, createdAt: "2026-03-31T10:00:00Z", userId: `u-${(i % 9) + 2}`, discussionId: "d-7" })),
];

export function discussionWithCounts(d: Discussion): DiscussionWithCounts {
  return {
    ...d,
    creator: { id: d.creatorId, name: getUser(d.creatorId).name, photo: getUser(d.creatorId).photo },
    commentCount: COMMENTS.filter((c) => c.discussionId === d.id).length,
    likeCount: LIKES.filter((l) => l.discussionId === d.id).length,
  };
}

export function allDiscussions(): DiscussionWithCounts[] {
  return DISCUSSIONS.map(discussionWithCounts);
}

// ---------- Recommendations (derived: books friends shelve that I don't have) ----------

// Cheap "you might like" algorithm:
//   1. score each book by how many of my friends have it on their shelf
//   2. exclude books I already have
//   3. fall back to random catalog books if friends haven't shelved enough
// Real implementation will likely live in the backend; this is just for design.
export function recommendedBooks(count = 4): { book: Book; reason: string; friendAvatars: string[] }[] {
  const myShelfIds = new Set(USER_BOOKS.filter((ub) => ub.userId === CURRENT_USER_ID).map((ub) => ub.bookId));
  const friendIds = new Set(friendsOf().map((f) => f.id));

  const scores = new Map<string, { count: number; friendIds: Set<string> }>();
  for (const ub of USER_BOOKS) {
    if (!friendIds.has(ub.userId)) continue;
    if (myShelfIds.has(ub.bookId)) continue;
    const s = scores.get(ub.bookId) ?? { count: 0, friendIds: new Set() };
    s.count += 1;
    s.friendIds.add(ub.userId);
    scores.set(ub.bookId, s);
  }

  // If nothing's popular among friends (small dummy set), fill with books not on my shelf
  const fromFriends = [...scores.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([bookId, s]) => ({
      book: getBook(bookId),
      reason: s.count > 1 ? `${s.count} friends have this` : "Popular with a friend",
      friendAvatars: [...s.friendIds].slice(0, 3).map((id) => getUser(id).photo),
    }));

  const filler = BOOKS.filter((b) => !myShelfIds.has(b.id) && !scores.has(b.id)).map((b) => ({
    book: b,
    reason: "New in the catalog",
    friendAvatars: [] as string[],
  }));

  return [...fromFriends, ...filler].slice(0, count);
}

// ---------- Feed items ----------

export const FEED_ITEMS: FeedItem[] = [
  {
    id: "fi-1",
    kind: "finished_book",
    user: { id: "u-6", name: "Shallan Davar", photo: "lightweavers.svg" },
    createdAt: "2026-04-20T09:30:00Z",
    book: { id: "b-1", title: "Piranesi", author: "Susanna Clarke", coverImage: "#2D4A3E" },
  },
  {
    id: "fi-2",
    kind: "new_discussion",
    user: { id: "u-10", name: "Dalinar Kholin", photo: "bondsmiths.svg" },
    createdAt: "2026-04-20T08:00:00Z",
    discussion: { id: "d-3", title: "Best dystopian novels of the decade?", description: "Starting a list. Currently: Sea of Tranquility, The Memory Police, Station Eleven. What am I missing?", commentCount: 14, likeCount: 24 },
  },
  {
    id: "fi-3",
    kind: "started_reading",
    user: { id: "u-4", name: "Lift Mistwalker", photo: "edgedancers.svg" },
    createdAt: "2026-04-19T15:00:00Z",
    book: { id: "b-3", title: "Babel", author: "R.F. Kuang", coverImage: "#4A3763" },
  },
  {
    id: "fi-4",
    kind: "public_note",
    user: { id: "u-1", name: "Kal Stormblessed", photo: "windrunners.svg" },
    createdAt: "2026-04-19T10:00:00Z",
    book: { id: "b-1", title: "Piranesi", author: "Susanna Clarke", coverImage: "#2D4A3E" },
    note: { id: "cd-1", title: "On unreliable narrators", content: "The thing I keep coming back to is how the narrator never technically lies, but the framing makes truth feel like a loose suggestion." },
  },
  {
    id: "fi-5",
    kind: "discussion_comment",
    user: { id: "u-2", name: "Szeth Vallano", photo: "skybreakers.svg" },
    createdAt: "2026-04-19T08:00:00Z",
    discussion: { id: "d-1", title: "The case for rereading", description: "" },
    commentExcerpt: "I reread The Left Hand of Darkness every few years and it's a different book each time. Maybe I'm the one changing.",
  },
  {
    id: "fi-6",
    kind: "wants_to_read",
    user: { id: "u-3", name: "Malata Fireheart", photo: "dustbringers.svg" },
    createdAt: "2026-04-18T13:00:00Z",
    book: { id: "b-15", title: "Trust", author: "Hernan Diaz", coverImage: "#2D4A3E" },
  },
  {
    id: "fi-7",
    kind: "finished_book",
    user: { id: "u-7", name: "Jasnah Kholin", photo: "elsecallers.svg" },
    createdAt: "2026-04-18T10:00:00Z",
    book: { id: "b-2", title: "The Overstory", author: "Richard Powers", coverImage: "#7A5C2E" },
  },
  {
    id: "fi-8",
    kind: "started_reading",
    user: { id: "u-5", name: "Renarin Kholin", photo: "truthwatchers.svg" },
    createdAt: "2026-04-17T19:00:00Z",
    book: { id: "b-11", title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", coverImage: "#8A6A2E" },
  },
  {
    id: "fi-9",
    kind: "wants_to_read",
    user: { id: "u-6", name: "Shallan Davar", photo: "lightweavers.svg" },
    createdAt: "2026-04-17T14:00:00Z",
    book: { id: "b-16", title: "The Seven Moons of Maali Almeida", author: "Shehan Karunatilaka", coverImage: "#923B2E" },
  },
  {
    id: "fi-10",
    kind: "public_note",
    user: { id: "u-4", name: "Lift Mistwalker", photo: "edgedancers.svg" },
    createdAt: "2026-04-16T11:00:00Z",
    book: { id: "b-2", title: "The Overstory", author: "Richard Powers", coverImage: "#7A5C2E" },
    note: { id: "cd-ext-1", title: "Trees as witnesses", content: "Powers wants you to slow down until you can hear the forest thinking. It works, eventually." },
  },
];
