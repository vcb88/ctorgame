import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Move } from './Move';
import { IGameState } from '@ctor-game/shared/types';

@Entity('games')
export class Game {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    gameCode: string;

    @Column({ type: 'jsonb' })
    currentState: IGameState;

    @Column({ nullable: true })
    winner: number | null;

    @Column({ default: false })
    isCompleted: boolean;

    @OneToMany(() => Move, (move: Move) => move.game)
    moves: Move[];

    @Column({ type: 'jsonb' })
    players: { id: string; number: number }[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true, type: 'timestamp' })
    completedAt: Date;
}