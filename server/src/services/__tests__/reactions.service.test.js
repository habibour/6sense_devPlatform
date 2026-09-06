const { createMockPrisma } = require("../../../tests/mockPrisma");

const mockPrisma = createMockPrisma();
jest.mock("../../database/prisma", () => ({ prisma: mockPrisma }));

const reactionsService = require("../reactions.service");

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.$transaction.mockImplementation((ops) => Promise.all(ops));
});

describe("upsertReaction", () => {
  test("throws 404 when the target post doesn't exist", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null);

    await expect(
      reactionsService.upsertReaction("u1", { targetType: "POST", targetId: "p1", type: "LIKE" }),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  test("creates a reaction and increments likeCount when none exists yet", async () => {
    mockPrisma.post.findUnique.mockResolvedValue({ id: "p1" });
    mockPrisma.reaction.findUnique.mockResolvedValue(null);
    const created = { id: "r1", userId: "u1", targetType: "POST", targetId: "p1", type: "LIKE" };
    mockPrisma.reaction.create.mockResolvedValue(created);
    mockPrisma.post.update.mockResolvedValue({ id: "p1", likeCount: 1 });

    const result = await reactionsService.upsertReaction("u1", {
      targetType: "POST",
      targetId: "p1",
      type: "LIKE",
    });

    expect(result).toEqual(created);
    expect(mockPrisma.reaction.create).toHaveBeenCalledWith({
      data: { userId: "u1", targetType: "POST", targetId: "p1", type: "LIKE" },
    });
    expect(mockPrisma.post.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { likeCount: { increment: 1 } },
    });
  });

  test("is a no-op when the same reaction already exists", async () => {
    mockPrisma.post.findUnique.mockResolvedValue({ id: "p1" });
    const existing = { id: "r1", userId: "u1", targetType: "POST", targetId: "p1", type: "LIKE" };
    mockPrisma.reaction.findUnique.mockResolvedValue(existing);

    const result = await reactionsService.upsertReaction("u1", {
      targetType: "POST",
      targetId: "p1",
      type: "LIKE",
    });

    expect(result).toEqual(existing);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.reaction.create).not.toHaveBeenCalled();
    expect(mockPrisma.reaction.update).not.toHaveBeenCalled();
  });

  test("switches type and moves the counter from dislikeCount to likeCount", async () => {
    mockPrisma.post.findUnique.mockResolvedValue({ id: "p1" });
    const existing = { id: "r1", userId: "u1", targetType: "POST", targetId: "p1", type: "DISLIKE" };
    mockPrisma.reaction.findUnique.mockResolvedValue(existing);
    const updated = { ...existing, type: "LIKE" };
    mockPrisma.reaction.update.mockResolvedValue(updated);
    mockPrisma.post.update.mockResolvedValue({ id: "p1" });

    const result = await reactionsService.upsertReaction("u1", {
      targetType: "POST",
      targetId: "p1",
      type: "LIKE",
    });

    expect(result).toEqual(updated);
    expect(mockPrisma.reaction.update).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: { type: "LIKE" },
    });
    expect(mockPrisma.post.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { dislikeCount: { decrement: 1 }, likeCount: { increment: 1 } },
    });
  });
});

describe("removeReaction", () => {
  test("throws 404 when the target doesn't exist", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue(null);

    await expect(reactionsService.removeReaction("u1", "COMMENT", "c1")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test("throws 404 when there is no reaction to remove", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue({ id: "c1" });
    mockPrisma.reaction.findUnique.mockResolvedValue(null);

    await expect(reactionsService.removeReaction("u1", "COMMENT", "c1")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test("deletes the reaction and decrements the matching counter", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue({ id: "c1" });
    mockPrisma.reaction.findUnique.mockResolvedValue({ id: "r1", type: "DISLIKE" });
    mockPrisma.reaction.delete.mockResolvedValue({});
    mockPrisma.comment.update.mockResolvedValue({});

    await reactionsService.removeReaction("u1", "COMMENT", "c1");

    expect(mockPrisma.reaction.delete).toHaveBeenCalledWith({ where: { id: "r1" } });
    expect(mockPrisma.comment.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { dislikeCount: { decrement: 1 } },
    });
  });
});

describe("getMyReaction", () => {
  test("returns the reaction when one exists", async () => {
    const existing = { id: "r1", type: "LIKE" };
    mockPrisma.reaction.findUnique.mockResolvedValue(existing);

    const result = await reactionsService.getMyReaction("u1", "POST", "p1");

    expect(result).toEqual(existing);
  });

  test("returns null when there is no reaction", async () => {
    mockPrisma.reaction.findUnique.mockResolvedValue(null);

    const result = await reactionsService.getMyReaction("u1", "POST", "p1");

    expect(result).toBeNull();
  });
});
