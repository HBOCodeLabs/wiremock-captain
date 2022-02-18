import axios from 'axios';
import { Request, Response } from 'express';

const ENV = process.env.NODE_ENV;
const SERVICE_URL: Record<string, string> = {
  DEVELOPMENT: 'http://localhost:8080/post',
  PRODUCTION: 'https://postman-echo.com/post',
};

export function healthcheckRoute(
  _request: Request,
  response: Response,
): Promise<Response> {
  return Promise.resolve(response.send('OK!'));
}

export async function postProcessDataRoute(
  request: Request,
  response: Response,
): Promise<Response> {
  const url = ENV ? SERVICE_URL[ENV] : SERVICE_URL['DEVELOPMENT'];
  const { body } = request;

  try {
    const resp = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    const json = resp.data;
    return response.send(json);
  } catch (e) {
    const { name, message } = e;
    console.log(`ERROR! name=${name} message=${message}`);
    return response.sendStatus(500);
  }
}
