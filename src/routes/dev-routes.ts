import * as express from 'express';
import { sendResponse } from '../helper/SendResponseHelper';

const router = express.Router();

// Use this for developement purposes. Do not push changes for it.
router.post('/test', (req: express.Request, res: express.Response) => {
    sendResponse(res, 200);
});

export default router;
