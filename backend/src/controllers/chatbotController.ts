import { Request, Response } from 'express';
import { chatbotService, ChatbotQuery } from '../services/chatbotService';
import { sendResponse, sendError } from '../utils/response';

export const queryChatbot = async (req: Request, res: Response) => {
    try {
        const { text, language, context } = req.body;

        // Validate required fields
        if (!text) {
            return sendError(res, 400, 'Text is required');
        }

        if (!language) {
            return sendError(res, 400, 'Language is required');
        }

        // Create chatbot query
        const chatbotQuery: ChatbotQuery = {
            text: text.trim(),
            language: language,
            context: {
                source: context?.source || 'voice_agent',
                userId: context?.userId,
                sessionId: context?.sessionId,
                previousQueries: context?.previousQueries || []
            }
        };

        // Process the query
        const response = await chatbotService.processQuery(chatbotQuery);

        if (response.success) {
            return sendResponse(res, 200, 'Chatbot response generated successfully', response);
        } else {
            return sendError(res, 400, response.message || 'Failed to generate chatbot response');
        }

    } catch (error) {
        console.error('Chatbot query error:', error);
        return sendError(res, 500, 'Internal server error');
    }
};

export const getChatbotHealth = async (req: Request, res: Response) => {
    try {
        return sendResponse(res, 200, 'Chatbot service is healthy', {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    } catch (error) {
        console.error('Chatbot health check error:', error);
        return sendError(res, 500, 'Internal server error');
    }
};
