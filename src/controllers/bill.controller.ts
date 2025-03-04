import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Bill } from "../entity/Bill";
import { Meter } from "../entity/Meter";

const billRepository = AppDataSource.getRepository(Bill);
const meterRepository = AppDataSource.getRepository(Meter);

export const getBillsByMeterId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { meterId } = req.params;

        if (!meterId) {
            res.status(400).json({ message: "Не вказано ID лічильника." });
            return;
        }

        const meter = await meterRepository.findOneBy({ id: Number(meterId) });
        if (!meter) {
            res.status(404).json({ message: "Meter not found" });
            return;
        }

        const bills = await billRepository.find({
            where: { meter: { id: Number(meterId) } },
            order: { generated_at: "DESC" }
        });

        res.status(200).json({ bills });
    } catch (error) {
        next(error);
    }
};
