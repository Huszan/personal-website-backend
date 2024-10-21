import devRoutes from "../routes/dev-routes";
import emailRoutes from "../routes/email-routes";
import mangaRoutes from "../routes/manga-routes";
import authRoutes from "../routes/auth-routes";
import * as express from "express";

const applyRoutes = (app: express.Application) => {
    app.use(devRoutes);
    app.use(emailRoutes);
    app.use(mangaRoutes);
    app.use(authRoutes);
};

export { applyRoutes };
