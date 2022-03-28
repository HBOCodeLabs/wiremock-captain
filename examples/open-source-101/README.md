## Setup

Update `package.json` to use
```
"start:dev": "NODE_ENV=development node --no-warnings --experimental-specifier-resolution=node --loader ts-node/esm src/development-final.ts",
"start:prod": "NODE_ENV=production node --no-warnings --experimental-specifier-resolution=node --loader ts-node/esm  src/development-final.ts",
```

To run the API in `production` environment:
- Setup Spotify API access
- Set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` into current SHELL (`bash`, `zsh`, etc.) instance
- Run `nvm use`
- Run `npm ci`
- Run `npm run start:prod`

To run the API in `development` environment:
- Start WireMock server instance in docker using the following command:
```
docker run -itd --rm --name spotify-server -p 8085:8080 wiremock/wiremock:2.31.0 --record-mappings --verbose
```
- Run `nvm use`
- Run `npm ci`
- Run `npm run start:dev`


To run the tests:
- Start WireMock server instance in docker using the following command:
```
docker run -itd --rm --name spotify-server -p 8085:8080 wiremock/wiremock:2.31.0 --record-mappings --verbose
```
- Run `nvm use`
- Run `npm ci`
- Run `npm run start:dev`
- In another terminal instance, run `npm run test`
