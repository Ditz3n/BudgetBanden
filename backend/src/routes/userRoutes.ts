import express from 'express';
import { registerUser, loginUser, getUserData } from '../controllers/userController';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/user/:username', getUserData); // Add this route to get user data

export default router;