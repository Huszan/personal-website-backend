import {Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn} from "typeorm"
import {Like} from "./Like";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({
        type: 'text',
    })
    email: string

    @Column()
    password: string

    @Column({
        type: 'longtext',
        nullable: true,
    })
    verificationCode: string

    @Column()
    accountType: string

    @Column({
        default: null,
        nullable: true,
    })
    authToken: string

    @OneToMany(() => Like, (like) => like.user)
    likes: Like[]

}
