// Real Prisma's $transaction([...]) takes an array of *prepared* (not yet awaited)
// queries and runs them atomically. Here, each mocked delegate call already resolves
// its own promise the moment it's invoked (no real DB round trip to batch), so
// $transaction only needs to fan those already-in-flight promises out via
// Promise.all — services under test can't tell the difference from the outside.
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
