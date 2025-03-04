import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Meter } from "../entity/Meter";

const meterRepository = AppDataSource.getRepository(Meter);

export const getAllMeters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const meters = await meterRepository.find();
        res.status(200).json(meters);
    } catch (error) {
        next(error);
    }
};

export const getMeterById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const meter = await meterRepository.findOneBy({ id: Number(id) });

        if (!meter) {
            res.status(404).json({ message: "Meter not found" });
            return;
        }

        res.status(200).json(meter);
    } catch (error) {
        next(error);
    }
};

export const createMeter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const newMeter = meterRepository.create(req.body);
        const savedMeter = await meterRepository.save(newMeter);
        res.status(201).json(savedMeter);
    } catch (error) {
        next(error);
    }
};

export const updateMeter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const meter = await meterRepository.findOneBy({ id: Number(id) });

        if (!meter) {
            res.status(404).json({ message: "Meter not found" });
            return;
        }

        meterRepository.merge(meter, req.body);
        const updatedMeter = await meterRepository.save(meter);

        res.status(200).json(updatedMeter);
    } catch (error) {
        next(error);
    }
};

export const deleteMeter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const meter = await meterRepository.findOneBy({ id: Number(id) });

        if (!meter) {
            res.status(404).json({ message: "Meter not found" });
            return;
        }

        await meterRepository.remove(meter);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
