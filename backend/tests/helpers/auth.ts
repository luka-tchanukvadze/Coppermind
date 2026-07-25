import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/prisma.js";

// Small helpers that create test data, so each test stays short and easy to read.

// Give each new user a different email, because email has to be unique.
let counter = 0;
function uniqueEmail() {
  counter += 1;
  return `user${counter}.${Date.now()}@example.com`;
}

export type TestUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  // The login cookie from signup. Use it like: .set("Cookie", user.cookie)
  cookie: string;
};

// Make a user by calling the real signup endpoint, not by inserting a row
// directly. Signup is what hashes the password and hands back the login cookie.
// If this helper did that part itself, the tests could pass even when the real
// signup is broken. The fields here match the signup schema.
export async function createUser(
  overrides: { name?: string; email?: string; password?: string } = {},
): Promise<TestUser> {
  const name = overrides.name ?? "Test User";
  const email = overrides.email ?? uniqueEmail();
  const password = overrides.password ?? "password123"; // must be 8 to 72 chars

  const res = await request(app).post("/api/v1/users/signup").send({
    name,
    email,
    password,
    password_confirm: password,
  });

  // If signup failed, stop here with a clear message. Otherwise every test that
  // uses this helper would fail later for a confusing reason.
  if (res.status !== 201) {
    throw new Error(
      `createUser failed (${res.status}): ${JSON.stringify(res.body)}`,
    );
  }

  const setCookie = res.headers["set-cookie"] as unknown as string[] | undefined;
  if (!setCookie?.length) {
    throw new Error("createUser: signup returned no cookie");
  }

  const id = res.body?.data?.safeUser?.id as string | undefined;
  if (!id) {
    throw new Error(`createUser: no id in response: ${JSON.stringify(res.body)}`);
  }

  return { id, name, email, password, cookie: setCookie[0] };
}

// Make two users friends by writing the row directly. Here, being friends is
// just setup for the real test, not the thing we are testing. One accepted row
// means they are friends.
export async function makeFriends(userAId: string, userBId: string) {
  await prisma.friendConnection.create({
    data: { requesterId: userAId, addresseeId: userBId, status: "ACCEPTED" },
  });
}
