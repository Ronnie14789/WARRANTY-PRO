const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { createApp } = require('../src/server');
const { EncryptedJsonStore } = require('../src/store');

function createTestContext() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'warranty-pro-'));
  const store = new EncryptedJsonStore(path.join(dir, 'storage.enc'), 'test-secret');
  const app = createApp({ store });
  return { app, dir };
}

async function request(server, method, endpoint, body) {
  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}${endpoint}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: response.status,
    body: await response.json(),
  };
}

test('register entry, warranty, dashboard, reminders, and claims', async () => {
  const { app } = createTestContext();
  await new Promise((resolve) => app.listen(0, resolve));

  try {
    const entryRes = await request(app, 'POST', '/api/entries', {
      customerName: 'Alice',
      customerEmail: 'alice@example.com',
      productName: 'Washer Pro',
      serialNumber: 'SN123',
      purchaseDate: '2026-05-01',
    });

    assert.equal(entryRes.status, 201);

    const warrantyRes = await request(app, 'POST', '/api/warranties', {
      entryId: entryRes.body.id,
      warrantyStartDate: '2026-05-01',
      warrantyEndDate: '2099-06-10',
      provider: 'Warranty Co',
    });

    assert.equal(warrantyRes.status, 201);

    const dashboardRes = await request(app, 'GET', '/api/dashboard');
    assert.equal(dashboardRes.status, 200);
    assert.equal(dashboardRes.body.totals.entries, 1);
    assert.equal(dashboardRes.body.totals.warranties, 1);

    const reminderRes = await request(app, 'GET', '/api/reminders?days=36500');
    assert.equal(reminderRes.status, 200);
    assert.equal(reminderRes.body.reminders.length, 1);

    const claimRes = await request(app, 'POST', '/api/claims', {
      warrantyId: warrantyRes.body.id,
      description: 'Unit stopped powering on',
      notes: 'Started after voltage fluctuation',
      attachments: ['receipt.pdf'],
    });

    assert.equal(claimRes.status, 201);
    assert.equal(claimRes.body.status, 'OPEN');

    const updatedRes = await request(app, 'PATCH', `/api/claims/${claimRes.body.id}`, {
      status: 'IN_PROGRESS',
      note: 'Technician assigned',
    });

    assert.equal(updatedRes.status, 200);
    assert.equal(updatedRes.body.status, 'IN_PROGRESS');

    const claimsRes = await request(app, 'GET', '/api/claims');
    assert.equal(claimsRes.status, 200);
    assert.equal(claimsRes.body.claims.length, 1);
  } finally {
    app.close();
  }
});
