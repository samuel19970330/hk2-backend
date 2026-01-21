import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Credit } from './Credit';

export enum InstallmentStatus {
    PENDING = 'PENDING',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID'
}

@Entity('installments')
export class Installment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    credit_id!: number;

    @ManyToOne(() => Credit, credit => credit.installments)
    @JoinColumn({ name: 'credit_id' })
    credit!: Credit;

    @Column('int')
    installment_number!: number;

    @Column({ type: 'date' })
    due_date!: string;

    @Column('decimal', { precision: 15, scale: 2 })
    capital_amount!: number;

    @Column('decimal', { precision: 15, scale: 2 })
    interest_amount!: number;

    @Column('decimal', { precision: 15, scale: 2 })
    total_amount!: number;

    @Column({ type: 'enum', enum: InstallmentStatus, default: InstallmentStatus.PENDING })
    status!: InstallmentStatus;

    @Column('decimal', { precision: 15, scale: 2, default: 0.00 })
    amount_paid!: number;

    @Column({ type: 'datetime', nullable: true })
    paid_date!: Date;

    @CreateDateColumn()
    created_at!: Date;
}
