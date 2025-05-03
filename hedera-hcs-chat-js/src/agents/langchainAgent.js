import { TopicMessageSubmitTransaction, TopicMessageQuery } from "@hashgraph/sdk";
import { createInstance as createLlmInstance } from '../api/openrouter-openai.js';

class LangChainAgent {
    constructor(hederaClient, topicId, agentType) {
        this.hederaClient = hederaClient;
        this.topicId = topicId;
        this.agentType = agentType;
        this.logStatus = "Default";
        this.llm = createLlmInstance();
        this.lastResponse = null;
    }

    formatResponse(content, suggestions) {
        return {
            p: "hcs-10",
            op: "message",
            data: JSON.stringify({
                type: "agent_response",
                agent: this.agentType,
                originalContent: content,
                suggestions: suggestions,
                timestamp: new Date().toISOString()
            })
        };
    }

    async sendResponse(formattedResponse) {
        try {
            const message = JSON.stringify(formattedResponse);
            const transaction = await new TopicMessageSubmitTransaction()
                .setTopicId(this.topicId)
                .setMessage(message)
                .execute(this.hederaClient);

            await transaction.getReceipt(this.hederaClient);
            return true;
        } catch (error) {
            console.error(`[${this.agentType}] Error sending response:`, error);
            return false;
        }
    }

    async processMessage(messageData) {
        if (messageData.type === "user_report") {
            try {
                const content = messageData.concern;
                
                if (this.lastResponse && this.lastResponse.originalContent === content) {
                    return await this.sendResponse(this.lastResponse);
                }
                
                const prompt = `As a ${this.agentType} expert, analyze this health concern and provide specific, actionable habits and tips that can help address the issue. For each health area, suggest practical daily habits that the person can implement:

                Mental Health:
                - Scientific: [specific evidence-based habits and practices]
                - Holistic: [practical mind-body habits and routines]

                Physical Health:
                - Scientific: [specific evidence-based habits and practices]
                - Holistic: [practical mind-body habits and routines]

                Spiritual Health:
                - Scientific: [specific evidence-based habits and practices]
                - Holistic: [practical mind-body habits and routines]

                Example for insomnia:
                Mental Health:
                - Scientific: Establish a consistent bedtime routine, read a book before sleep
                - Holistic: Practice gratitude journaling, avoid screens 1 hour before bed

                Physical Health:
                - Scientific: Regular exercise during the day, maintain consistent sleep schedule
                - Holistic: Gentle yoga before bed, warm bath in the evening

                Spiritual Health:
                - Scientific: Mindfulness meditation, breathing exercises
                - Holistic: Evening prayer or reflection, calming music

                Focus on your area of expertise (${this.agentType}) and provide specific, actionable habits that can be easily incorporated into daily life. Each suggestion should be practical and directly related to addressing the health concern.`;
                
                const response = await this.llm.invoke([{ role: "user", content: prompt }]);
                
                if (!response || !response.content) {
                    console.error(`[${this.agentType}] Invalid response format from OpenRouter:`, response);
                    return false;
                }

                this.lastResponse = {
                    type: "agent_response",
                    agent: this.agentType,
                    originalContent: content,
                    rawResponse: response.content,
                    timestamp: new Date().toISOString()
                };
                
                const formattedResponse = {
                    p: "hcs-10",
                    op: "message",
                    operator_id: `${process.env.HEDERA_ACCOUNT_ID}@${process.env.HEDERA_ACCOUNT_ID}`,
                    data: JSON.stringify(this.lastResponse),
                    m: `Response from ${this.agentType} agent`
                };
                
                return await this.sendResponse(formattedResponse);
            } catch (error) {
                console.error(`[${this.agentType}] Error processing message:`, error);
                return false;
            }
        }
        return false;
    }

    subscribeToTopic() {
        try {
            new TopicMessageQuery()
                .setTopicId(this.topicId)
                .subscribe(this.hederaClient,
                    (error) => {
                        console.error(`[${this.agentType}] Message subscriber error:`, error);
                    },
                    async (message) => {
                        try {
                            const messageStr = message.message || new TextDecoder("utf-8").decode(message.contents);
                            const decodedMessage = JSON.parse(messageStr);
                            
                            if (decodedMessage.p === "hcs-10" && decodedMessage.op === "message") {
                                const messageData = JSON.parse(decodedMessage.data);
                                
                                if (messageData.type === "user_report") {
                                    await this.processMessage(messageData);
                                }
                            }
                        } catch (error) {
                            console.error(`[${this.agentType}] Error processing message:`, error);
                        }
                    }
                );
        } catch (error) {
            console.error(`[${this.agentType}] Failed to subscribe to topic:`, error);
        }
    }

    onMessage(handler) {
        this.messageHandler = handler;
    }
}

export default LangChainAgent; 