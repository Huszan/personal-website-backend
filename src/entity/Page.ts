import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Manga } from "./Manga";
import { Chapter } from "./Chapter";

@Entity()
export class Page {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "longtext",
    })
    url: string;

    @Column()
    chapter_id: number;

    @ManyToOne(() => Chapter, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chapter_id", referencedColumnName: "id" })
    chapter: Chapter;
}
