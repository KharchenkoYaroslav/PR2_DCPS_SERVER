import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: true,
    ssl: { rejectUnauthorized: false },
    entities: ["dist/entity/*.js"],
    migrations: ["dist/migrations/*.js"],
});

