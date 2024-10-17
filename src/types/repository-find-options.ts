export interface RepositoryFindOptions {
    where?: {
        element: string;
        value: string | number;
        specialType?: "like";
    }[];
    skip?: number;
    take?: number;
    order?: { element: string; sort: "ASC" | "DESC" };
}
