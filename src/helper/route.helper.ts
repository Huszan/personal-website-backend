import { Request, Response } from 'express';
import { ResponseData } from '../types/response-data.type';
import { UserTokenData } from '../types/user-token-data.type';

export const sendResponse = (
    res: Response,
    status: number,
    data?: ResponseData
) => {
    res.status(status).send(data);
};

export const validateAdminToken = (req: Request, res: Response): boolean => {
    const userData: UserTokenData = req['tokenData']
        ? req['tokenData']
        : undefined;

    if (userData === undefined || userData.accountType !== 'admin') {
        sendResponse(res, 403, {
            status: 'error',
            message: 'You are not authorized to do this action!',
        });
        return false;
    }

    return true;
};
