/**
 * 认证功能测试
 * 测试认证相关的工具函数和服务
 */

import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  verifyToken,
  isValidEmail,
  validatePassword
} from '../utils/auth';
import { db } from '../models/database';

describe('Authentication Utils', () => {
  beforeAll(async () => {
    // 清理测试数据库
    await db.cleanup();
  });

  afterAll(async () => {
    // 清理测试数据库
    await db.cleanup();
    await db.disconnect();
  });

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'Test123!@#';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should verify password correctly', async () => {
      const password = 'Test123!@#';
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token', () => {
    it('should generate and verify access token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'CUSTOMER',
      };

      const token = generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid-token';
      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeNull();
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Test123!@#',
        'MyP@ssw0rd',
        'Str0ng!Pass',
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        '123',           // too short
        'password',      // no uppercase, no numbers, no special chars
        'PASSWORD',      // no lowercase, no numbers, no special chars
        'Password',      // no numbers, no special chars
        'Password123',   // no special chars
      ];

      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });
});
