import express from 'express';
import {
    getVoiceContext,
    updateVoiceContext,
    getConversationHistory,
    clearConversationHistory,
    getVoiceInsights
} from '../controllers/voiceAgentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All voice agent routes require authentication
router.use(authenticate);

// Get voice agent context for current user
router.get('/context', getVoiceContext);

// Update voice agent context with new conversation
router.post('/context', updateVoiceContext);

// Get conversation history
router.get('/conversation-history', getConversationHistory);

// Clear conversation history (privacy)
router.delete('/conversation-history', clearConversationHistory);

// Get voice usage insights and analytics
router.get('/insights', getVoiceInsights);

export default router;