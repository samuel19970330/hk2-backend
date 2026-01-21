import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Credit } from './Credit';

export enum PaymentType {
    INSTALLMENT = 'INSTALLMENT',
    CAPITAL_REDUCTION = 'CAPITAL_REDUCTION',
    FULL_PAYMENT = 'FULL_PAYMENT'
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    credit_id!: number;

    @ManyToOne(() => Credit, credit => credit.payments)
    @JoinColumn({ name: 'credit_id' })
    credit!: Credit;

    @Column('decimal', { precision: 15, scale: 2 })
    amount!: number;

    @CreateDateColumn()
    payment_date!: Date;

    @Column({ type: 'enum', enum: PaymentType })
    payment_type!: PaymentType;

    @Column('text', { nullable: true })
    notes!: string;

    @Column({ nullable: true })
    receipt_url!: string;

    @CreateDateColumn()
    created_at!: Date;
}
