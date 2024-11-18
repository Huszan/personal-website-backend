import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    JoinColumn,
} from "typeorm";
import { Like } from "./Like";
import { ReadProgress } from "./ReadProgress";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: "text",
    })
    email: string;

    @Column()
    password: string;

    @Column({
        type: "longtext",
        nullable: true,
    })
    verificationCode: string;

    @Column()
    accountType: string;

    @Column({
        default: null,
        nullable: true,
    })
    authToken: string;

    @OneToMany(() => Like, (like) => like.user, {
        cascade: true,
        onDelete: "CASCADE",
    })
    likes: Like[];

    @OneToMany(() => ReadProgress, (progress) => progress.manga, {
        cascade: true,
        onDelete: "CASCADE",
    })
    readProgress: ReadProgress[];
}
