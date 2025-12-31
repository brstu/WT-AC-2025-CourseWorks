import dotenv from "dotenv";

dotenv.config();

import { app } from "./app";
import { startSlaEscalationWorker } from "./workers/slaEscalation.worker";
import { ensureSeedAdmin } from "./workers/seedAdmin";
import { ensureDefaultQueueAndSla } from "./workers/seedDefaults";

const PORT = process.env.SERVER_PORT || 3000;

startSlaEscalationWorker();
ensureSeedAdmin().catch((e) => console.error("Seed admin failed", e));
ensureDefaultQueueAndSla().catch((e) => console.error("Seed default queue/SLA failed", e));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
