import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Manga } from './Manga';

@Entity()
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    manga_id: number;

    @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => Manga, (manga) => manga.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'manga_id', referencedColumnName: 'id' })
    manga: Manga;
}
