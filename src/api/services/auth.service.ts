import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

import db from "../../db//models";

class AuthService {
  async getTokenFromRedis(key) {
    return await db.redis.getAsync(key);
  }

  async setTokenToRedis(key, payload, expiresIn) {
    db.redis.set(key, JSON.stringify(payload), "EX", expiresIn);
  }

  async signToken(payload, secretKey, expiresIn, keyName) {
    const token = await jwt.sign(payload, secretKey, { expiresIn });
    await this.setTokenToRedis(`${keyName}:${token}`, payload, expiresIn);
    return token;
  }

  async signAccessToken(payload) {
    return this.signToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      600,
      "accessToken"
    );
  }

  async signRefreshToken(payload) {
    return this.signToken(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      3600 * 24 * 120,
      "refreshToken"
    );
  }

  async verifyToken(token, secretKey) {
    return jwt.verify(token, secretKey);
  }

  async verifyAccessToken(token) {
    return this.verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
  }

  async verifyRefreshToken(token) {
    return this.verifyToken(token, process.env.REFRESH_TOKEN_SECRET);
  }

  async removeTokenFromRedis(key) {
    return db.redis.del(key);
  }
}

export = new AuthService();
