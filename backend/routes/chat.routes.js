import { Router } from 'express';
import {
    getConversationHistory,
    getOnlineUsers,
} from '../controllers/chat.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/getconversationhistory').post(verifyJWT, getConversationHistory);
router.route('/getonlineusers').get(verifyJWT, getOnlineUsers);

export default router;
