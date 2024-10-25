export interface RepositoryWhere {
    element: string;
    value: string | number | Array<string | number>;
    specialType?: "like";
}

export interface RepositoryOrder {
    element: string;
    sort: "ASC" | "DESC";
}

export interface RepositoryFindOptions {
    where?: RepositoryWhere[];
    skip?: number;
    take?: number;
    order?: RepositoryOrder;
}
