import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Client } from './Client';
import { Installment } from './Installment';
import { Payment } from './Payment';
import { CreditItem } from './CreditItem';

export enum CreditStatus {
    ACTIVE = 'ACTIVE',
    PAID = 'PAID',
    DEFAULT = 'DEFAULT'
}

@Entity('credits')
export class Credit {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    client_id!: number;

    @ManyToOne(() => Client, client => client.credits)
    @JoinColumn({ name: 'client_id' })
    client!: Client;

    @Column('decimal', { precision: 15, scale: 2 })
    total_amount!: number;

    @Column('decimal', { precision: 5, scale: 2 })
    interest_rate!: number;

    @Column('int')
    number_of_installments!: number;

    @Column('decimal', { precision: 15, scale: 2 })
    current_balance!: number;

    @Column({ type: 'enum', enum: CreditStatus, default: CreditStatus.ACTIVE })
    status!: CreditStatus;

    @Column({ type: 'date' })
    start_date!: string;

    @OneToMany(() => Installment, installment => installment.credit)
    installments!: Installment[];

    @OneToMany(() => Payment, payment => payment.credit)
    payments!: Payment[];

    @OneToMany(() => CreditItem, item => item.credit)
    items!: CreditItem[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
