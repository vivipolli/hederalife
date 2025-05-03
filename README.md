# Hedera Life 🌿

> A comprehensive health and wellness platform that leverages Hedera's Hashgraph Consensus Service (HCS) to provide integrated health recommendations from specialized AI agents.

## 📋 Overview

Hedera Life is a decentralized health assistant that combines multiple specialized AI agents to provide holistic health recommendations. The platform uses Hedera's HCS to ensure secure, transparent, and immutable communication between different health specialists (agents) and users. By making professional health advice accessible to everyone, regardless of location or financial means, Hedera Life democratizes access to quality health guidance. The platform's proactive approach to health management helps users prevent diseases before they develop, promoting long-term well-being through sustainable healthy habits. This preventive focus not only improves individual health outcomes but also contributes to reducing healthcare costs by minimizing the need for expensive medical interventions.

## 🛠 Technical Implementation

### 🔗 Hedera Integration

The project uses Hedera's JavaScript SDK to interact with the Hedera network. Key implementations include:

1. **Hedera Client Setup** (`src/agent.js`):
```javascript
const hederaClient = Client.forTestnet();
hederaClient.setOperator(process.env.HEDERA_ACCOUNT_ID, PrivateKey.fromStringECDSA(process.env.HEDERA_ACCOUNT_PRIVATE_KEY));
```

2. **Topic Creation and Management** (`src/server.js`):
```javascript
const response = await new TopicCreateTransaction()
    .setTopicMemo(description || 'New HCS Topic')
    .execute(hederaClient);
```

### 📨 HCS-10 Implementation

The project implements the HCS-10 standard for message formatting and communication between agents. Key implementations include:

1. **Message Format** (`src/agent.js`):
```javascript
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
```

2. **Message Processing** (`src/agents/langchainAgent.js`):
```javascript
const formattedResponse = {
    p: "hcs-10",
    op: "message",
    operator_id: `${process.env.HEDERA_ACCOUNT_ID}@${process.env.HEDERA_ACCOUNT_ID}`,
    data: JSON.stringify(this.lastResponse),
    m: `Response from ${this.agentType} agent`
};
```

### 🤖 Specialized Agents Architecture

The system implements four specialized agents that communicate through HCS topics:

1. **Nutrition Agent**: Provides dietary and nutritional recommendations
2. **Medicine Agent**: Offers medical and health-related advice
3. **Spirituality Agent**: Focuses on spiritual and emotional well-being
4. **Psychology Agent**: Addresses mental health and psychological aspects

Each agent:
- Subscribes to its dedicated HCS topic
- Processes health concerns using AI
- Returns formatted responses following HCS-10 standard
- Maintains message history and state

### 🔄 Message Flow

1. User submits a health concern through the frontend
2. The concern is formatted according to HCS-10 standard
3. The message is sent to all specialized agents through their respective HCS topics
4. Each agent processes the message and generates specialized recommendations
5. Responses are collected and presented to the user in an integrated format

### 🔒 Security and Consensus

- All messages are signed using the operator's private key
- Message integrity is verified through Hedera's consensus mechanism
- Each agent's response is immutable and timestamped
- The system maintains a complete audit trail of all interactions

## 💻 Frontend Implementation

The frontend is built with React and Ant Design, featuring:
- Real-time health concern submission
- Integrated view of recommendations from all agents
- Categorized suggestions (Mental, Physical, Spiritual)
- Health Habits Tracker for monitoring daily wellness activities
- Personalized health profile settings
- Web3Auth integration for secure authentication

## 🛠 Technical Stack

- **Backend**: Hedera AgentKit, Node.js, Express
- **Frontend**: React, TypeScript, Web3Auth
- **Blockchain**: Hedera Hashgraph
- **AI**: OpenRouter API
- **Storage**: Hedera HCS for immutable message storage
