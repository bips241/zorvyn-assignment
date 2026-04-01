// Runtime entrypoint. I keep bootstrapping minimal here and delegate all wiring to `createApp()`.
import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
