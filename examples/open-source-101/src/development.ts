import axios from 'axios';
import express from 'express';
import { pinoHttp } from 'pino-http';
import { getSpotifyAccessToken } from './utils';

const ENV: string = process.env.NODE_ENV!;
const PORT = 8080;

const httpLogger = pinoHttp({
    prettyPrint: { translateTime: true, singleLine: true, colorize: true },
    customReceivedMessage: (_req, _res) => 'request received',
});

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

        res.status(200).json({ artistName: data.name, artistPopularity: data.popularity });
    } catch (e: any) {
        const externalApiErrorStatus = e.response?.status;
        const externalApiErrorData = e.response?.data;

        if (externalApiErrorStatus) {
            res.status(externalApiErrorStatus).json(externalApiErrorData);
        } else {
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
    return 'https://api.spotify.com';
}
