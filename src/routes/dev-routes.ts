import { Request, Response, Router } from 'express';
import { verifyToken } from '../modules/token-validation';
import { sendResponse, validateAdminToken } from '../helper/route.helper';

const router = Router();

// Use this for developement purposes. Do not push changes for it.
router.post('/test', (req: Request, res: Response) => {
    sendResponse(res, 200);
});

router.post(
    '/dev/cleandb',
    verifyToken,
    async (req: Request, res: Response): Promise<any> => {
        try {
            if (!validateAdminToken(req, res)) return;
        } catch (error) {
            return sendResponse(res, 500, {
                status: 'error',
                message: error.message
                    ? error.message
                    : 'An error occurred while testing scrapper form',
            });
        }
    }
);

export default router;
