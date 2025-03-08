import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const isTestEnvironment = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: true,
    ssl: { rejectUnauthorized: false },
    entities: isTestEnvironment ? ["src/entity/*.ts"] : ["dist/entity/*.js"],
    migrations: isTestEnvironment ? ["src/migrations/*.ts"] : ["dist/migrations/*.js"],
});

