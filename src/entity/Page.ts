import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Manga} from "./Manga";
import {Chapter} from "./Chapter";

@Entity()
export class Page {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'longtext',
    })
    url: string

    @ManyToOne(() => Chapter, { onDelete: "CASCADE" })
    chapter: Chapter;

}
