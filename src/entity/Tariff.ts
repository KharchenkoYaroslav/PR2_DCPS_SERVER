import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";

@Entity()
export class Tariff {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    day_rate!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    night_rate!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    day_penalty!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    night_penalty!: number;

    @CreateDateColumn()
    updated_at!: Date;
}


