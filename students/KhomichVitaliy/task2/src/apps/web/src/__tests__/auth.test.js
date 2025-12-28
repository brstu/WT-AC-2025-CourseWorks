import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authAPI } from '../../../src/api/auth';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../src/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { prisma } from '../../../src/prisma';

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token123');

      const result = await authAPI.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('id', '123');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should fail with invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authAPI.login({
          email: 'wrong@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow();
    });
  });
});