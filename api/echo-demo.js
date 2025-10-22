// api/echo-demo.js
export default function handler(req, res) {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<meta charset="utf-8">
<title>Echo POST Demo — RRR</title>
<style>
  body { font: 14px system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; line-height: 1.4; }
  button { padding: 10px 14px; border-radius: 10px; border: 1px solid #ccc; cursor: pointer; }
  textarea, input { width: 100%; max-width: 680px; }
  pre { background: #111; color: #eee; padding: 12px; border-radius: 10px; overflow:auto; max-width: 680px;}
  .row { margin: 12px 0; }
</style>
<h1>Echo POST Demo</h1>
<p>Click the button to send a JSON POST to <code>/api/echo</code>.</p>

<div class="row">
  <label>Payload (JSON):</label>
  <textarea id="payload" rows="5">{ "msg": "hi from JP", "n": 1 }</textarea>
</div>

<div class="row">
  <button id="send">Send POST</button>
</div>

<h3>Response</h3>
<pre id="out">(waiting)</pre>

<script>
  const btn = document.getElementById('send');
  const out = document.getElementById('out');
  const payloadEl = document.getElementById('payload');

  btn.onclick = async () => {
    try {
      const body = payloadEl.value || '{}';
      const r = await fetch('/api/echo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body
      });
      const j = await r.json();
      out.textContent = JSON.stringify(j, null, 2);
    } catch (e) {
      out.textContent = 'Error: ' + (e && e.message ? e.message : e);
    }
  };
</script>`);
}
