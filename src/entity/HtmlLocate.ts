import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class HtmlLocate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "json",
        nullable: true,
    })
    positions: JSON;

    @Column({
        default: "img",
    })
    looked_type: string;

    @Column({
        default: "src",
    })
    looked_attr: string;

    @Column({
        type: "json",
        nullable: true,
    })
    urls: JSON;
}
