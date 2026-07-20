import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import riderRoutes from "./routes/rider.js";
import { connectRabbitMq } from "./config/rabbitmq.js";

dotenv.config();

await connectRabbitMq();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/rider", riderRoutes);

const port = process.env.PORT || 5005;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Realtime Service Running on ${port}`);
    });
  } catch (err) {
    process.exit(1);
  }
};

startServer();
