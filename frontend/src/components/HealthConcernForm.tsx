import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tabs, Button, Input, Tag, Checkbox, message, Card, Space } from 'antd';
import { LoadingOutlined, HeartOutlined, BulbOutlined, TeamOutlined } from '@ant-design/icons';
import { useWeb3Auth } from "@web3auth/modal-react-hooks";

const { TextArea } = Input;

interface AgentResponse {
    agent: string;
    content: string;
    timestamp: string;
}

export const HealthConcernForm = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [responses, setResponses] = useState<AgentResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, string[]>>({});
    const { isConnected } = useWeb3Auth();

    useEffect(() => {
        const savedResponses = localStorage.getItem('healthResponses');
        if (savedResponses) {
            setResponses(JSON.parse(savedResponses));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await api.submitHealthConcern({ content });
            setResponses(result);
            localStorage.setItem('healthResponses', JSON.stringify(result));
            setContent('');
            message.success('Suggestions received successfully!');
        } catch (err) {
            setError('Failed to submit health concern. Please try again.');
            message.error('Failed to get suggestions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionChange = (category: string, suggestion: string, checked: boolean) => {
        setSelectedSuggestions(prev => {
            const current = prev[category] || [];
            if (checked) {
                return { ...prev, [category]: [...current, suggestion] };
            } else {
                return { ...prev, [category]: current.filter(s => s !== suggestion) };
            }
        });
    };

    const saveSelectedHabits = () => {
        if (!isConnected) {
            message.error('Please sign in to save your habits');
            return;
        }

        const savedHabits = localStorage.getItem('healthHabits') || '[]';
        const existingHabits = JSON.parse(savedHabits);
        
        const newHabits = Object.entries(selectedSuggestions).flatMap(([category, suggestions]) => 
            suggestions.map(suggestion => {
                const [type, text] = suggestion.split(': ');
                return {
                    id: `${category}-${type}-${Date.now()}`,
                    category,
                    type: type.toLowerCase(),
                    suggestion: text,
                    completed: false,
                    date: new Date().toISOString()
                };
            })
        );

        const updatedHabits = [...existingHabits, ...newHabits];
        localStorage.setItem('healthHabits', JSON.stringify(updatedHabits));
        message.success('Habits saved successfully!');
    };

    const extractSuggestions = (content: string, category: string) => {
        const regex = new RegExp(`${category} Health:([\\s\\S]*?)(?=Physical Health:|Spiritual Health:|$)`, 'i');
        const match = content.match(regex);
        if (!match) return [];
        
        const section = match[1];
        const suggestions = section.split('\n')
            .filter(line => {
                const trimmed = line.trim();
                return trimmed && 
                       !trimmed.includes('Health:') && 
                       (trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') || trimmed.startsWith('4.'));
            })
            .map(line => {
                const text = line.replace(/^[\*\-]\s*|\d+\.\s*/, '').trim();
                const type = text.includes('Scientific:') ? 'scientific' : 
                           text.includes('Holistic:') ? 'holistic' : '';
                const suggestion = text.replace(/(Scientific|Holistic):\s*/, '').trim();
                return { type, suggestion };
            })
            .filter(item => item.type && item.suggestion);
        
        return suggestions;
    };

    const getUniqueSuggestions = (tab: string) => {
        const allSuggestions = new Set<string>();
        const suggestionsWithType = responses.reduce((acc, response) => {
            const suggestions = extractSuggestions(response.content, tab);
            suggestions.forEach(({ type, suggestion }) => {
                if (!allSuggestions.has(suggestion)) {
                    allSuggestions.add(suggestion);
                    acc.push({ type, suggestion });
                }
            });
            return acc;
        }, [] as { type: string; suggestion: string }[]);
        
        return suggestionsWithType;
    };

    const items = [
        {
            key: 'mental',
            label: (
                <span>
                    <BulbOutlined style={{ marginRight: '8px' }} />
                    Mental
                </span>
            ),
            children: (
                <Card style={{ 
                    background: 'linear-gradient(135deg, #2d84eb11 0%, #8259ef11 100%)',
                    border: '1px solid rgba(45, 132, 235, 0.1)'
                }}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {getUniqueSuggestions('mental').map(({ type, suggestion }, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                <Checkbox 
                                    onChange={(e) => handleSuggestionChange('mental', `${type}: ${suggestion}`, e.target.checked)}
                                    style={{ marginRight: '16px' }} 
                                />
                                <Tag color={type === 'scientific' ? '#2d84eb' : '#8259ef'} style={{ marginRight: '16px' }}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Tag>
                                <span>{suggestion}</span>
                            </div>
                        ))}
                    </Space>
                </Card>
            ),
        },
        {
            key: 'physical',
            label: (
                <span>
                    <HeartOutlined style={{ marginRight: '8px' }} />
                    Physical
                </span>
            ),
            children: (
                <Card style={{ 
                    background: 'linear-gradient(135deg, #2d84eb11 0%, #8259ef11 100%)',
                    border: '1px solid rgba(45, 132, 235, 0.1)'
                }}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {getUniqueSuggestions('physical').map(({ type, suggestion }, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                <Checkbox 
                                    onChange={(e) => handleSuggestionChange('physical', `${type}: ${suggestion}`, e.target.checked)}
                                    style={{ marginRight: '16px' }} 
                                />
                                <Tag color={type === 'scientific' ? '#2d84eb' : '#8259ef'} style={{ marginRight: '16px' }}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Tag>
                                <span>{suggestion}</span>
                            </div>
                        ))}
                    </Space>
                </Card>
            ),
        },
        {
            key: 'spiritual',
            label: (
                <span>
                    <TeamOutlined style={{ marginRight: '8px' }} />
                    Spiritual
                </span>
            ),
            children: (
                <Card style={{ 
                    background: 'linear-gradient(135deg, #2d84eb11 0%, #8259ef11 100%)',
                    border: '1px solid rgba(45, 132, 235, 0.1)'
                }}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {getUniqueSuggestions('spiritual').map(({ type, suggestion }, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                <Checkbox 
                                    onChange={(e) => handleSuggestionChange('spiritual', `${type}: ${suggestion}`, e.target.checked)}
                                    style={{ marginRight: '16px' }} 
                                />
                                <Tag color={type === 'scientific' ? '#2d84eb' : '#8259ef'} style={{ marginRight: '16px' }}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Tag>
                                <span>{suggestion}</span>
                            </div>
                        ))}
                    </Space>
                </Card>
            ),
        },
    ];

    return (
        <div style={{ width: '100%' }}>
            <form onSubmit={handleSubmit}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <TextArea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe your health concern or goal..."
                        rows={4}
                        style={{ 
                            maxWidth: '800px', 
                            margin: '0 auto',
                            border: '1px solid rgba(45, 132, 235, 0.2)',
                            boxShadow: '0 2px 8px rgba(45, 132, 235, 0.1)'
                        }}
                    />
                    <div style={{ textAlign: 'center' }}>
                        <Button 
                            type="primary"
                            htmlType="submit"
                            disabled={loading || !content.trim()}
                            style={{ 
                                maxWidth: '300px',
                                background: 'linear-gradient(135deg, #2d84eb 0%, #8259ef 100%)',
                                border: 'none',
                                color: '#fff',
                                height: '40px'
                            }}
                            icon={loading ? <LoadingOutlined /> : null}
                        >
                            {loading ? 'Processing...' : 'Get Suggestions'}
                        </Button>
                    </div>

                    {error && (
                        <div style={{ 
                            color: '#ff4d4f', 
                            padding: '12px', 
                            background: '#fff2f0', 
                            borderRadius: '6px',
                            border: '1px solid #ffccc7'
                        }}>
                            {error}
                        </div>
                    )}

                    {responses.length > 0 && (
                        <div style={{ marginTop: '32px' }}>
                            <div style={{ 
                                textAlign: 'center', 
                                marginBottom: '24px',
                                color: '#666',
                                fontSize: '16px',
                                lineHeight: '1.5'
                            }}>
                                Our suggestions are presented in an integrated way, considering different aspects of human well-being and approaches to health. Each recommendation is carefully analyzed from multiple perspectives to provide you with comprehensive guidance.
                            </div>
                            <Tabs 
                                items={items} 
                                defaultActiveKey="mental"
                                centered
                            />
                            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                <Button 
                                    type="primary" 
                                    onClick={saveSelectedHabits}
                                    disabled={!isConnected}
                                    style={{ 
                                        maxWidth: '300px',
                                        background: 'linear-gradient(135deg, #2d84eb 0%, #8259ef 100%)',
                                        border: 'none',
                                        color: '#fff',
                                        height: '40px'
                                    }}
                                >
                                    Save Selected Habits
                                </Button>
                                {!isConnected && (
                                    <div style={{ marginTop: '8px', color: '#ff4d4f' }}>
                                        Please sign in to save your habits
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Space>
            </form>
        </div>
    );
}; 