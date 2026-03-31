import test from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.js";
import { login, register } from "./authService.js";

test("register creates a new student with tokens", async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;

  try {
    User.findOne = async () => null;
    User.create = async (payload) => ({
      _id: "u1",
      name: payload.name,
      email: payload.email,
      role: payload.role,
      isBlocked: false
    });

    const result = await register({
      name: "Student One",
      email: "student1@example.com",
      password: "secret123"
    });

    assert.equal(result.user.email, "student1@example.com");
    assert.equal(result.user.role, "student");
    assert.ok(result.tokens.accessToken);
    assert.ok(result.tokens.refreshToken);
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  }
});

test("login rejects blocked users", async () => {
  const originalFindOne = User.findOne;

  try {
    User.findOne = async () => ({
      _id: "u2",
      email: "blocked@example.com",
      role: "student",
      isBlocked: true,
      comparePassword: async () => true
    });

    await assert.rejects(
      () =>
        login({
          email: "blocked@example.com",
          password: "secret123"
        }),
      /blocked/
    );
  } finally {
    User.findOne = originalFindOne;
  }
});
