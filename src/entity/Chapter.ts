import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { Manga } from './Manga';
import { Page } from './Page';

@Entity()
export class Chapter {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'longtext',
    })
    name: string;

    @Column({ nullable: true })
    manga_id: number;

    @OneToMany(() => Page, (page) => page.chapter, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    pages: Page[];

    @ManyToOne(() => Manga, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete',
    })
    @JoinColumn({ name: 'manga_id', referencedColumnName: 'id' })
    manga: Manga;
}
