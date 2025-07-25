import mongoose from "mongoose";

const connectToDatabase = async () => {
  
  await mongoose
    .connect("mongodb://localhost:27017/route-saraha-app")
    .then(() => {
      console.log("Connected to database successfully ✅");
    })
    .catch((error) => {
      console.log("Failed to connect to database", error);
    });
};
export default connectToDatabase
