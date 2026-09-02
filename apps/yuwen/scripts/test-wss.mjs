// 测 wss 连通性
import WebSocket from 'ws'
const ws = new WebSocket('wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=t', {
  origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.66 Safari/537.36 Edg/103.0.1264.44' }
});
ws.on('open', () => { console.log('OPEN'); ws.close(); process.exit(0); });
ws.on('error', (e) => { console.log('ERROR:', e.message); process.exit(1); });
ws.on('unexpected-response', (req, res) => { console.log('UNEXPECTED:', res.statusCode); process.exit(1); });
setTimeout(() => { console.log('TIMEOUT'); process.exit(1); }, 10000);
