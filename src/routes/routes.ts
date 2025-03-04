import { Router } from "express";
import { getAllMeters, getMeterById, createMeter } from "../controllers/meter.controller";
import { addReading, getReadingsByMeterId } from "../controllers/reading.controller";
import { getBillsByMeterId } from "../controllers/bill.controller";
import { getTariff } from "../controllers/tariff.controller";

const router = Router();

// Лічильники
 router.get("/meters", getAllMeters);
 router.get("/meters/:id", getMeterById);
 router.post("/meters", createMeter);

// Показники
router.post("/readings", addReading);
router.get("/readings/:meterId", getReadingsByMeterId);

// Рахунки
router.get("/bills/:meterId", getBillsByMeterId);

// Тарифи
router.get("/tariff", getTariff);

export default router;
