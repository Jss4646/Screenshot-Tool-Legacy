import { NowRequest, NowResponse } from '@vercel/node'
const { sendWebScreenshot } = require('./tools/screenshot');

export default sendWebScreenshot;

