import { Router } from 'express';
import ms, { type StringValue } from 'ms';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/password';
import { hashToken } from '../lib/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/tokens';
import { validateBody } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validation/authSchemas';
import { env, refreshCookieOptions } from '../config/env';
import { rateLimit } from '../middleware/rate-limit';

const router = Router();

function setRefreshCookie(res: any, token: string) {
  res.cookie('refreshToken', token, {
    ...refreshCookieOptions,
    maxAge: ms(env.JWT_REFRESH_TTL as StringValue),
  });
}

function clearRefreshCookie(res: any) {
  res.clearCookie('refreshToken', {
    ...refreshCookieOptions,
    maxAge: 0,
  });
}

async function revokeAllUserTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function issueTokens(user: { id: string; role: string }, req: any, res: any) {
  const accessToken = generateAccessToken(user.id, user.role);
  const { token: refreshToken, jti, expiresAt } = generateRefreshToken(user.id, user.role);
  const tokenHash = hashToken(jti);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
      createdByIp: req.ip,
      userAgent: req.get('user-agent') || undefined,
    },
  });

  setRefreshCookie(res, refreshToken);
  return accessToken;
}

router.post(
  '/register',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 3 }),
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
      if (existing) {
        return res
          .status(400)
          .json({
            status: 'error',
            error: {
              code: 'conflict',
              message: 'User with provided email or username already exists',
            },
          });
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: { username, email, passwordHash, role: 'user' },
      });

      const accessToken = await issueTokens(user, req, res);

      res.status(201).json({
        status: 'ok',
        data: {
          accessToken,
          user: { id: user.id, username: user.username, email: user.email, role: user.role },
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/login',
  rateLimit({ windowMs: 60 * 1000, max: 5 }),
  validateBody(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res
          .status(401)
          .json({
            status: 'error',
            error: { code: 'unauthorized', message: 'Invalid credentials' },
          });
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        return res
          .status(401)
          .json({
            status: 'error',
            error: { code: 'unauthorized', message: 'Invalid credentials' },
          });
      }

      const accessToken = await issueTokens(user, req, res);

      res.status(200).json({
        status: 'ok',
        data: {
          accessToken,
          user: { id: user.id, username: user.username, email: user.email, role: user.role },
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post('/refresh', async (req, res, next) => {
  try {
    const incoming = req.cookies?.refreshToken;
    if (!incoming) {
      return res
        .status(401)
        .json({
          status: 'error',
          error: { code: 'unauthorized', message: 'Missing refresh token' },
        });
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(incoming);
    } catch (error) {
      clearRefreshCookie(res);
      return res
        .status(401)
        .json({
          status: 'error',
          error: { code: 'unauthorized', message: 'Invalid refresh token' },
        });
    }

    const tokenHash = hashToken(decoded.jti);
    const session = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    const reuseDetected =
      !session ||
      !!session.revokedAt ||
      session.userId !== decoded.sub ||
      session.expiresAt < new Date();
    if (reuseDetected) {
      await revokeAllUserTokens(decoded.sub);
      clearRefreshCookie(res);
      return res
        .status(401)
        .json({
          status: 'error',
          error: { code: 'unauthorized', message: 'Refresh token revoked. Please login again.' },
        });
    }

    const accessToken = generateAccessToken(session.userId, session.user.role);
    const {
      token: newRefresh,
      jti: newJti,
      expiresAt,
    } = generateRefreshToken(session.userId, session.user.role);
    const newHash = hashToken(newJti);

    const newSession = await prisma.refreshToken.create({
      data: {
        userId: session.userId,
        tokenHash: newHash,
        expiresAt,
        createdByIp: req.ip,
        userAgent: req.get('user-agent') || undefined,
      },
    });

    await prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date(), replacedByTokenId: newSession.id },
    });

    setRefreshCookie(res, newRefresh);

    res.status(200).json({ status: 'ok', data: { accessToken } });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const incoming = req.cookies?.refreshToken;
    if (incoming) {
      try {
        const decoded = verifyRefreshToken(incoming);
        const tokenHash = hashToken(decoded.jti);
        await prisma.refreshToken.updateMany({
          where: { tokenHash, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      } catch (error) {
        // ignore invalid token on logout
      }
    }
    clearRefreshCookie(res);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
