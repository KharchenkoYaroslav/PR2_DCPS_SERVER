import { DataSource } from "typeorm";
import "reflect-metadata";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "ep-spring-salad-ab37ivpm-pooler.eu-west-2.aws.neon.tech",
    port: 5432,
    username: "neondb_owner",
    password: "npg_SRI8MWuVx1ny",
    database: "neondb",
    synchronize: true,
    logging: false,
    entities: ["src/entity/*.ts"],
    migrations: ["src/migration/*.ts"],
    subscribers: ["src/subscriber/*.ts"],
    ssl: true
});

AppDataSource.initialize()
    .then(() => console.log("Connected to DB"))
    .catch((error) => console.log(error));