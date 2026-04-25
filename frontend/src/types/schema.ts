// Mirrors the Prisma schema in backend/prisma/schema.prisma.
// Keep in sync manually; no generator wired up yet.

export type Role = "user" | "author" | "admin";
export type Progress = "WANT_TO_READ" | "READING" | "READ";
export type FriendStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
  role: Role;
  active: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genres: string[];
  coverImage: string;
  externalApiId?: string | null;
}

export interface UserBook {
  id: string;
  progress: Progress;
  isPrivate: boolean;
  createdAt: string;
  progressUpdatedAt?: string | null;
  userId: string;
  bookId: string;
}

export interface CustomData {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt?: string | null;
  userId: string;
  userBookId: string;
}

export interface FriendConnection {
  id: string;
  status: FriendStatus;
  createdAt: string;
  requesterId: string;
  addresseeId: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
}

export interface Message {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  conversationId: string;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
}

export interface Discussion {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  discussionId: string;
}

export interface Like {
  id: string;
  createdAt: string;
  userId: string;
  discussionId: string;
}

// ----- Composite view models used across UI -----

export interface UserBookWithBook extends UserBook {
  book: Book;
  customDataCount: number;
}

export interface FeedItem {
  id: string;
  kind:
    | "started_reading"
    | "finished_book"
    | "wants_to_read"
    | "new_discussion"
    | "discussion_comment"
    | "public_note";
  user: Pick<User, "id" | "name" | "photo">;
  createdAt: string;
  book?: Pick<Book, "id" | "title" | "author" | "coverImage">;
  discussion?: Pick<Discussion, "id" | "title" | "description"> & {
    commentCount?: number;
    likeCount?: number;
  };
  note?: Pick<CustomData, "id" | "title" | "content">;
  commentExcerpt?: string;
}

export interface ConversationPreview {
  id: string;
  other: Pick<User, "id" | "name" | "photo">;
  lastMessage: Pick<Message, "id" | "text" | "createdAt" | "userId"> | null;
}

export interface DiscussionWithCounts extends Discussion {
  creator: Pick<User, "id" | "name" | "photo">;
  commentCount: number;
  likeCount: number;
}

export interface CommentWithUser extends Comment {
  user: Pick<User, "id" | "name" | "photo">;
}
