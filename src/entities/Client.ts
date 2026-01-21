import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Credit } from './Credit';

@Entity('clients')
export class Client {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    document_id!: string;

    @Column()
    full_name!: string;

    @Column({ nullable: true })
    email!: string;

    @Column({ nullable: true })
    phone!: string;

    @Column('text', { nullable: true })
    address!: string;

    @Column('decimal', { precision: 15, scale: 2, default: 0.00 })
    global_debt!: number;

    @OneToMany(() => Credit, credit => credit.client)
    credits!: Credit[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
