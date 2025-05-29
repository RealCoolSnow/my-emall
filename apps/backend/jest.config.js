/**
 * Jest 测试配置
 * 配置 TypeScript 支持和测试环境
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // 转换配置
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // 测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|js)',
    '**/*.(test|spec).(ts|js)',
  ],

  // 忽略的文件和目录
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],

  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/index.ts',
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 覆盖率报告格式
  coverageReporters: ['text', 'lcov', 'html'],

  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // 模块路径映射
  moduleNameMapping: {
    '^shared/(.*)$': '<rootDir>/../../packages/shared/src/$1',
    '^coupons/(.*)$': '<rootDir>/../../packages/coupons/src/$1',
  },

  // 测试超时时间
  testTimeout: 30000,

  // 详细输出
  verbose: true,

  // 强制退出
  forceExit: true,

  // 检测打开的句柄
  detectOpenHandles: true,
};
