import axios from 'axios';

const ENV = process.env.NODE_ENV;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const TOKEN_PARAMS = new URLSearchParams();
TOKEN_PARAMS.append('grant_type', 'client_credentials');
const TOKEN_PARAMS_STRING = TOKEN_PARAMS.toString();

export async function getSpotifyAccessToken(): Promise<string> {
    if (ENV === 'development') return 'test-auth-header';

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) throw new Error('spotify creds not present');

    const basicAuthHeader = Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString(
        'base64',
    );

    const resp = await axios.post('https://accounts.spotify.com/api/token', TOKEN_PARAMS_STRING, {
        headers: {
            Accept: 'application/json',
            Authorization: `Basic ${basicAuthHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 1000,
    });

    return resp.data.access_token;
}
