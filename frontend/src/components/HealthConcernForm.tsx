import { useState } from 'react';
import { api, HealthResponse } from '../services/api';

interface HabitRoute {
    scientific: string;
    holistic: string;
    innovative: string;
}

interface HabitRoutes {
    mental: HabitRoute;
    physical: HabitRoute;
    spiritual: HabitRoute;
}

interface ExtendedResponse extends HealthResponse {
    habitRoutes: HabitRoutes;
}

export const HealthConcernForm = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<ExtendedResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await api.submitHealthConcern({ content });
            setResponse(result as ExtendedResponse);
            setContent('');
        } catch (err) {
            setError('Failed to submit health concern. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderHabitRoute = (title: string, route: HabitRoute) => (
        <div className="habit-route">
            <h3>{title}</h3>
            <div className="approaches">
                <div className="approach">
                    <h4>Scientific/Traditional</h4>
                    <p>{route.scientific}</p>
                </div>
                <div className="approach">
                    <h4>Holistic/Oriental</h4>
                    <p>{route.holistic}</p>
                </div>
                <div className="approach">
                    <h4>Innovative</h4>
                    <p>{route.innovative}</p>
                </div>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="input-form">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your health concern or goal..."
                className="input-field"
            />
            <button 
                type="submit" 
                disabled={loading || !content.trim()}
                className="submit-button"
            >
                {loading ? 'Processing...' : 'Get Suggestions'}
            </button>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {response && (
                <div className="suggestions-container">
                    <h2 className="text-xl font-semibold mb-4">Response</h2>
                    <p className="suggestion-item">
                        {response.response}
                    </p>
                    
                    <div className="habit-routes">
                        {renderHabitRoute('Mental Health', response.habitRoutes.mental)}
                        {renderHabitRoute('Physical Health', response.habitRoutes.physical)}
                        {renderHabitRoute('Spiritual Health', response.habitRoutes.spiritual)}
                    </div>
                </div>
            )}
        </form>
    );
}; 