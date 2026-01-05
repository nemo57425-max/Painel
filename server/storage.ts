import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  revenue,
  stats,
  materials,
  type InsertRevenue,
  type InsertStat,
  type InsertMaterial,
  type Revenue,
  type Stat,
  type Material
} from "@shared/schema";

export interface IStorage {
  getRevenue(): Promise<Revenue[]>;
  getStats(): Promise<Stat[]>;
  getMaterials(): Promise<Material[]>;
  getMaterialByCode(code: string): Promise<Material | undefined>;
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getRevenue(): Promise<Revenue[]> {
    return await db.select().from(revenue);
  }

  async getStats(): Promise<Stat[]> {
    return await db.select().from(stats);
  }

  async getMaterials(): Promise<Material[]> {
    return await db.select().from(materials);
  }

  async getMaterialByCode(code: string): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.code, code));
    return material;
  }

  async seedData(): Promise<void> {
    const materialCount = await db.select().from(materials);
    if (materialCount.length === 0) {
      const materialsData: InsertMaterial[] = [
        { type: 'BARRA CHATA', code: '10.01.0155', description: 'BARRA CHATA INOX 1" X 3/16"', currentBalance: 0, orderPoint: 0 },
        { type: 'BARRA CHATA', code: '10.01.0308', description: 'BARRA CHATA INOX 2" X 3/16"', currentBalance: 0, orderPoint: 0 },
        { type: 'BARRA CHATA', code: '10.03.0055', description: 'BARRA CHATA ACO CARBONO 1" X 3/16"', currentBalance: 0, orderPoint: 10 },
        { type: 'CANTONEIRA', code: '10.03.0065', description: 'CANTONEIRA ACO CARBONO SAE1020 1 X 1 X 1/8', currentBalance: 0, orderPoint: 0 },
        { type: 'VERGALHÃO', code: '10.02.0589', description: 'VERGALHAO INOX 201 1/2" (12.7MM)', currentBalance: 0, orderPoint: 0 },
        { type: 'TARUGO', code: '10.06.0019', description: 'TARUGO LATAO REDONDO 9/16 (14.29MM)', currentBalance: 0, orderPoint: 6 },
        { type: 'TUBO REDONDO', code: '0000004251', description: 'TUBO INOX 201 1.1/4 (31.75MM) ESP 1.00MM C/C POLIDO', currentBalance: 0, orderPoint: 26 },
        { type: 'TUBO QUADRADO', code: '0000008679', description: 'TUBO QUADRADO ACO CARBONO 15X15MM X ESP 1.0 MM', currentBalance: 10, orderPoint: 20 },
      ];
      await db.insert(materials).values(materialsData);
    }
    const revenueCount = await db.select().from(revenue);
    if (revenueCount.length === 0) {
      const revenueData: InsertRevenue[] = [
        { month: 'Jan', revenue: 1200, expenses: -2800 },
        { month: 'Feb', revenue: 2600, expenses: -1200 },
        { month: 'Mar', revenue: 1000, expenses: -2400 },
        { month: 'Apr', revenue: 3600, expenses: -1500 },
        { month: 'May', revenue: 2100, expenses: -2200 },
        { month: 'Jun', revenue: 2700, expenses: -1800 },
        { month: 'Jul', revenue: 2200, expenses: -1000 },
        { month: 'Aug', revenue: 1300, expenses: -2000 },
        { month: 'Sep', revenue: 2400, expenses: -1300 },
      ];
      await db.insert(revenue).values(revenueData);

      const statsData: InsertStat[] = [
        { label: 'Entradas de Material', value: '1.240 un', change: 12, trend: 'up', progress: 83 },
        { label: 'Itens em Uso', value: '458 un', change: 5, trend: 'up', progress: 0 },
        { label: 'Alertas de Estoque', value: '3 itens', change: -10, trend: 'down', progress: 0 },
        { label: 'Eficiência de Uso', value: '94%', change: 2, trend: 'up', progress: 94 },
      ];
      await db.insert(stats).values(statsData);
    }
  }
}

export const storage = new DatabaseStorage();
