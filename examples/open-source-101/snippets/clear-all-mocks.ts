import { WireMock } from 'wiremock-captain';

const mock = new WireMock('http://localhost:8085');

await mock.clearAll();
