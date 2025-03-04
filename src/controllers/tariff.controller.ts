import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Tariff } from "../entity/Tariff";

export const getTariff = async (req: Request, res: Response): Promise<void> => {
    try {
        const tariffRepo = AppDataSource.getRepository(Tariff);
        const tariff = await tariffRepo.findOne({ where: { id: 1 } });

        if (!tariff) {
            res.status(404).json({ message: "Tariff not found" });
            return;
        }

        res.json(tariff);
    } catch (error) {
        console.error("Error fetching tariff:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

