import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Reading } from "../entity/Reading";
import { Tariff } from "../entity/Tariff";
import { Bill } from "../entity/Bill";
import { Meter } from "../entity/Meter";

const readingRepository = AppDataSource.getRepository(Reading);
const tariffRepository = AppDataSource.getRepository(Tariff);
const billRepository = AppDataSource.getRepository(Bill);
const meterRepository = AppDataSource.getRepository(Meter);

export const addReading = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { meterId, day_reading, night_reading } = req.body;

        if (!meterId || day_reading === undefined || night_reading === undefined) {
            res.status(400).json({ message: "Не всі обов'язкові дані вказані." });
            return;
        }

        const meter = await meterRepository.findOneBy({ id: Number(meterId) });
        if (!meter) {
            res.status(404).json({ message: "Meter not found" });
            return;
        }

        const lastReading = await readingRepository.findOne({
            where: { meter: { id: meterId } },
            order: { reading_date: "DESC" }
        });

        const tariff = await tariffRepository.findOne({ where: { id: 1 } });
        if (!tariff) {
            res.status(404).json({ message: "Tariff not found" });
            return;
        }

        let finalDayReading = day_reading;
        let finalNightReading = night_reading;
        let dayUsage = finalDayReading - (lastReading?.day_reading || 0);
        let nightUsage = finalNightReading - (lastReading?.night_reading || 0);

        if (lastReading) {
            if (day_reading < lastReading.day_reading) {
                finalDayReading = lastReading.day_reading + tariff.day_penalty;
                dayUsage = tariff.day_penalty;
            }
            if (night_reading < lastReading.night_reading) {
                finalNightReading = lastReading.night_reading + tariff.night_penalty;
                nightUsage = tariff.night_penalty;
            }
        }

        const dayPayment = dayUsage * tariff.day_rate;
        const nightPayment = nightUsage * tariff.night_rate;

        const totalAmount = dayPayment + nightPayment;

        const newReading = readingRepository.create({
            meter,
            day_reading: finalDayReading,
            night_reading: finalNightReading
        });
        await readingRepository.save(newReading);

        const newBill = billRepository.create({
            meter,
            amount: totalAmount
        });
        await billRepository.save(newBill);

        res.status(201).json({
            message: "Показники успішно додані.",
            reading: newReading,
            bill: newBill
        });

    } catch (error) {
        next(error);
    }
};

export const getReadingsByMeterId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { meterId } = req.params;

        if (!meterId) {
            res.status(400).json({ message: "Не вказано ID лічильника." });
            return;
        }

        const readings = await readingRepository.find({
            where: { meter: { id: Number(meterId) } },
            order: { reading_date: "DESC" }
        });

        res.status(200).json({ readings });
    } catch (error) {
        next(error);
    }
};
