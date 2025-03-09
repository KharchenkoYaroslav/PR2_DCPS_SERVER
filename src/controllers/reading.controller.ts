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
        console.log("Отримані дані:", { meterId, day_reading, night_reading });

        if (!meterId || day_reading === undefined || night_reading === undefined) {
            console.log("Не всі обов'язкові дані вказані.");
            res.status(400).json({ message: "Не всі обов'язкові дані вказані." });
            return;
        }

        if (day_reading < 0 || night_reading < 0) {
            console.log("Виявлено від'ємні показники.");
            res.status(400).json({ message: "Показники не можуть бути від'ємними." });
            return;
        }

        const meter = await meterRepository.findOneBy({ id: Number(meterId) });
        console.log("Знайдений лічильник:", meter);
        if (!meter) {
            console.log("Лічильник не знайдено.");
            res.status(404).json({ message: "Meter not found" });
            return;
        }

        const lastReading = await readingRepository.findOne({
            where: { meter: { id: meterId } },
            order: { reading_date: "DESC" }
        });
        console.log("Останній показник:", lastReading);

        const tariff = await tariffRepository.findOne({ where: { id: 1 } });
        console.log("Тариф:", tariff);
        if (!tariff) {
            console.log("Тариф не знайдено.");
            res.status(404).json({ message: "Tariff not found" });
            return;
        }

        let finalDayReading = day_reading;
        let finalNightReading = night_reading;
        let dayUsage = finalDayReading - (lastReading?.day_reading || 0);
        let nightUsage = finalNightReading - (lastReading?.night_reading || 0);

        if (lastReading) {
            if (day_reading < lastReading.day_reading) {
                finalDayReading = Number(lastReading.day_reading) + Number(tariff.day_penalty);
                dayUsage = tariff.day_penalty;
            }
            if (night_reading < lastReading.night_reading) {
                finalNightReading = Number(lastReading.night_reading) + Number(tariff.night_penalty);
                nightUsage = tariff.night_penalty;
            }
        }

        const dayPayment = Number(dayUsage) * Number(tariff.day_rate);
        const nightPayment = Number(nightUsage) * Number(tariff.night_rate);
        const totalAmount = dayPayment + nightPayment;

        const newReading = readingRepository.create({
            meter,
            day_reading: finalDayReading,
            night_reading: finalNightReading
        });
        await readingRepository.save(newReading);
        console.log("Новий показник збережено:", newReading);

        const newBill = billRepository.create({
            meter,
            amount: totalAmount
        });
        await billRepository.save(newBill);
        console.log("Новий рахунок збережено:", newBill);

        res.status(201).json({
            message: "Показники успішно додані.",
            reading: newReading,
            bill: newBill
        });

    } catch (error) {
        console.error("Помилка при додаванні показників:", error);
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
