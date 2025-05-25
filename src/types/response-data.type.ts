import { Status } from './status.type';

export type ResponseData = {
    status: Status;
    message?: string;
    data?: any;
};
