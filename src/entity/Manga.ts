import {Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn, RelationCount} from "typeorm"
import {HtmlLocate} from "./HtmlLocate";
import {Like} from "./Like";
import {Chapter} from "./Chapter";

@Entity()
export class Manga {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'longtext',
    })
    name: string;

    @Column({
        type: 'longtext',
        nullable: true,
    })
    pic: string;

    @Column({
        type: 'json',
        nullable: true,
    })
    authors: JSON;

    @Column({
        type: 'json',
        nullable: true,
    })
    genres: JSON;

    @Column()
    last_update_date: Date;

    @Column()
    added_date: Date;

    @Column({
        default: 0
    })
    view_count: number;

    @Column({
        default: 0
    })
    like_count: number;

    @Column({
        default: 0
    })
    chapter_count: number;

    @OneToMany(() => Like, (like) => like.manga, { cascade: true, onDelete: "CASCADE" })
    @JoinColumn()
    likes: Like[];

    @Column({
        type: 'longtext',
        nullable: true,
    })
    description: string;

    @Column({
        default: 1,
    })
    starting_chapter: number;

    @Column({
        default: false,
    })
    isApproved: boolean;

    @OneToMany(() => Chapter, chapter => chapter.manga, { cascade: true, onDelete: "CASCADE" })
    chapters: Chapter[];

}
