import request from "supertest";
import { app } from "../src/index";
import { AppDataSource } from "../src/data-source";
import { Tariff } from "../src/entity/Tariff";
import routes from "../src/routes/routes";

beforeAll(async () => {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized for tests!");

        const tariffRepo = AppDataSource.getRepository(Tariff);

        let tariff = await tariffRepo.findOne({ where: { id: 1 } });
        if (!tariff) {
            tariff = tariffRepo.create({ id: 1, day_rate: 2.50, night_rate: 1.80, day_penalty: 100, night_penalty: 80 });
            await tariffRepo.save(tariff);
        }

        app.use("/", routes);

        const TEST_PORT = process.env.TEST_PORT || 5000;
        app.listen(TEST_PORT, () => {
            console.log(`Test server is running on http://localhost:${TEST_PORT}`);
        });
    } catch (error) {
        console.error("Error during Data Source initialization:", error);
    }
});

afterAll(async () => {
    try {
        await AppDataSource.destroy();
        console.log("Data Source has been destroyed after tests!");
    } catch (error) {
        console.error("Error during Data Source destruction:", error);
    }
}); 

describe("Meter Readings API", () => {
    const meterId = 1;
    let newMeterNumber: number;
    let newMeterId: number;

    it("отримання показників вже існуючого лічильника", async () => {
        const response = await request(app).get(`/readings/${meterId}`);
        expect(response.status).toBe(200);
    });

    it("додавання нового лічильника та отримання його показників", async () => {
        let response = await request(app).get("/meters");
        expect(response.status).toBe(200);

        const meters = response.body;
        const existingNumbers = meters.map((meter: any) => Number(meter.number));
        newMeterNumber = 1;
        console.log(existingNumbers);

        while (existingNumbers.includes(newMeterNumber)) {
            newMeterNumber++;
        }
        console.log("Новий номер лічильника:", newMeterNumber);

        response = await request(app)
            .post("/meters")
            .send({
                number: newMeterNumber
            });

        expect(response.status).toBe(201);

        newMeterId = response.body.id;

        response = await request(app)
            .post("/readings")
            .send({
                meterId: newMeterId,
                day_reading: 100,
                night_reading: 50
            });

        expect(response.status).toBe(201);

        response = await request(app).get(`/readings/${newMeterId}`);
        expect(response.status).toBe(200);
        expect(response.body.readings[0]).toHaveProperty("day_reading", 100);
        expect(response.body.readings[0]).toHaveProperty("night_reading", 50);
    });

    it("отримання показників з заниженими нічними показниками", async () => {
        const response = await request(app)
            .post("/readings")
            .send({
                meterId: newMeterId,
                day_reading: 200,
                night_reading: 40 
            });

        expect(response.status).toBe(201);

        console.log(response.body);
        
        expect(response.body.reading).toHaveProperty("day_reading", 200);
        expect(response.body.reading).toHaveProperty("night_reading", 130);
    });

    it("отримання показників з заниженими денними показниками", async () => {
        const response = await request(app)
            .post("/readings")
            .send({
                meterId: newMeterId,
                day_reading: 90, 
                night_reading: 150
            });

        expect(response.status).toBe(201);
        expect(response.body.reading).toHaveProperty("day_reading", 300);
        expect(response.body.reading).toHaveProperty("night_reading", 150);
    });

    it("отримання показників з заниженими нічними та денними показниками", async () => {
        const response = await request(app)
            .post("/readings")
            .send({
                meterId: newMeterId,
                day_reading: 80,
                night_reading: 30
            });

        expect(response.status).toBe(201);
        expect(response.body.reading).toHaveProperty("day_reading", 400);
        expect(response.body.reading).toHaveProperty("night_reading", 230);
    });
});
