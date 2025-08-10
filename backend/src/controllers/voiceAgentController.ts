import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request interface to include user
interface AuthRequest extends Request {
    user?: {
        userId: number;
        email: string;
        role: string;
    };
}

export interface VoiceContext {
    [key: string]: any; // Add index signature for Prisma JSON compatibility
    conversationHistory: Array<{
        timestamp: string; // Use string for JSON serialization
        userInput: string;
        agentResponse: string;
        intent?: string;
        entities?: any[];
    }>;
    userPreferences?: {
        preferredLanguage?: string;
        favoriteCategories?: string[];
        lastSearches?: string[];
    };
    currentSession?: {
        sessionId: string;
        startedAt: string; // Use string for JSON serialization
        lastActivity: string; // Use string for JSON serialization
    };
}

// Get voice agent context for user
export const getVoiceContext = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;
        const { sessionId } = req.query;

        let context = await prisma.voiceAgentContext.findFirst({
            where: {
                userId: userId,
                ...(sessionId && { sessionId: sessionId as string })
            },
            orderBy: {
                lastInteraction: 'desc'
            }
        });

        if (!context) {
            // Create new context for first time users
            const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            context = await prisma.voiceAgentContext.create({
                data: {
                    userId: userId,
                    sessionId: newSessionId,
                    context: {
                        conversationHistory: [],
                        userPreferences: {},
                        currentSession: {
                            sessionId: newSessionId,
                            startedAt: new Date().toISOString(),
                            lastActivity: new Date().toISOString()
                        }
                    } as VoiceContext
                }
            });
        }

        res.json({
            success: true,
            data: {
                sessionId: context.sessionId,
                context: context.context,
                lastInteraction: context.lastInteraction
            }
        });

    } catch (error) {
        console.error('Error getting voice context:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin voice agent context'
        });
    }
};

// Update voice agent context with conversation
export const updateVoiceContext = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;
        const {
            sessionId,
            userInput,
            agentResponse,
            intent,
            entities
        } = req.body;

        // Get existing context
        let context = await prisma.voiceAgentContext.findFirst({
            where: {
                userId: userId,
                sessionId: sessionId
            }
        });

        if (!context) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy voice context'
            });
        }

        // Update conversation history
        const currentContext = (context.context as unknown) as VoiceContext;
        const newConversationEntry = {
            timestamp: new Date().toISOString(),
            userInput,
            agentResponse,
            intent,
            entities
        };

        // Keep only last 50 conversations to prevent bloat
        currentContext.conversationHistory = [
            ...currentContext.conversationHistory.slice(-49),
            newConversationEntry
        ];

        // Update user preferences based on interaction
        if (intent === 'get_product_info' && entities) {
            const productEntities = entities.filter((e: any) => e.type === 'product');
            if (productEntities.length > 0) {
                currentContext.userPreferences = currentContext.userPreferences || {};
                currentContext.userPreferences.lastSearches = [
                    ...((currentContext.userPreferences.lastSearches || []).slice(-9)),
                    productEntities[0].value
                ];
            }
        }

        // Update session activity
        if (currentContext.currentSession) {
            currentContext.currentSession.lastActivity = new Date().toISOString();
        }

        // Save updated context
        await prisma.voiceAgentContext.update({
            where: { id: context.id },
            data: {
                context: currentContext,
                lastInteraction: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Voice context đã được cập nhật'
        });

    } catch (error) {
        console.error('Error updating voice context:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật voice agent context'
        });
    }
};

// Get conversation history for user
export const getConversationHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;
        const { limit = 20, sessionId } = req.query;

        let context = await prisma.voiceAgentContext.findFirst({
            where: {
                userId: userId,
                ...(sessionId && { sessionId: sessionId as string })
            },
            orderBy: {
                lastInteraction: 'desc'
            }
        });

        if (!context) {
            return res.json({
                success: true,
                data: {
                    conversationHistory: [],
                    sessionId: null
                }
            });
        }

        const currentContext = (context.context as unknown) as VoiceContext;
        const recentHistory = currentContext.conversationHistory
            .slice(-Number(limit))
            .reverse(); // Most recent first

        res.json({
            success: true,
            data: {
                conversationHistory: recentHistory,
                sessionId: context.sessionId,
                userPreferences: currentContext.userPreferences || {}
            }
        });

    } catch (error) {
        console.error('Error getting conversation history:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch sử conversation'
        });
    }
};

// Clear conversation history (privacy)
export const clearConversationHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;
        const { sessionId } = req.body;

        await prisma.voiceAgentContext.deleteMany({
            where: {
                userId: userId,
                ...(sessionId && { sessionId })
            }
        });

        res.json({
            success: true,
            message: 'Lịch sử conversation đã được xóa'
        });

    } catch (error) {
        console.error('Error clearing conversation history:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa lịch sử conversation'
        });
    }
};

// Get user voice preferences and insights
export const getVoiceInsights = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;

        const contexts = await prisma.voiceAgentContext.findMany({
            where: { userId: userId },
            orderBy: { lastInteraction: 'desc' },
            take: 10
        });

        if (contexts.length === 0) {
            return res.json({
                success: true,
                data: {
                    totalInteractions: 0,
                    mostUsedIntents: [],
                    favoriteProducts: [],
                    preferredLanguage: 'vi-VN'
                }
            });
        }

        // Analyze conversation patterns
        let totalInteractions = 0;
        const intentCounts: Record<string, number> = {};
        const productSearches: Record<string, number> = {};

        contexts.forEach(context => {
            const voiceContext = (context.context as unknown) as VoiceContext;
            totalInteractions += voiceContext.conversationHistory?.length || 0;

            voiceContext.conversationHistory?.forEach(conv => {
                if (conv.intent) {
                    intentCounts[conv.intent] = (intentCounts[conv.intent] || 0) + 1;
                }

                if (conv.entities) {
                    conv.entities
                        .filter(e => e.type === 'product')
                        .forEach(e => {
                            productSearches[e.value] = (productSearches[e.value] || 0) + 1;
                        });
                }
            });
        });

        const mostUsedIntents = Object.entries(intentCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([intent, count]) => ({ intent, count }));

        const favoriteProducts = Object.entries(productSearches)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([product, count]) => ({ product, count }));

        res.json({
            success: true,
            data: {
                totalInteractions,
                mostUsedIntents,
                favoriteProducts,
                preferredLanguage: 'vi-VN',
                sessionCount: contexts.length
            }
        });

    } catch (error) {
        console.error('Error getting voice insights:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin voice insights'
        });
    }
};