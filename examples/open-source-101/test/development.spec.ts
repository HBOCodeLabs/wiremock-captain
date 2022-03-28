import supertest from 'supertest';
import { WireMock } from 'wiremock-captain';
import spotifyGetArtistResponse from './../src/spotify-get-artist-200-resp.json';

const app = supertest('http://localhost:8080');

describe('/artist-popularity', () => {
    const mockServer = new WireMock('http://localhost:8085');

    afterEach(() => {
        // clear mocks after each test
        return mockServer.clearAllExceptDefault();
    });

    test('should respond back with successful response when spotify API is working', async () => {
        // register successful Spotify API response
        await mockServer.register(
            // incoming request schema
            {
                method: 'GET',
                endpoint: '/v1/artists/0TnOYISbd1XYRBk9myaseg',
            },
            // successful response schema
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
        expect(resp.body.artistGenres).toBeDefined();
        expect(resp.body.artistGenres.length).toBeGreaterThan(0);
    });

    // why use wiremock-captain
    test('should respond back with error response when spotify API returns 401', async () => {
        // register Spotify API response with 401 error
        await mockServer.register(
            // incoming request schema
            {
                method: 'GET',
                endpoint: '/v1/artists/0TnOYISbd1XYRBk9myaseg',
            },
            // error response schema
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
        expect(resp.body).toEqual('Spotify API errored with status code: 401');
    });
});
