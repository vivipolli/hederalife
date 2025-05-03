import { Client, TopicId, PrivateKey, TopicMessageSubmitTransaction, TopicMessageQuery } from '@hashgraph/sdk';
import dotenv from 'dotenv';
import LangChainAgent from './agents/langchainAgent.js';

dotenv.config({ path: './.env' });

const hederaClient = Client.forTestnet();
hederaClient.setOperator(process.env.HEDERA_ACCOUNT_ID, PrivateKey.fromStringECDSA(process.env.HEDERA_ACCOUNT_PRIVATE_KEY));

const agents = new Map();

async function initializeAgents() {
    const agentTypes = ['nutrition', 'medicine', 'spirituality', 'psychology'];
    
    for (const agentType of agentTypes) {
        try {
            const topicId = TopicId.fromString(process.env[`${agentType.toUpperCase()}_AGENT_TOPIC_ID`]);
            const agent = new LangChainAgent(hederaClient, topicId, agentType);
            agents.set(agentType, agent);
            agent.subscribeToTopic();
        } catch (error) {
            console.error(`Failed to initialize ${agentType} agent:`, error);
        }
    }
}

async function processHealthConcern(content) {
    if (agents.size === 0) {
        await initializeAgents();
    }
    
    const formattedMessage = {
        p: "hcs-10",
        op: "message",
        operator_id: `${process.env.HEDERA_ACCOUNT_ID}@${process.env.HEDERA_ACCOUNT_ID}`,
        data: JSON.stringify({
            type: "user_report",
            concern: content,
            timestamp: new Date().toISOString()
        }),
        m: "Health concern for analysis"
    };

    const message = JSON.stringify(formattedMessage);

    const agentPromises = Array.from(agents.values()).map(agent => {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                if (agent.lastResponse) {
                    resolve(agent.lastResponse);
                } else {
                    resolve(null);
                }
            }, 120000);

            const messageHandler = async (message) => {
                try {
                    const messageStr = message.message || new TextDecoder("utf-8").decode(message.contents);
                    const decodedMessage = JSON.parse(messageStr);
                    
                    if (decodedMessage.p === "hcs-10" && decodedMessage.op === "message") {
                        const messageData = JSON.parse(decodedMessage.data);
                        
                        if (messageData.type === "agent_response" && messageData.agent === agent.agentType) {
                            clearTimeout(timeout);
                            resolve(messageData);
                        }
                    }
                } catch (error) {
                    console.error(`[${agent.agentType}] Error processing message:`, error);
                }
            };

            agent.onMessage(messageHandler);

            const transaction = new TopicMessageSubmitTransaction()
                .setTopicId(agent.topicId)
                .setMessage(message)
                .execute(hederaClient)
                .catch(error => {
                    console.error(`[${agent.agentType}] Error sending message:`, error);
                    clearTimeout(timeout);
                    resolve(null);
                });
        });
    });

    const responses = await Promise.all(agentPromises);
    const validResponses = responses.filter(response => response !== null);

    return validResponses.map(response => ({
        agent: response.agent,
        content: response.rawResponse,
        timestamp: response.timestamp
    }));
}

export { processHealthConcern }; 