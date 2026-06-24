# WARRANTY-PRO

WARRANTY-PRO is a lightweight warranty management API that implements:

- **Customer/Product Entry**
- **Warranty Registration**
- **Secure Storage** (AES-256-GCM encrypted JSON file)
- **Warranty Dashboard** (active, expiring, expired)
- **Alerts & Reminder System** (expiring warranties)
- **Claims/Service Tracking** (status, notes, attachments, history)

## Requirements

- Node.js 18+

## Install

```bash
npm install
```

## Run

```bash
npm start
```

The server runs on `http://localhost:3000` by default.

## Validation

```bash
npm run lint
npm run build
npm test
```

## API Endpoints

### 1) Customer/Product Entry

`POST /api/entries`

```json
{
  "customerName": "Alice",
  "customerEmail": "alice@example.com",
  "productName": "Washer Pro",
  "serialNumber": "SN123",
  "purchaseDate": "2026-05-01"
}
```

### 2) Warranty Registration

`POST /api/warranties`

```json
{
  "entryId": "entry_xxx",
  "warrantyStartDate": "2026-05-01",
  "warrantyEndDate": "2027-05-01",
  "provider": "Warranty Co"
}
```

### 3) Dashboard

`GET /api/dashboard`

### 4) Reminder Alerts

`GET /api/reminders?days=14`

### 5) Claim Creation

`POST /api/claims`

```json
{
  "warrantyId": "warranty_xxx",
  "description": "Unit stopped powering on",
  "notes": "Started after voltage fluctuation",
  "attachments": ["receipt.pdf"]
}
```

### 6) Claim Update

`PATCH /api/claims/:claimId`

```json
{
  "status": "IN_PROGRESS",
  "note": "Technician assigned"
}
```

### 7) Claim Listing

`GET /api/claims`

Optional filter:

`GET /api/claims?warrantyId=warranty_xxx`
