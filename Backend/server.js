import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import priorityRoutes from "./routes/priorityRoutes.js";
import slaPolicyRoutes from "./routes/slaPolicyRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import knowledgeArticleRoutes from "./routes/knowledgeArticleRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import slaHeap from "./dsa/slaHeap.js";
import searchTrie from "./dsa/searchTrie.js";
import Ticket from "./models/Ticket.js";
import KnowledgeArticle from "./models/KnowledgeArticle.js";
import "./jobs/slaEscalationJob.js"; // schedules the cron job as a side effect on import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true, // Dynamically allows the requesting origin
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser()); // needed to read the refresh token cookie

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/priorities", priorityRoutes);
app.use("/api/sla-policies", slaPolicyRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/knowledge-articles", knowledgeArticleRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/search", searchRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await slaHeap.rebuildFromDB(Ticket);
    await searchTrie.rebuildFromDB(Ticket, KnowledgeArticle);
    console.log(`sla heap rebuilt: ${slaHeap.heap.length} open ticket(s) with a due date`);
  } catch (error) {
    console.warn("MongoDB not available; starting server without DB connection.");
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();