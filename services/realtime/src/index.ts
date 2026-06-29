import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { initSocket } from "./socket.js";
import internalRoute from "./routes/internal.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/internal", internalRoute);

const server = http.createServer(app);
initSocket(server);

const port = process.env.PORT || 5004;

server.listen(port, () => {
  console.log(`Realtime service run at port ${port}`);
});
