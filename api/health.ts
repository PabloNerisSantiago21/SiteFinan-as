import { createHandler } from './_lib/handler.js';

export default createHandler({
  GET: async (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  },
}, { auth: false });
