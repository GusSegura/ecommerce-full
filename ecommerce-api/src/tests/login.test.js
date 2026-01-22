import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js";   
import User from "../models/User.js";

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/testdb");
  await User.syncIndexes();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Login endpoint", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await User.create({
      displayName: "Test User",
      email: "login@test.com",
      password: "123456",
      role: "customer",
      avatar: "https://placehold.co/100x100.png",
      phone: "1234567890"
    });
  });

  it("debería loguear con credenciales correctas", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "login@test.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login exitoso");
  });

  it("debería fallar si el usuario no existe", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "noexiste@test.com", password: "123456" });

    expect(res.statusCode).toBe(400);
  });

  it("debería fallar si la contraseña es incorrecta", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "login@test.com", password: "wrongpass" });

    expect(res.statusCode).toBe(400);
  });
});
