import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface VoiceContextData {
    sessionId: string;
    context: {
        conversationHistory: Array<{
            timestamp: Date;
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
            startedAt: Date;
            lastActivity: Date;
        };
    };
    lastInteraction: Date;
}

export interface ConversationEntry {
    timestamp: Date;
    userInput: string;
    agentResponse: string;
    intent?: string;
    entities?: any[];
}

export interface VoiceInsights {
    totalInteractions: number;
    mostUsedIntents: Array<{
        intent: string;
        count: number;
    }>;
    favoriteProducts: Array<{
        product: string;
        count: number;
    }>;
    preferredLanguage: string;
    sessionCount: number;
}

class VoiceContextService {
    private getAuthHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Get voice agent context for current user
    async getVoiceContext(sessionId?: string): Promise<VoiceContextData> {
        try {
            const response = await axios.get(`${API_URL}/api/voice-agent/context`, {
                headers: this.getAuthHeaders(),
                params: sessionId ? { sessionId } : {}
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to get voice context');
            }
        } catch (error) {
            console.error('Error getting voice context:', error);
            throw error;
        }
    }

    // Update voice agent context with new conversation
    async updateVoiceContext(
        sessionId: string,
        userInput: string,
        agentResponse: string,
        intent?: string,
        entities?: any[]
    ): Promise<void> {
        try {
            const response = await axios.post(`${API_URL}/api/voice-agent/context`, {
                sessionId,
                userInput,
                agentResponse,
                intent,
                entities
            }, {
                headers: this.getAuthHeaders()
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update voice context');
            }
        } catch (error) {
            console.error('Error updating voice context:', error);
            throw error;
        }
    }

    // Get conversation history
    async getConversationHistory(sessionId?: string, limit: number = 20): Promise<{
        conversationHistory: ConversationEntry[];
        sessionId: string | null;
        userPreferences: any;
    }> {
        try {
            const response = await axios.get(`${API_URL}/api/voice-agent/conversation-history`, {
                headers: this.getAuthHeaders(),
                params: {
                    ...(sessionId && { sessionId }),
                    limit
                }
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to get conversation history');
            }
        } catch (error) {
            console.error('Error getting conversation history:', error);
            throw error;
        }
    }

    // Clear conversation history (privacy)
    async clearConversationHistory(sessionId?: string): Promise<void> {
        try {
            const response = await axios.delete(`${API_URL}/api/voice-agent/conversation-history`, {
                headers: this.getAuthHeaders(),
                data: sessionId ? { sessionId } : {}
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to clear conversation history');
            }
        } catch (error) {
            console.error('Error clearing conversation history:', error);
            throw error;
        }
    }

    // Get voice usage insights and analytics
    async getVoiceInsights(): Promise<VoiceInsights> {
        try {
            const response = await axios.get(`${API_URL}/api/voice-agent/insights`, {
                headers: this.getAuthHeaders()
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to get voice insights');
            }
        } catch (error) {
            console.error('Error getting voice insights:', error);
            throw error;
        }
    }

    // Helper method to extract conversation context for better responses
    getRecentContext(conversationHistory: ConversationEntry[], limit: number = 5): string {
        const recentEntries = conversationHistory.slice(-limit);
        return recentEntries
            .map(entry => `User: ${entry.userInput}\nAgent: ${entry.agentResponse}`)
            .join('\n---\n');
    }

    // Helper method to get user preferences for personalization
    getUserPreferences(context: VoiceContextData): {
        favoriteProducts: string[];
        commonIntents: string[];
        preferredLanguage: string;
    } {
        const preferences = context.context.userPreferences || {};
        const history = context.context.conversationHistory || [];

        // Extract common intents from conversation history
        const intentCounts: Record<string, number> = {};
        history.forEach(entry => {
            if (entry.intent) {
                intentCounts[entry.intent] = (intentCounts[entry.intent] || 0) + 1;
            }
        });

        const commonIntents = Object.entries(intentCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([intent]) => intent);

        return {
            favoriteProducts: preferences.lastSearches || [],
            commonIntents,
            preferredLanguage: preferences.preferredLanguage || 'vi-VN'
        };
    }
}

export const voiceContextService = new VoiceContextService();
export default voiceContextService;