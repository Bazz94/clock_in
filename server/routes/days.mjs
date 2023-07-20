import { Router } from 'express';
const router = Router();
import db from '../db/conn.mjs';
import authToken from '../middleware/authenticateToken.mjs';

// Get user days
router.get('/', authToken,async (req, res) => {

});

// Update user days



export default router;