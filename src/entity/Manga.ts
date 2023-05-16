import {Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn} from "typeorm"
import {HtmlLocate} from "./HtmlLocate";
import {Like} from "./Like";

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

    @OneToMany(() => Like, (like) => like.manga)
    @JoinColumn()
    likes: Like[]

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

    @OneToOne(() => HtmlLocate, htmlLocate => htmlLocate.manga)
    html_locate: HtmlLocate;

}
