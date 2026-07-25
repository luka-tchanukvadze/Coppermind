import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { createUser, makeFriends } from "../helpers/auth.js";

// These test what a user is allowed to do. This kind of bug is quiet. Nothing
// crashes, it just lets someone reach data that is not theirs. You cannot spot
// it by using your own account, because everything there is already yours.

describe("POST /api/v1/messages/:friendId", () => {
  // The important one. You can only message someone you are friends with. Without
  // this check, anyone could message a stranger just by knowing their id. It
  // returns 404, not 403, on purpose. A 403 would confirm that the user exists.
  it("refuses to send a message to someone who is not a friend", async () => {
    const alice = await createUser({ name: "Alice" });
    const bob = await createUser({ name: "Bob" });

    const res = await request(app)
      .post(`/api/v1/messages/${bob.id}`)
      .set("Cookie", alice.cookie)
      .send({ text: "hello stranger" });

    expect(res.status).toBe(404);
  });

  // The matching success case. An endpoint that blocked everything would also
  // pass the test above, so this proves it blocks based on friendship, and that
  // sending really works when they are friends.
  it("sends a message when the two users are friends", async () => {
    const alice = await createUser({ name: "Alice" });
    const bob = await createUser({ name: "Bob" });
    await makeFriends(alice.id, bob.id);

    const res = await request(app)
      .post(`/api/v1/messages/${bob.id}`)
      .set("Cookie", alice.cookie)
      .send({ text: "hello friend" });

    expect(res.status).toBe(201);
    expect(res.body.data.message.text).toBe("hello friend");
    expect(res.body.data.message.userId).toBe(alice.id); // the message belongs to the sender
  });
});

/*
  Could add later, not needed now:

  Ownership (only the owner can touch their own thing):
  - Unsending someone else's message returns 404.
  - Opening a conversation you are not part of returns 404.
  - Marking someone else's conversation as read returns 404.

  Input checks (cheap, handled by the schema):
  - Empty or spaces-only text is rejected.
  - Text longer than 2000 characters is rejected.
  - Messaging yourself is rejected.

  Paging older messages (the tricky one):
  - Two messages sent in the same millisecond still page correctly, with none
    skipped or shown twice. This is why the code sorts by time and id together.
  - Asking for older messages without a starting point returns 400.

  "Delete for me" (it only removes the thread for one person):
  - After Alice deletes it, it is gone from her list, still in Bob's list, and
    comes back for Alice when Bob sends a new message.

  Unfriending:
  - Sending fails, but the old messages can still be read.

  Left out on purpose: the live socket update on send. That needs a running
  server and a connected client, which is a heavier kind of test.
*/
