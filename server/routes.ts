import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.dashboard.revenue.path, async (req, res) => {
    const data = await storage.getRevenue();
    res.json(data);
  });

  app.get(api.dashboard.stats.path, async (req, res) => {
    const data = await storage.getStats();
    res.json(data);
  });

  app.get("/api/materials", async (req, res) => {
    const data = await storage.getMaterials();
    res.json(data);
  });

  app.get("/api/materials/:code", async (req, res) => {
    const data = await storage.getMaterialByCode(req.params.code);
    if (!data) return res.status(404).json({ message: "Material não encontrado" });
    res.json(data);
  });

  // Seed data on startup
  await storage.seedData();

  return httpServer;
}
