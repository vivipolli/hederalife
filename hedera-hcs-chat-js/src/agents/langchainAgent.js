import { Client, TopicId, TopicMessageSubmitTransaction, TopicMessageQuery } from "@hashgraph/sdk";
import { handleLog } from "../utils.js";
import { processHealthConcern } from '../agent.js';
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

    // Format response according to HCS-10 standard
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

    // Send formatted response to HCS topic
    async sendResponse(formattedResponse) {
        try {
            const message = JSON.stringify(formattedResponse);
            console.log(`[${this.agentType}] Submitting message to topic:`, message);
            
            const transaction = await new TopicMessageSubmitTransaction()
                .setTopicId(this.topicId)
                .setMessage(message)
                .execute(this.hederaClient);

            const receipt = await transaction.getReceipt(this.hederaClient);
            console.log(`[${this.agentType}] Message submitted successfully:`, receipt.status);
            return true;
        } catch (error) {
            console.error(`[${this.agentType}] Error sending response:`, error);
            return false;
        }
    }

    // Process incoming messages and generate suggestions using LangChain
    async processMessage(messageData) {
        console.log(`[${this.agentType}] Processing message:`, messageData);
        
        if (messageData.type === "user_report") {
            try {
                const content = messageData.concern;
                console.log(`[${this.agentType}] Generating suggestions for:`, content);
                
                // Check cache for similar content
                if (this.lastResponse && this.lastResponse.originalContent === content) {
                    console.log(`[${this.agentType}] Using cached response for similar content`);
                    return await this.sendResponse(this.lastResponse);
                }
                
                const prompt = `As a ${this.agentType} expert, analyze this health concern and provide specific, actionable suggestions in the following format:

            Mental Health:
            - Scientific: [evidence-based approaches]
            - Holistic: [mind-body approaches]

            Physical Health:
            - Scientific: [evidence-based approaches]
            - Holistic: [mind-body approaches]

            Spiritual Health:
            - Scientific: [evidence-based approaches]
            - Holistic: [mind-body approaches]

            Focus on your area of expertise (${this.agentType}) and provide specific, actionable suggestions.`;
                
                console.log(`[${this.agentType}] Sending prompt to OpenRouter:`, prompt);
                const response = await this.llm.invoke([{ role: "user", content: prompt }]);
                console.log(`[${this.agentType}] Received response from OpenRouter:`, response);
                
                if (!response || !response.content) {
                    console.error(`[${this.agentType}] Invalid response format from OpenRouter:`, response);
                    return false;
                }

                // Store the raw response
                this.lastResponse = {
                    type: "agent_response",
                    agent: this.agentType,
                    originalContent: content,
                    rawResponse: response.content,
                    timestamp: new Date().toISOString()
                };
                
                // Format response according to HCS-10 standard
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

    // Subscribe to topic and process messages
    subscribeToTopic() {
        try {
            console.log(`[${this.agentType}] Starting subscription to topic ${this.topicId.toString()}`);
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
                                console.log(`[${this.agentType}] Processing message data:`, messageData);
                                
                                if (messageData.type === "user_report") {
                                    console.log(`[${this.agentType}] Found matching message type`);
                                    await this.processMessage(messageData);
                                }
                            }
                        } catch (error) {
                            console.error(`[${this.agentType}] Error processing message:`, error);
                        }
                    }
                );
            console.log(`[${this.agentType}] Successfully subscribed to topic`);
        } catch (error) {
            console.error(`[${this.agentType}] Failed to subscribe to topic:`, error);
        }
    }

    onMessage(handler) {
        this.messageHandler = handler;
        console.log(`[${this.agentType}] Message handler set`);
    }
}

export default LangChainAgent; 