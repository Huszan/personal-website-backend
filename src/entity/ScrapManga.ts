import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { HtmlLocate } from './HtmlLocate';
import { Manga } from './Manga';

@Entity()
export class ScrapManga {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'longtext', nullable: true })
    beforeUrl: string;

    @OneToMany(() => HtmlLocate, (locate) => locate.scrapManga, {
        cascade: true,
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn()
    htmlLocateList: HtmlLocate[];

    @OneToOne(() => Manga)
    manga: Manga;
}
