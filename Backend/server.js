import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/priorities", priorityRoutes);
app.use("/api/sla-policies", slaPolicyRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/knowledge-articles", knowledgeArticleRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.warn("MongoDB not available; starting server without DB connection.");
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
