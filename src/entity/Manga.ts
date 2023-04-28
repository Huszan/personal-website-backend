import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from "typeorm"
import {HtmlLocate} from "./HtmlLocate";

@Entity()
export class Manga {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({
        type: 'longtext',
        nullable: true,
    })
    pic: string

    @Column({
        type: 'json',
        nullable: true,
    })
    authors: JSON

    @Column({
        type: 'json',
        nullable: true,
    })
    genres: JSON

    @Column()
    last_update_date: Date

    @Column()
    added_date: Date

    @Column({
        default: 0
    })
    view_count: number

    @Column({
        default: 0
    })
    like_count: number

    @Column({
        type: 'longtext',
        nullable: true,
    })
    description: string

    @Column({
        default: 1,
    })
    starting_chapter: number

    @Column({
        default: 1,
    })
    chapter_count: number

    @OneToOne(type => HtmlLocate, htmlLocate => htmlLocate.manga, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    html_locate: HtmlLocate;

}
