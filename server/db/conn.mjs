import { MongoClient } from "mongodb";

const connectionString = process.env.DATABASE_URL || "";

const client = new MongoClient(connectionString);

let conn;
try {
  conn = await client.connect();
  console.log('Connected to db');
} catch (e) {
  console.error(e);
}

let db = conn.db(process.env.DATABASE_NAME);

export default db;