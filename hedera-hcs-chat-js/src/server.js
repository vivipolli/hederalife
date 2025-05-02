import express from 'express';
import cors from 'cors';
import { processHealthConcern } from './agent.js';
import dotenv from 'dotenv';
import { Client, TopicCreateTransaction, TopicId, TopicMessageQuery } from "@hashgraph/sdk";

dotenv.config({ path: './.env' });

const app = express();
const port = process.env.PORT || 3000;

// Initialize Hedera client
const hederaClient = Client.forTestnet();
hederaClient.setOperator(
    process.env.HEDERA_ACCOUNT_ID,
    process.env.HEDERA_ACCOUNT_PRIVATE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Create topic endpoint
app.post('/api/create-topic', async (req, res) => {
    try {
        const { description } = req.body;
        
        const response = await new TopicCreateTransaction()
            .setTopicMemo(description || 'New HCS Topic')
            .execute(hederaClient);

        const receipt = await response.getReceipt(hederaClient);
        const topicId = receipt.topicId.toString();

        res.json({ 
            status: 'success', 
            message: 'Topic created successfully',
            topicId 
        });
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to create topic',
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Service is running' });
});

// Submit health concern
app.post('/api/health/concern', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const response = await processHealthConcern(content);
        res.json(response);
    } catch (error) {
        console.error('Error processing health concern:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get responses for a user
app.get('/api/responses/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        // TODO: Implement response retrieval from Hedera HCS
        res.json({
            status: 'success',
            responses: []
        });
    } catch (error) {
        console.error('Error getting responses:', error);
        res.status(500).json({ error: 'Failed to get responses' });
    }
});

// Get responses from specialized agents
app.get('/api/health/responses/:topicId', async (req, res) => {
    try {
        const { topicId } = req.params;
        
        const messages = [];
        new TopicMessageQuery()
            .setTopicId(TopicId.fromString(topicId))
            .subscribe(hederaClient,
                (error) => {
                    console.error('Error subscribing to topic:', error);
                },
                (message) => {
                    try {
                        const messageStr = message.message || new TextDecoder("utf-8").decode(message.contents);
                        const data = JSON.parse(messageStr);
                        messages.push({
                            agent: data.operator_id.split('@')[0],
                            response: data.data,
                            timestamp: data.timestamp
                        });
                    } catch (e) {
                        console.error('Error processing message:', e);
                    }
                }
            );

        if (messages.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'No messages found for this topic'
            });
        }

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({ 
            error: 'Failed to fetch responses',
            details: error.message 
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export { app }; 