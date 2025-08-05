import mongoose from "mongoose";
import { DB_URI } from "../config/env.js";

const connectToDatabase = async () => {
  
  await mongoose
    .connect(DB_URI)
    .then(() => {
      console.log("Connected to database successfully ✅");
    })
    .catch((error) => {
      console.log("Failed to connect to database", error);
    });
};
export default connectToDatabase
