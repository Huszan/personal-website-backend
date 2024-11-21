import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Manga } from "./Manga";

@Entity()
export class HtmlLocate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text" })
    entity_name: string;

    @Column({
        type: "json",
        nullable: true,
    })
    positions: JSON;

    @Column({
        type: "longtext",
    })
    looked_type: string;

    @Column({
        type: "longtext",
    })
    looked_attr: string;

    @Column({
        type: "json",
        nullable: true,
    })
    urls: JSON;

    @ManyToOne(() => Manga, { onDelete: "CASCADE" })
    manga: Manga;
}
