import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cache {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'longtext' })
    cache_key: string;

    @Column({ type: 'longtext' })
    data: string;

    @Column()
    created_at: Date;
}
