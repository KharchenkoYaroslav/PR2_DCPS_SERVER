import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Meter } from "./Meter";

@Entity()
export class Reading {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Meter, { onDelete: "CASCADE" })
    meter!: Meter;

    @Column()
    day_reading!: number;

    @Column()
    night_reading!: number;

    @CreateDateColumn()
    reading_date!: Date;
}


