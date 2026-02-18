import express from "express";
import prisma from "./db.js";

const app = express();

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

console.log("hey 1");
export default app;
