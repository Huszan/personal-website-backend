import * as jwt from "jsonwebtoken";
import { sendResponse } from "../helper/SendResponseHelper";

export const generateToken = <T extends object | string>(data: T) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT secret is not defined");
    }

    const payload = data;
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d", // TODO: fix this! It should be short and reapplied
    });
    return token;
};

export const verifyToken = (req: any, res: any, next: any) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>
    if (!token) {
        return sendResponse(res, 401, {
            status: "error",
            message: "Access denied. No token provided.",
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            return sendResponse(res, 401, {
                status: "error",
                message: "Invalid token.",
            });
        }
        req.tokenData = decoded; // Attach decoded token data to the request
        next();
    });
};
