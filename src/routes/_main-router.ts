import devRoutes from "../routes/dev-routes";
import emailRoutes from "../routes/email-routes";
import mangaRoutes from "../routes/manga-routes";
import authRoutes from "../routes/auth-routes";
import readProgressRoutes from "./read-progress-routes";
import scrapperRoutes from "./scrapper-routes";
import * as express from "express";
import path = require("path");
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: "Too many requests. Try again later.",
});

const setLimiter = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (req.path.startsWith("/public")) return next();
    return limiter(req, res, next);
};

const applyRoutes = (app: express.Application) => {
    app.use("/", setLimiter);

    app.use("/public", express.static(path.join(process.cwd(), "public")));

    app.use(emailRoutes);

    app.use(mangaRoutes);

    app.use(authRoutes);

    app.use(readProgressRoutes);

    app.use(scrapperRoutes);

    app.use(devRoutes);
};

export { applyRoutes };
