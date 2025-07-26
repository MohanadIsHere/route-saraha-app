import mongoose from "mongoose";

const connectToDatabase = async () => {
  
  await mongoose
    .connect("mongodb://127.0.0.1:27017/route-saraha-app")
    .then(() => {
      console.log("Connected to database successfully ✅");
    })
    .catch((error) => {
      console.log("Failed to connect to database", error);
    });
};
export default connectToDatabase
