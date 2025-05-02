import { Client } from "@hashgraph/sdk";
import { TopicId } from "@hashgraph/sdk";
import MainAgent from './mainAgent.js';
import LangChainAgent from './langchainAgent.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

// Initialize Hedera client
const hederaClient = Client.forTestnet();
hederaClient.setOperator(
    process.env.HEDERA_ACCOUNT_ID,
    process.env.HEDERA_ACCOUNT_PRIVATE_KEY
);

// Initialize agents
const mainAgent = new MainAgent(
    hederaClient,
    TopicId.fromString(process.env.TOPIC_ID)
);

// Initialize specialized agents
const nutritionAgent = new LangChainAgent(
    hederaClient,
    TopicId.fromString(process.env.NUTRITION_AGENT_TOPIC_ID),
    'nutrition'
);

const medicineAgent = new LangChainAgent(
    hederaClient,
    TopicId.fromString(process.env.MEDICINE_AGENT_TOPIC_ID),
    'medicine'
);

const spiritualityAgent = new LangChainAgent(
    hederaClient,
    TopicId.fromString(process.env.SPIRITUALITY_AGENT_TOPIC_ID),
    'spirituality'
);

const psychologyAgent = new LangChainAgent(
    hederaClient,
    TopicId.fromString(process.env.PSYCHOLOGY_AGENT_TOPIC_ID),
    'psychology'
);

// Register specialized agents with main agent
mainAgent.setSpecializedAgent('nutrition', nutritionAgent);
mainAgent.setSpecializedAgent('medicine', medicineAgent);
mainAgent.setSpecializedAgent('spirituality', spiritualityAgent);
mainAgent.setSpecializedAgent('psychology', psychologyAgent);

// Start all agents
mainAgent.startAgents();

// Export agents for use in other files
export {
    mainAgent,
    nutritionAgent,
    medicineAgent,
    spiritualityAgent,
    psychologyAgent
}; 