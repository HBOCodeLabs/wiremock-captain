import supertest from 'supertest';
import { WireMock } from 'wiremock-captain';
import spotifyGetArtistResponse from './../src/spotify-get-artist-200-resp.json';

const app = supertest('http://localhost:8080');

describe('/artist-popularity', () => {
    const mockServer = new WireMock('http://localhost:8085');

    afterEach(() => {
        return mockServer.clearAllExceptDefault();
    });

    test('should respond back with successful response when spotify API is working', async () => {
        await mockServer.register(
            {
                method: 'GET',
                endpoint: '/v1/artists/0TnOYISbd1XYRBk9myaseg',
            },
            {
                status: 200,
                body: spotifyGetArtistResponse,
            },
        );

        const resp = await app.get('/artist-popularity');
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toBeDefined();
        expect(resp.body.artistName).toBeDefined();
        expect(resp.body.artistPopularity).toBeDefined();
    });

    test('should respond back with error response when spotify API returns 401', async () => {
        await mockServer.register(
            {
                method: 'GET',
                endpoint: '/v1/artists/0TnOYISbd1XYRBk9myaseg',
            },
            {
                status: 401,
                body: {
                    error: {
                        status: 401,
                        message: 'string',
                    },
                },
            },
        );

        const resp = await app.get('/artist-popularity');
        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toBeDefined();
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: 'string',
            },
        });
    });
});
