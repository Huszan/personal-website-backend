import { LikeType } from "./like.type";

export interface UserType {
    id?: number;
    name: string;
    email: string;
    password: string;
    isVerified: boolean;
    accountType: string;
    authToken?: string;
    likes: LikeType[];
}
