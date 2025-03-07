import express from "express";
import routes from "./routes/routes";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Tariff } from "./entity/Tariff";
import cors from "cors"; 

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));

AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");

        const tariffRepo = AppDataSource.getRepository(Tariff);

        let tariff = await tariffRepo.findOne({ where: { id: 1 } });
        if (!tariff) {
            tariff = tariffRepo.create({ id: 1, day_rate: 2.50, night_rate: 1.80, day_penalty: 100, night_penalty: 80 });
            await tariffRepo.save(tariff);
        }

        app.use("/", routes);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });