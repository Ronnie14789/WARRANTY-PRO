const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_SECRET = 'local-dev-storage-secret-change-me';
let hasLoggedDevSecretWarning = false;

const CLAIM_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
};

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function calculateWarrantyStatus(endDate, referenceDate = new Date()) {
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) {
    throw new Error('Invalid warranty end date');
  }

  const diffDays = Math.ceil((end - referenceDate) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 30) return 'EXPIRING';
  return 'ACTIVE';
}

class EncryptedJsonStore {
  constructor(filePath, secret = process.env.STORAGE_SECRET || DEFAULT_SECRET) {
    if (process.env.NODE_ENV === 'production' && !process.env.STORAGE_SECRET) {
      throw new Error('STORAGE_SECRET must be set in production');
    }
    if (secret === DEFAULT_SECRET && !hasLoggedDevSecretWarning) {
      hasLoggedDevSecretWarning = true;
      process.stderr.write(
        'Warning: using development STORAGE_SECRET. Set STORAGE_SECRET for secure deployments.\n'
      );
    }

    this.filePath = filePath;
    this.secret = secret;
    this.key = crypto.createHash('sha256').update(this.secret).digest();
    this.state = {
      entries: [],
      warranties: [],
      claims: [],
    };
    this.load();
  }

  getKey() {
    return this.key;
  }

  encrypt(plainText) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  decrypt(payload) {
    const buffer = Buffer.from(payload, 'base64');
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const data = buffer.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.getKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  }

  ensureDir() {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });
  }

  load() {
    if (!fs.existsSync(this.filePath)) return;

    const encryptedPayload = fs.readFileSync(this.filePath, 'utf8');
    if (!encryptedPayload.trim()) return;

    const raw = this.decrypt(encryptedPayload);
    this.state = JSON.parse(raw);
  }

  save() {
    this.ensureDir();
    const raw = JSON.stringify(this.state);
    const encryptedPayload = this.encrypt(raw);
    fs.writeFileSync(this.filePath, encryptedPayload, 'utf8');
  }

  addEntry(input) {
    const { customerName, customerEmail, productName, serialNumber, purchaseDate } = input;
    if (!customerName || !productName || !purchaseDate) {
      throw new Error('customerName, productName, and purchaseDate are required');
    }

    const entry = {
      id: makeId('entry'),
      customerName,
      customerEmail: customerEmail || null,
      productName,
      serialNumber: serialNumber || null,
      purchaseDate,
      createdAt: nowIso(),
    };

    this.state.entries.push(entry);
    this.save();
    return entry;
  }

  registerWarranty(input) {
    const { entryId, warrantyStartDate, warrantyEndDate, provider } = input;
    const entry = this.state.entries.find((record) => record.id === entryId);

    if (!entry) {
      throw new Error('entryId does not exist');
    }
    if (!warrantyStartDate || !warrantyEndDate || !provider) {
      throw new Error('warrantyStartDate, warrantyEndDate, and provider are required');
    }

    const warranty = {
      id: makeId('warranty'),
      entryId,
      warrantyStartDate,
      warrantyEndDate,
      provider,
      createdAt: nowIso(),
      status: calculateWarrantyStatus(warrantyEndDate),
    };

    this.state.warranties.push(warranty);
    this.save();
    return warranty;
  }

  getDashboard(referenceDate = new Date()) {
    const warranties = this.state.warranties.map((item) => ({
      ...item,
      status: calculateWarrantyStatus(item.warrantyEndDate, referenceDate),
    }));

    const summary = warranties.reduce(
      (acc, current) => {
        if (current.status === 'ACTIVE') acc.active += 1;
        if (current.status === 'EXPIRING') acc.expiring += 1;
        if (current.status === 'EXPIRED') acc.expired += 1;
        return acc;
      },
      { active: 0, expiring: 0, expired: 0 }
    );

    return {
      totals: {
        entries: this.state.entries.length,
        warranties: warranties.length,
        claims: this.state.claims.length,
      },
      summary,
      warranties,
    };
  }

  getReminders(days = 14, referenceDate = new Date()) {
    const withinDays = Number(days);
    if (Number.isNaN(withinDays) || withinDays < 1) {
      throw new Error('days must be a positive number');
    }

    return this.state.warranties
      .map((warranty) => {
        const end = new Date(warranty.warrantyEndDate);
        const daysLeft = Math.ceil((end - referenceDate) / (1000 * 60 * 60 * 24));
        const status = calculateWarrantyStatus(warranty.warrantyEndDate, referenceDate);
        return { ...warranty, daysLeft, status };
      })
      .filter((warranty) => warranty.daysLeft >= 0 && warranty.daysLeft <= withinDays)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }

  createClaim(input) {
    const { warrantyId, description, notes, attachments } = input;
    const warranty = this.state.warranties.find((record) => record.id === warrantyId);

    if (!warranty) {
      throw new Error('warrantyId does not exist');
    }
    if (!description) {
      throw new Error('description is required');
    }

    const claim = {
      id: makeId('claim'),
      warrantyId,
      description,
      notes: notes || '',
      attachments: Array.isArray(attachments) ? attachments : [],
      status: CLAIM_STATUS.OPEN,
      statusHistory: [{ status: CLAIM_STATUS.OPEN, note: 'Claim created', at: nowIso() }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    this.state.claims.push(claim);
    this.save();
    return claim;
  }

  updateClaim(claimId, input) {
    const claim = this.state.claims.find((record) => record.id === claimId);
    if (!claim) {
      throw new Error('claim does not exist');
    }

    const { status, note } = input;
    if (!Object.values(CLAIM_STATUS).includes(status)) {
      throw new Error(`status must be one of: ${Object.values(CLAIM_STATUS).join(', ')}`);
    }

    claim.status = status;
    claim.updatedAt = nowIso();
    claim.statusHistory.push({ status, note: note || '', at: nowIso() });

    this.save();
    return claim;
  }

  listClaims(warrantyId) {
    if (!warrantyId) {
      return this.state.claims;
    }
    return this.state.claims.filter((claim) => claim.warrantyId === warrantyId);
  }
}

module.exports = {
  EncryptedJsonStore,
  CLAIM_STATUS,
  calculateWarrantyStatus,
};
