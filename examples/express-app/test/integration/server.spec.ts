import * as supertest from 'supertest';
import { WireMock } from 'wiremock-captain';

describe('postProcessData', () => {
  const serviceUrl = process.env.TEST_ENDPOINT || 'localhost:3000';
  const mockInstance = new WireMock('http://localhost:8080');

  beforeAll(async () => {
    await mockInstance.register(
      {
        method: 'POST',
        endpoint: '/post',
      },
      {
        status: 200,
        body: {
          a: 1,
        },
      },
    );
  });

  afterAll(async () => {
    await mockInstance.clearAll();
  });

  test('should return 200', () => {
    return supertest(serviceUrl)
      .post('/processData')
      .send()
      .expect((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
          a: 1,
        });
      });
  });
});
