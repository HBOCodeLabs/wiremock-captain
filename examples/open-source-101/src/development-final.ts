import axios from 'axios';
import express from 'express';
import { pinoHttp } from 'pino-http';
import { WireMock } from 'wiremock-captain';
import spotifyGetArtistResponse from './spotify-get-artist-200-resp.json';
import { getSpotifyAccessToken } from './utils';

// SPOTIFY GET artist API doc
// https://developer.spotify.com/documentation/web-api/reference/#/operations/get-an-artist

const ENV: string = process.env.NODE_ENV!;
const PORT = 8080;

const httpLogger = pinoHttp({
    prettyPrint: { translateTime: true, singleLine: true, colorize: true },
    customReceivedMessage: (_req, _res) => 'request received',
});

if (ENV === 'development') {
    // create mock server instance
    const mockServer = new WireMock(getSpotifyServerUrl());

    // register request-response schema against mock server instance
    await mockServer.register(
        { endpoint: getSpotifyAristApi(), method: 'GET' },
        {
            status: 200,
            body: spotifyGetArtistResponse,
        },
    );

    httpLogger.logger.info('started mock spotify server');
}

const app = express();
app.use(httpLogger);

// set up API
app.get('/artist-popularity', async (req: express.Request, res: express.Response) => {
    try {
        const spotifyServer = getSpotifyServerUrl();
        const spotifyArtistApi = getSpotifyAristApi();

        req.log.info('making external request to ' + spotifyServer + spotifyArtistApi);

        const accessToken = await getSpotifyAccessToken();
        const resp = await axios.get(spotifyServer + spotifyArtistApi, {
            headers: { Authorization: 'Bearer ' + accessToken },
            timeout: 1000,
        });
        const data = resp.data;

        // construct API response
        const artistInfo = {
            artistName: data.name,
            artistPopularity: data.popularity,
            artistGenres: data.genres,
        };

        res.status(200).json(artistInfo);
    } catch (e: any) {
        const externalApiErrorStatus = e.response?.status;

        if (externalApiErrorStatus) {
            // Spotify responded with non-200 status code
            // Respond with Spotify's error response status code
            res.status(externalApiErrorStatus).json(
                'Spotify API errored with status code: ' + externalApiErrorStatus,
            );
        } else {
            // Error occured outside of talking with Spotify's API
            // Respond back with a generic 500 status code
            res.sendStatus(500).json('Internal Server Error');
        }
    }
});

// start the Express server
app.listen(PORT, () => {
    httpLogger.logger.info(
        'artist popularity API running at http://localhost:' + PORT + '/artist-popularity',
    );
});

function getSpotifyAristApi(): string {
    // v1/artist/{id}
    // static artist ID
    return '/v1/artists/0TnOYISbd1XYRBk9myaseg';
}

function getSpotifyServerUrl(): string {
    if (ENV === 'production') return 'https://api.spotify.com';

    return 'http://localhost:8085';
}
