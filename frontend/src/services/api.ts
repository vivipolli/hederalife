const API_URL = 'http://localhost:3000';

export interface HealthConcern {
    content: string;
    userId?: string;
}

export interface HealthResponse {
    status: string;
    message: string;
    userId: string;
    response: string;
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
    async checkHealth(): Promise<{ status: string; message: string }> {
        const response = await fetch(`${API_URL}/health`);
        return response.json();
    },

    async submitHealthConcern(data: HealthConcern): Promise<HealthResponse> {
        const response = await fetch(`${API_URL}/api/health-concern`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async getUserResponses(userId: string): Promise<UserResponses> {
        const response = await fetch(`${API_URL}/api/responses/${userId}`);
        return response.json();
    }
}; 