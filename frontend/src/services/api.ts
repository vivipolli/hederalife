const API_URL = 'http://localhost:3000';

export interface AgentResponse {
    agent: string;
    content: string;
    timestamp: string;
}

export interface HealthConcern {
    content: string;
}

export interface HealthSuggestion {
    scientific: string[];
    holistic: string[];
}

export interface HealthResponse {
    mental: {
        scientific: string[];
        holistic: string[];
    };
    physical: {
        scientific: string[];
        holistic: string[];
    };
    spiritual: {
        scientific: string[];
        holistic: string[];
    };
}

export interface UserResponses {
    status: string;
    responses: Array<{
        agentType: string;
        suggestions: string;
        timestamp: string;
    }>;
}

export const api = {
    checkHealth: async (): Promise<{ status: string }> => {
        const response = await fetch(`${API_URL}/api/health`);
        return response.json();
    },

    submitHealthConcern: async (concern: HealthConcern): Promise<AgentResponse[]> => {
        const response = await fetch(`${API_URL}/api/health/concern`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(concern),
        });
        return response.json();
    },

    getUserResponses: async (): Promise<AgentResponse[]> => {
        const response = await fetch(`${API_URL}/api/user-responses`);
        return response.json();
    }
}; 