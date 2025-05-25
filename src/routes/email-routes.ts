import * as express from 'express';
import * as EmailHandler from '../modules/email-handler';
import { ContactInfo } from '../types/contact-info.type';
import { sendResponse } from '../helper/route.helper';

const router = express.Router();

router.post('/post', (req: express.Request, res: express.Response) => {
    let body = req.body;
    EmailHandler.sendMail(body, (info: { messageId: any }) => {
        const message = `E-mail has been sent`;
        console.log(`${message}. Id -> ${info.messageId}`);
        sendResponse(res, 200, {
            status: 'success',
            message,
            data: info,
        });
    });
});

router.post(
    '/sendMailMangaDot',
    (req: express.Request, res: express.Response) => {
        let info: ContactInfo = req.body.info;
        const body = {
            from: info.email,
            to: 'mangadot.contact@gmail.com',
            subject: `Contact from Manga Dot - ${info.subject}`,
            text: `Hi, my name is ${info.name}.\n\n\t${info.message} \n\nPlease, contact me back ${info.email}`,
        };
        EmailHandler.sendCustomMail(body, (info: { messageId: any }) => {
            console.log(`E-mail has been sent. Id -> ${info.messageId}`);
            sendResponse(res, 200, {
                status: 'success',
                message: `E-mail has been sent`,
                data: info,
            });
        });
    }
);

export default router;
