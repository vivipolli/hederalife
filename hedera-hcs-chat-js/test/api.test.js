import request from 'supertest';
import { app } from '../src/server.js';
import { expect } from 'chai';

describe('API Tests', () => {
    const testUserId = 'test-user-123';
    const testConcern = 'I have been having trouble sleeping lately. What can I do to improve my sleep quality?';

    describe('Health Check', () => {
        it('should return 200 and status ok', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).to.deep.equal({
                status: 'ok',
                message: 'Service is running'
            });
        });
    });

    describe('Health Concern Submission', () => {
        it('should successfully submit a health concern', async () => {
            const response = await request(app)
                .post('/api/health-concern')
                .send({
                    content: testConcern,
                    userId: testUserId
                })
                .expect(200);

            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('message', 'Health concern submitted successfully');
            expect(response.body).to.have.property('userId', testUserId);
            expect(response.body).to.have.property('response').that.is.a('string');
        });

        it('should return 400 if content is missing', async () => {
            const response = await request(app)
                .post('/api/health-concern')
                .send({
                    userId: testUserId
                })
                .expect(400);

            expect(response.body).to.have.property('error', 'Content is required');
        });
    });

    describe('Get User Responses', () => {
        it('should return empty array for responses', async () => {
            const response = await request(app)
                .get(`/api/responses/${testUserId}`)
                .expect(200);

            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('responses').that.is.an('array').that.is.empty;
        });
    });
}); 