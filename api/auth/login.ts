import { createHandler, AppError } from '../_lib/handler.js';
import { queryOne } from '../_lib/db.js';
import { comparePassword } from '../_lib/password.js';
import { signToken } from '../_lib/jwt.js';
import { loginSchema } from '../_lib/validators/auth.validator.js';

interface UserRow { id: number; name: string; email: string; password_hash: string }

export default createHandler({
  POST: async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await queryOne<UserRow>('SELECT * FROM users WHERE email = ?', [data.email]);
    if (!user) throw new AppError('E-mail ou senha incorretos.', 401);

    const valid = await comparePassword(data.password, user.password_hash);
    if (!valid) throw new AppError('E-mail ou senha incorretos.', 401);

    const token = signToken({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  },
}, { auth: false });
