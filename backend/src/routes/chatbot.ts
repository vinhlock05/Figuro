import express from 'express';
import { queryChatbot, getChatbotHealth } from '../controllers/chatbotController';

const router = express.Router();

// Health check endpoint
router.get('/health', getChatbotHealth);

// Main chatbot query endpoint
router.post('/query', queryChatbot);

export default router;
