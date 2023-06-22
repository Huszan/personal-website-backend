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
    })
    original_name: string;

    @Column({
        type: 'longtext',
        nullable: true,
    })
    pic: string;

    @Column("simple-array", {nullable: true})
    authors: string[];

    @Column("simple-array", {nullable: true})
    tags: string[];

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
    chapter_count: number;

    @Column({
        default: 0
    })
    like_count: number;

    @OneToMany(() => Like, (like) => like.manga, { cascade: true, onDelete: "CASCADE" })
    @JoinColumn()
    likes: Like[];

    @Column({
        type: 'longtext',
        nullable: true,
    })
    description: string;

    @Column({
        default: false,
    })
    isApproved: boolean;

    @OneToMany(() => Chapter, chapter => chapter.manga, { cascade: true, onDelete: "CASCADE" })
    @JoinColumn()
    chapters: Chapter[];

}
