import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from "typeorm"
import {Manga} from "./Manga";

@Entity()
export class HtmlLocate {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'json',
        nullable: true,
    })
    positions: JSON

    @Column({
        default: 'img',
    })
    looked_type: string

    @Column({
        default: 'src',
    })
    looked_attr: string

    @Column({
        type: 'json',
        nullable: true,
    })
    urls: JSON

    @OneToOne(type => Manga, manga => manga.html_locate)
    @JoinColumn()
    manga: Manga;

}
