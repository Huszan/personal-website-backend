import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Like } from "./Like";
import { Chapter } from "./Chapter";
import { ReadProgress } from "./ReadProgress";
import { HtmlLocate } from "./HtmlLocate";

@Entity()
export class Manga {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "longtext",
    })
    name: string;

    @Column({
        type: "longtext",
    })
    original_name: string;

    @Column({
        type: "longtext",
        nullable: true,
    })
    pic: string;

    @Column({
        type: "longtext",
        nullable: true,
    })
    imagePath: string;

    @Column("simple-array", { nullable: true })
    authors: string[];

    @Column("simple-array", { nullable: true })
    tags: string[];

    @Column()
    last_update_date: Date;

    @Column()
    added_date: Date;

    @Column({
        default: 0,
    })
    view_count: number;

    @Column({
        default: 0,
    })
    chapter_count: number;

    @Column({
        default: 0,
    })
    like_count: number;

    @OneToMany(() => Like, (like) => like.manga, {
        cascade: true,
        onDelete: "CASCADE",
    })
    likes: Like[];

    @Column({
        type: "longtext",
        nullable: true,
    })
    description: string;

    @Column({
        default: false,
    })
    isApproved: boolean;

    @OneToMany(() => Chapter, (chapter) => chapter.manga, {
        cascade: true,
        onDelete: "CASCADE",
        orphanedRowAction: "delete",
    })
    chapters: Chapter[];

    @OneToMany(() => ReadProgress, (progress) => progress.manga, {
        cascade: true,
        onDelete: "CASCADE",
    })
    readProgress: ReadProgress[];

    @OneToMany(() => HtmlLocate, (locate) => locate.manga, {
        cascade: true,
        onDelete: "CASCADE",
    })
    htmlLocateList: HtmlLocate[];
}
