import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import { UserType } from '../../types/user.type';
import * as LikeTable from './like-table';
import { FindManyOptions } from 'typeorm';

const repository = AppDataSource.manager.getRepository(User);

export async function create(data: User) {
    return repository.save(data);
}

export async function read(options?: FindManyOptions<User>) {
    let query = repository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.likes', 'likes');
    if (options) {
        query = query.setFindOptions(options);
    }
    return query.getMany();
}

export async function update(data: User) {
    return repository.save(data);
}

export async function remove(id?: number) {
    let entry = await repository.findOneBy({ id: id });
    if (entry) {
        return repository.remove(entry);
    }
}

export function convertDataToTableEntry(data: UserType, code?: string): User {
    let entry = new User();
    if (data.id) entry.id = data.id;
    entry.name = data.name;
    entry.email = data.email;
    entry.password = data.password;
    entry.accountType = data.accountType;
    if (code) entry.verificationCode = code;
    return entry;
}

export function convertTableEntryToData(entry: User): UserType {
    const likes = [];
    entry.likes.forEach((like) => {
        likes.push(LikeTable.convertTableEntryToData(like));
    });
    return {
        id: entry.id,
        name: entry.name,
        email: entry.email,
        password: entry.password,
        accountType: entry.accountType,
        isVerified: !!entry.verificationCode,
        likes: likes,
    };
}
