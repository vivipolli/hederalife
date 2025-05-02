import { Client, TopicId, TopicMessageSubmitTransaction, TopicMessageQuery } from "@hashgraph/sdk";
import { handleLog } from "../utils.js";

class MainAgent {
    constructor(hederaClient, topicId) {
        this.hederaClient = hederaClient;
        this.topicId = topicId;
        this.logStatus = "Default";
        this.specializedAgents = {};
    }

    setSpecializedAgent(agentType, agent) {
        this.specializedAgents[agentType] = agent;
        handleLog(`Set ${agentType} agent`, null, this.logStatus);
    }

    // Format user report according to HCS-10 standard
    formatUserReport(userReport) {
        return {
            p: "hcs-10",
            op: "message",
            operator_id: `${this.topicId}@${this.hederaClient.operatorAccountId}`,
            data: JSON.stringify({
                type: "user_report",
                content: userReport.content,
                timestamp: new Date().toISOString(),
                metadata: userReport.metadata || {}
            }),
            m: "User health report submission"
        };
    }

    // Send formatted message to HCS topic
    async sendMessage(formattedMessage) {
        try {
            const message = JSON.stringify(formattedMessage);
            await new TopicMessageSubmitTransaction()
                .setTopicId(this.topicId)
                .setMessage(message)
                .execute(this.hederaClient);

            handleLog("Message sent to HCS", message, this.logStatus);
            return true;
        } catch (error) {
            handleLog("ERROR: Failed to send message", error, this.logStatus);
            return false;
        }
    }

    // Process user report and send to HCS
    async processUserReport(userReport) {
        const formattedMessage = this.formatUserReport(userReport);
        const success = await this.sendMessage(formattedMessage);
        
        if (success) {
            // Forward to specialized agents
            for (const [agentType, agent] of Object.entries(this.specializedAgents)) {
                const specializedMessage = {
                    p: "hcs-10",
                    op: "message",
                    operator_id: `${this.topicId}@${this.hederaClient.operatorAccountId}`,
                    to: `${agent.topicId}@${agent.hederaClient.operatorAccountId}`,
                    data: JSON.stringify({
                        type: `${agentType}_analysis`,
                        content: userReport.content,
                        timestamp: new Date().toISOString()
                    }),
                    m: `Forwarding to ${agentType} agent`
                };
                await agent.sendMessage(specializedMessage);
            }
        }
        
        return success;
    }

    // Subscribe to topic for responses from LangChain agent
    subscribeToResponses(callback) {
        try {
            new TopicMessageQuery()
                .setTopicId(this.topicId)
                .subscribe(this.hederaClient,
                    (error) => {
                        handleLog("Message subscriber error", error, this.logStatus);
                    },
                    (message) => {
                        const decodedMessage = JSON.parse(new TextDecoder("utf-8").decode(message.contents));
                        if (decodedMessage.p === "hcs-10" && decodedMessage.op === "message") {
                            const responseData = JSON.parse(decodedMessage.data);
                            if (responseData.type === "agent_response") {
                                callback(responseData);
                            }
                        }
                    }
                );
            handleLog("Subscribed to topic responses", this.topicId.toString(), this.logStatus);
        } catch (error) {
            handleLog("ERROR: Failed to subscribe to topic", error, this.logStatus);
        }
    }

    // Start the LangChain agent
    async startAgents() {
        console.log('Starting main agent...');
        
        // Start main agent subscription
        this.subscribeToResponses((response) => {
            console.log('Received response from specialized agent:', response);
        });

        // Start specialized agents
        for (const [agentType, agent] of Object.entries(this.specializedAgents)) {
            console.log(`Starting ${agentType} agent...`);
            await agent.subscribeToTopic();
            console.log(`${agentType} agent started successfully`);
        }
        
        console.log('All agents started successfully');
    }
}

export default MainAgent; 