function createMockPrisma() {
  return {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    post: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    comment: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    reaction: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    skill: { deleteMany: jest.fn(), createMany: jest.fn(), findMany: jest.fn() },
    experience: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  };
}

module.exports = { createMockPrisma };
