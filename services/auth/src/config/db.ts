import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string, {
        dbName: "cravehub",
    });

    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error while connected with database", error);
  }
};

export default connectDB;
