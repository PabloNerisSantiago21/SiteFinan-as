import { createHandler, AppError } from '../_lib/handler.js';
import { queryOne, execute } from '../_lib/db.js';
import { hashPassword } from '../_lib/password.js';
import { signToken } from '../_lib/jwt.js';
import { registerSchema } from '../_lib/validators/auth.validator.js';

export default createHandler({
  POST: async (req, res) => {
    const data = registerSchema.parse(req.body);

    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existing) throw new AppError('Este e-mail já está cadastrado.', 409);

    const passwordHash = await hashPassword(data.password);
    const { lastInsertRowid } = await execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [data.name, data.email, passwordHash]
    );

    const token = signToken({ userId: lastInsertRowid, email: data.email });
    res.status(201).json({ token, user: { id: lastInsertRowid, name: data.name, email: data.email } });
  },
}, { auth: false });
