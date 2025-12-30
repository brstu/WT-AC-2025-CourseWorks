import dotenv from 'dotenv';

dotenv.config();

import { app } from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // Simple startup log
  console.log(`Backend listening on http://localhost:${PORT}`);
});
