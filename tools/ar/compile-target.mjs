// Compiles public/ar/cartao-alvo.png into public/ar/cartao.mind with MindAR's own compiler, inside a browser.
// Needs: python -m http.server 5174 (project root) and Edge/Chrome with --remote-debugging-port (CDP env, default :9222).
// Run it on a real GPU (--use-angle=d3d11): under SwiftShader the tfjs math is wrong and the target never detects.
import { writeFileSync } from 'node:fs';
const CDP = process.env.CDP || 'http://127.0.0.1:9222';
const page = await (await fetch(CDP + '/json/new?http://127.0.0.1:5174/tools/ar/compile.html', { method: 'PUT' })).json();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const wait = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); wait.get(d.id)?.(d); };
const ev = (expression) => new Promise((res) => { const i = ++id; wait.set(i, res); ws.send(JSON.stringify({ id: i, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } })); });
for (let t = 0; t < 60 && !(await ev('window.ready === true')).result?.result?.value; t++) await new Promise((r) => setTimeout(r, 500));
const r = await ev("compileTarget('/public/ar/cartao-alvo.png')");
const b64 = r.result?.result?.value;
if (!b64) { console.error('compile failed', JSON.stringify(r).slice(0, 500)); process.exit(1); }
writeFileSync(new URL('../../public/ar/cartao.mind', import.meta.url), Buffer.from(b64, 'base64'));
console.log('public/ar/cartao.mind', Buffer.from(b64, 'base64').length, 'bytes');
ws.close();
await fetch(`${CDP}/json/close/${page.id}`);
