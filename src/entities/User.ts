import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
    ADMIN = 'ADMIN'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column()
    password_hash!: string;

    @Column({ nullable: true })
    full_name!: string;

    @Column({ nullable: true })
    profile_image_url!: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.ADMIN })
    role!: UserRole;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
