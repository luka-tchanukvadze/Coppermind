import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { createUser } from "../helpers/auth.js";

// These send real requests to the real app and the real test database. Nothing
// is faked. This works because app.ts gives us the app without starting a server
// (server.ts does that part), so the test tool can call it directly. The
// database is cleared before each test.

describe("POST /api/v1/users/signup", () => {
  it("creates a user, returns 201 and sets an httpOnly jwt cookie", async () => {
    const res = await request(app).post("/api/v1/users/signup").send({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
      password_confirm: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.safeUser.email).toBe("alice@example.com");
    // The password must never be sent back, not even the hashed version.
    expect(res.body.data.safeUser.password).toBeUndefined();

    // The cookie is httpOnly, so browser JavaScript cannot read the token.
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain("jwt=");
    expect(cookies[0]).toContain("HttpOnly");
  });
});

describe("POST /api/v1/users/login", () => {
  it("rejects a wrong password with 401", async () => {
    const user = await createUser({ password: "correct-password" });

    const res = await request(app).post("/api/v1/users/login").send({
      email: user.email,
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
    expect(res.headers["set-cookie"]).toBeUndefined(); // no login cookie when it fails
  });

  // This test guards a decision, not just code. Login must not tell you whether
  // an email is registered. If it did, someone could try a list of emails and
  // find out which ones have accounts. If a later change makes the "wrong
  // password" and "unknown email" replies look different, this test fails and
  // explains why they are the same on purpose.
  it("gives the SAME response for an unknown email as for a wrong password", async () => {
    const user = await createUser({ password: "correct-password" });

    const wrongPassword = await request(app)
      .post("/api/v1/users/login")
      .send({ email: user.email, password: "wrong-password" });

    const unknownEmail = await request(app)
      .post("/api/v1/users/login")
      .send({ email: "nobody@example.com", password: "correct-password" });

    expect(unknownEmail.status).toBe(wrongPassword.status);
    expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
  });
});

describe("protect middleware", () => {
  // Any protected route works to test the gate. The protect check is added per
  // route file, so it is easy to accidentally move a route above it and leave it
  // open to everyone. This test would catch that.
  it("rejects a request with no cookie with 401", async () => {
    const res = await request(app).get("/api/v1/users/me");
    expect(res.status).toBe(401);
  });

  it("allows the request when a valid jwt cookie is sent", async () => {
    const user = await createUser();

    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Cookie", user.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe(user.id);
  });
});

/*
  Could add later, not needed now:
  - An old token is rejected after the user changes their password.
  - A deactivated user (active is false) gets 401 even with a valid token.
  - A broken or expired token gets 401, not 500.
  - Signup with an email that already exists returns the vague message, not
    "email already taken".
  - Logout clears the cookie with the same flags it was set with.
  - forgotPassword. Note: the tests load the real .env, so a real send would use
    the real email account. Fake the mailer before adding this one.
  - The login rate limiter blocks the 11th try. This needs a real Redis running.
    Without it, the limiter lets everything through, so the test would pass for
    the wrong reason.
*/
