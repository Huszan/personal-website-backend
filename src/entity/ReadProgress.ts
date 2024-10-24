import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Manga } from "./Manga";

@Entity()
export class ReadProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    user: User;

    @Column()
    user_id: number;

    @ManyToOne(() => Manga)
    @JoinColumn({ name: "manga_id", referencedColumnName: "id" })
    manga: Manga;

    @Column()
    manga_id: number;

    @Column({ default: 0 })
    last_read_chapter: number;

    @Column({ default: 0 })
    last_read_page: number;
}