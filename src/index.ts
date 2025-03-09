import express from "express";
import routes from "./routes/routes";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Tariff } from "./entity/Tariff";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

export { app };

AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");

        const tariffRepo = AppDataSource.getRepository(Tariff);

        let tariff = await tariffRepo.findOne({ where: { id: 1 } });
        if (!tariff) {
            tariff = tariffRepo.create({ 
                id: 1, 
                day_rate: parseFloat(process.env.DAY_RATE || '2.50'), 
                night_rate: parseFloat(process.env.NIGHT_RATE || '1.80'), 
                day_penalty: parseFloat(process.env.DAY_PENALTY || '100'), 
                night_penalty: parseFloat(process.env.NIGHT_PENALTY || '80') 
            });
            await tariffRepo.save(tariff);
        }

        app.use("/", routes);

        if (process.env.NODE_ENV !== 'test') {
            const PORT = process.env.PORT || 3000;
            app.listen(PORT, () => {
                console.log(`Server is running on http://localhost:${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });

