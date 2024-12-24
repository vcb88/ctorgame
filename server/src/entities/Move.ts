import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Game } from './Game';
import { IMove } from '@ctor-game/shared/types';

@Entity('moves')
export class Move {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('uuid')
    gameId: string;

    @ManyToOne(() => Game, game => game.moves, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'gameId' })
    game: Game;

    @Column()
    playerNumber: number;

    @Column({ type: 'jsonb' })
    moveData: IMove;

    @CreateDateColumn()
    createdAt: Date;
}