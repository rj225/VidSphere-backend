import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectdb = async () => {
  try {
    const connectiondb = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log(`DB Connected at host ${connectiondb.connection.host}`);
  } catch (error) {
    console.log("Error connecting to the database:", error);
  }
};

export default connectdb;
