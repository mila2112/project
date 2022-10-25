import * as fs from "fs";
import * as path from "path";
import * as redis from "redis";
import bluebird from "bluebird";
import { Sequelize } from "sequelize";
import dbConfig from "../configs";
type DB = {
  [key: string]: any;
  Squelize?: Sequelize;
};

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const baseName = path.basename(__filename);
const db: DB = {};

const sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.username,
  dbConfig.password,
  { dialect: dbConfig.dialect }
);

fs.readdirSync(__dirname)
  .filter(
    (file) => !file.startsWith(".") && file !== baseName && file.endsWith(".ts")
  )
  .forEach((file) => {
    const { getModel } = require(path.join(__dirname, file));
    const model = getModel(sequelize) as {
      findOne: () => {};
      name: string;
      lom: () => {};
    };
    db[model.name] = model;
  });
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize
  .authenticate()
  .then(() => console.log("database is connected"))
  .catch((err) => {
    throw err;
  });
db.Sequelize = sequelize;

const client = redis.createClient({
  socket: {
    host: "localhost",
    port: 6379
  },
});
client.on("ready", () => console.log("Redis: Connection ready redis"));
bluebird.promisifyAll(redis);
client.on("error", (err) => console.error("Redis: Connection error", err));
db.redis = client;
export default db;
