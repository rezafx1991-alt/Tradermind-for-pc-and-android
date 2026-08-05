import { spawn } from 'node:child_process';
import { createWriteStream, mkdirSync, rmSync } from 'node:fs';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

const root = new URL('../tradermind/dist/public/', import.meta.url);
const outputPath = new URL('./exports/TraderMind-intro-1.2.9.mp4', import.meta.url);
const outputFile = outputPath.pathname;
const port = 4173;
const cdpPort = 9222;
const durationMs = 24_300;
const captureFps = 30;
const width = 1920;
const height = 1080;
const chromium =
  process.env.CHROMIUM_BIN ||
  '/nix/store/5afrhwm7zqn1vb7p5z1mc2rkh2grsfgz-ungoogled-chromium-138.0.7204.100/bin/chromium';

mkdirSync(new URL('./exports/', import.meta.url), { recursive: true });
rmSync(outputFile, { force: true });

const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', root.pathname], {
  stdio: ['ignore', 'ignore', 'inherit'],
});
const browser = spawn(chromium, [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--hide-scrollbars',
  `--window-size=${width},${height}`,
  `--remote-debugging-port=${cdpPort}`,
  '--remote-allow-origins=*',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'inherit'] });

const cleanup = () => {
  server.kill('SIGTERM');
  browser.kill('SIGTERM');
};
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function waitFor(url, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {}
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

await waitFor(`http://127.0.0.1:${port}/index.html`);
const tabResponse = await waitFor(`http://127.0.0.1:${cdpPort}/json/list`);
const tabs = await tabResponse.json();
console.log('CDP targets:', tabs.map((candidate) => `${candidate.type}:${candidate.url}`).join(' | '));
const tab = tabs.find((candidate) => candidate.type === 'page' && candidate.webSocketDebuggerUrl);
if (!tab?.webSocketDebuggerUrl) throw new Error('Chrome did not expose a debuggable page');

const socket = new WebSocket(tab.webSocketDebuggerUrl);
await once(socket, 'open');
let nextId = 0;
let lastFrameAt = Date.now();
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
  if (message.method === 'Page.screencastFrame') {
    const { data, sessionId } = message.params;
    if (frames < 3) console.log('Frame received', frames + 1, 'bytes', data.length);
    lastFrameAt = Date.now();
    onFrame?.(Buffer.from(data, 'base64'));
    void send('Page.screencastFrameAck', { sessionId });
  }
});

function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: false,
});
await send('Page.navigate', { url: `http://127.0.0.1:${port}/video` });
await delay(500);
await send('Runtime.evaluate', {
  expression: `document.fonts?.ready ? document.fonts.ready : Promise.resolve()`,
  awaitPromise: true,
});

const ffmpeg = spawn('ffmpeg', [
  '-hide_banner',
  '-loglevel', 'error',
  '-f', 'image2pipe',
  '-framerate', String(captureFps),
  '-vcodec', 'mjpeg',
  '-i', 'pipe:0',
  '-an',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '18',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-y', outputFile,
], { stdio: ['pipe', 'ignore', 'inherit'] });

let frames = 0;
let onFrame = (jpeg) => {
  frames += 1;
  if (!ffmpeg.stdin.destroyed) ffmpeg.stdin.write(jpeg);
};
console.log('Starting screencast...');

const screencast = await send('Page.startScreencast', {
  format: 'jpeg',
  quality: 96,
  maxWidth: width,
  maxHeight: height,
  everyNthFrame: 1,
});
console.log('Screencast result:', JSON.stringify(screencast));
await send('Page.screencastFrameAck', { sessionId: 0 }).catch(() => {});
const captureStarted = Date.now();
while (Date.now() - captureStarted < durationMs) {
  if (Date.now() - lastFrameAt > 400) {
    await send('Page.screencastFrameAck', { sessionId: 0 }).catch(() => {});
  }
  await send('Page.captureScreenshot', { format: 'jpeg', quality: 96 }).then(({ data }) => onFrame?.(Buffer.from(data, 'base64'))).catch(() => {});
  await delay(1000 / captureFps);
}
await send('Page.stopScreencast');
onFrame = null;
ffmpeg.stdin.end();
await once(ffmpeg, 'close');
socket.close();
cleanup();

if (frames < 100) throw new Error(`Capture produced only ${frames} frames`);
console.log(`Captured ${frames} frames to ${outputFile}`);