import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, AfterRemove} from "typeorm"
import {HtmlLocate} from "./HtmlLocate";
import {Manga} from "./Manga";
import * as HtmlLocateTable from "../modules/tables/html-locate-table";

@Entity()
export class Chapter {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'longtext',
    })
    name: string

    @Column()
    pages_html_locate_id: number;

    @OneToOne(() => HtmlLocate, { cascade: true, onDelete: "CASCADE" })
    @JoinColumn({name : 'pages_html_locate_id', referencedColumnName: 'id'})
    pages_html_locate: HtmlLocate;

    @ManyToOne(() => Manga, { onDelete: "CASCADE" })
    @JoinColumn()
    manga: Manga;

}
