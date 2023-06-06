import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany} from "typeorm"
import {Manga} from "./Manga";
import {Page} from "./Page";

@Entity()
export class Chapter {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'longtext',
    })
    name: string

    @OneToMany(() => Page, page => page.chapter, { cascade: true, onDelete: "CASCADE" })
    @JoinColumn()
    pages: Page[];

    @ManyToOne(() => Manga, { onDelete: "CASCADE" })
    @JoinColumn()
    manga: Manga;

}
