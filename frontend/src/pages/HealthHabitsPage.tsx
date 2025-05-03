import { useEffect, useState } from 'react';
import { Card, List, Tag, Progress, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface Habit {
    id: string;
    category: string;
    type: string;
    suggestion: string;
    completed: boolean;
    date: string;
}

const HealthHabitsPage = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const savedHabits = localStorage.getItem('healthHabits');
        if (savedHabits) {
            setHabits(JSON.parse(savedHabits));
        }
    }, []);

    const toggleHabit = (id: string) => {
        const updatedHabits = habits.map(habit => 
            habit.id === id ? { ...habit, completed: !habit.completed } : habit
        );
        setHabits(updatedHabits);
        localStorage.setItem('healthHabits', JSON.stringify(updatedHabits));
    };

    const getProgress = () => {
        if (habits.length === 0) return 0;
        const completed = habits.filter(h => h.completed).length;
        return Math.round((completed / habits.length) * 100);
    };

    const getHabitsByCategory = (category: string) => {
        return habits.filter(h => h.category === category);
    };

    return (
        <div>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <Button 
                    type="primary" 
                    onClick={() => navigate('/')}
                    style={{ 
                        maxWidth: '300px',
                        background: 'linear-gradient(135deg, #2d84eb 0%, #8259ef 100%)',
                        border: 'none',
                        color: '#fff',
                        height: '40px'
                    }}
                >
                    Back to Health Concern Form
                </Button>
            </div>

            <Card 
                title="Health Habits Tracker" 
                style={{ 
                    background: 'linear-gradient(135deg, #2d84eb11 0%, #8259ef11 100%)',
                    border: '1px solid rgba(45, 132, 235, 0.1)'
                }}
            >
                <div style={{ marginBottom: '24px' }}>
                    <Progress 
                        percent={getProgress()} 
                        status={getProgress() === 100 ? 'success' : 'active'}
                        format={percent => `${percent}% Completed`}
                    />
                </div>

                <List
                    dataSource={['mental', 'physical', 'spiritual']}
                    renderItem={category => (
                        <List.Item>
                            <Card 
                                title={category.charAt(0).toUpperCase() + category.slice(1) + ' Health'}
                                style={{ width: '100%' }}
                            >
                                <List
                                    dataSource={getHabitsByCategory(category)}
                                    renderItem={habit => (
                                        <List.Item>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                width: '100%',
                                                justifyContent: 'space-between'
                                            }}>
                                                <div>
                                                    <Tag color={habit.type === 'scientific' ? '#2d84eb' : '#8259ef'}>
                                                        {habit.type.charAt(0).toUpperCase() + habit.type.slice(1)}
                                                    </Tag>
                                                    <span>{habit.suggestion}</span>
                                                </div>
                                                <Button
                                                    type="text"
                                                    icon={habit.completed ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                                                    onClick={() => toggleHabit(habit.id)}
                                                />
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default HealthHabitsPage; 