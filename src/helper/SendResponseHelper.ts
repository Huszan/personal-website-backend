import { Response } from "express";
import { ResponseData } from "../types/response-data.type";

export const sendResponse = (
    res: Response,
    status: number,
    data?: ResponseData
) => {
    res.status(status).send(data);
};
