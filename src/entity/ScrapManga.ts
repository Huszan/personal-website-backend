import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    JoinColumn,
} from "typeorm";
import { HtmlLocate } from "./HtmlLocate";

@Entity()
export class ScrapManga {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "longtext", nullable: true })
    beforeUrl: string;

    @OneToMany(() => HtmlLocate, (locate) => locate.scrapManga, {
        cascade: true,
        onDelete: "CASCADE",
        eager: true,
    })
    @JoinColumn()
    htmlLocateList: HtmlLocate[];
}
