import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { createApp } from "../app.js";
import { beforeAll, afterAll, afterEach } from "vitest";
import dotenv from "dotenv";
dotenv.config();

export let app;
export let mongo;
export const sign = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || "testsecret");

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, { dbName: "paystreet_test" });
  app = createApp();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
