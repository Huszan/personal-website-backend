
export interface RepositoryFindOptions {
    where?: {
        element: string,
        value: string | number,
        useLike?: boolean,
    };
    skip?: number;
    take?: number;
    order?: { element: string; sort: 'ASC' | 'DESC' };
}
