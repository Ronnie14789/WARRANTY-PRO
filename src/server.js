const http = require('http');
const path = require('path');
const { EncryptedJsonStore } = require('./store');

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function notFound(res) {
  return json(res, 404, { error: 'Not found' });
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    req.on('data', (chunk) => {
      buffer += chunk;
      if (buffer.length > 1_000_000) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!buffer) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(buffer));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function createApp({ store } = {}) {
  const dataStore =
    store || new EncryptedJsonStore(path.resolve(process.cwd(), 'data', 'storage.enc'));

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return json(res, 200, { ok: true });
      }

      if (req.method === 'POST' && url.pathname === '/api/entries') {
        const body = await getBody(req);
        const created = dataStore.addEntry(body);
        return json(res, 201, created);
      }

      if (req.method === 'POST' && url.pathname === '/api/warranties') {
        const body = await getBody(req);
        const created = dataStore.registerWarranty(body);
        return json(res, 201, created);
      }

      if (req.method === 'GET' && url.pathname === '/api/dashboard') {
        return json(res, 200, dataStore.getDashboard());
      }

      if (req.method === 'GET' && url.pathname === '/api/reminders') {
        const days = url.searchParams.get('days') || '14';
        return json(res, 200, { reminders: dataStore.getReminders(days) });
      }

      if (req.method === 'POST' && url.pathname === '/api/claims') {
        const body = await getBody(req);
        const created = dataStore.createClaim(body);
        return json(res, 201, created);
      }

      if (req.method === 'GET' && url.pathname === '/api/claims') {
        const warrantyId = url.searchParams.get('warrantyId');
        return json(res, 200, { claims: dataStore.listClaims(warrantyId) });
      }

      if (req.method === 'PATCH' && url.pathname.startsWith('/api/claims/')) {
        const claimId = url.pathname.split('/').pop();
        const body = await getBody(req);
        const updated = dataStore.updateClaim(claimId, body);
        return json(res, 200, updated);
      }

      return notFound(res);
    } catch (error) {
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        process.stderr.write(`Request error: ${error.message}\n`);
      }
      return json(res, 400, { error: isProduction ? 'Request failed' : error.message });
    }
  });

  return server;
}

function startServer(port = process.env.PORT || 3000) {
  const app = createApp();
  app.listen(port, () => {
    process.stdout.write(`WARRANTY-PRO listening on http://localhost:${port}\n`);
  });
  return app;
}

module.exports = {
  createApp,
  startServer,
};
