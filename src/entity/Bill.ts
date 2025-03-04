import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Meter } from "./Meter";

@Entity()
export class Bill {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Meter, { onDelete: "CASCADE" })
    meter!: Meter;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount!: number;

    @CreateDateColumn()
    generated_at!: Date;
}

