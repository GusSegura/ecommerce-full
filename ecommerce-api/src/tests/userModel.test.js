import mongoose from "mongoose";
import User from "../models/user.js";

beforeAll(async () => { 
    await mongoose.connect("mongodb://127.0.0.1:27017/testdb"); 
    await User.syncIndexes(); 
 });

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("User Model", () => {
  it("debería guardar un usuario válido", async () => {
    const user = new User({
      displayName: "Test User",
      email: "test@test.com",
      password: "123456",
      role: "customer",
      avatar: "https://placehold.co/100x100.png",
      phone: "1234567890",
      address: "Calle Falsa 123",
      city: "Aguascalientes",
      state: "AGS",
      postalCode: "20000"
    });

    const savedUser = await user.save();
    expect(savedUser.email).toBe("test@test.com");
    expect(savedUser.role).toBe("customer");
    expect(savedUser.isActive).toBe(true); // default
  });

  it("debería fallar si falta el email", async () => {
    const user = new User({
      displayName: "No Email User",
      password: "123456",
      role: "customer",
      avatar: "https://placehold.co/100x100.png",
      phone: "1234567890"
    });

    await expect(user.save()).rejects.toThrow();
  });

  it("no debería permitir emails duplicados", async () => {
    const user1 = new User({
      displayName: "Dup User",
      email: "dup@test.com",
      password: "123456",
      role: "customer",
      avatar: "https://placehold.co/100x100.png",
      phone: "1111111111"
    });
    await user1.save();

    const user2 = new User({
      displayName: "Dup User 2",
      email: "dup@test.com",
      password: "abcdef",
      role: "customer",
      avatar: "https://placehold.co/100x100.png",
      phone: "2222222222"
    });

    await expect(user2.save()).rejects.toThrow();
  });
});
