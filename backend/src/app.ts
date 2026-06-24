import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

const upload = multer({ dest: 'uploads/' });

export const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

app.post('/api/v1/claims/:id/attachments', upload.array('files', 20), (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];

  const invalid = files.find((file) => !acceptedTypes.includes(file.mimetype));

  if (invalid) {
    res.status(400).json({ message: `Unsupported file type: ${invalid.mimetype}` });
    return;
  }

  res.status(201).json({ uploaded: files.map((f) => ({ fileName: f.originalname, mimeType: f.mimetype, path: f.path })) });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);
app.use(errorHandler);
