import { MongoClient, ServerApiVersion } from "mongodb";
import { env } from "~/config/environment";

let trelloDatabaseIntance = null;

// Create a new MongoClient instance to connect to MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//Connect to the database
export const CONNECT_DB = async () => {
  await mongoClientInstance.connect();
  trelloDatabaseIntance = mongoClientInstance.db(env.DATABASE_NAME);
};

// Close the database connection
export const CLOSE_DB = async () => {
  await mongoClientInstance.close();
};

//Get the database instance
export const GET_DB = () => {
  if (!trelloDatabaseIntance) {
    throw new Error("Database not initialized. Call CONNECT_DB first.");
  }
  return trelloDatabaseIntance;
};
