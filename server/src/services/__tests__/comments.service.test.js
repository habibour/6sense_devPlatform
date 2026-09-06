const { createMockPrisma } = require("../../../tests/mockPrisma");

const mockPrisma = createMockPrisma();
jest.mock("../../database/prisma", () => ({ prisma: mockPrisma }));

const commentsService = require("../comments.service");

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.$transaction.mockImplementation((ops) => Promise.all(ops));
});

describe("createComment", () => {
  test("throws 404 when the post doesn't exist", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null);

    await expect(
      commentsService.createComment("p1", "u1", { body: "hi", parentCommentId: null }),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  test("throws 404 when the parent comment doesn't exist", async () => {
    mockPrisma.post.findUnique.mockResolvedValue({ id: "p1" });
    mockPrisma.comment.findUnique.mockResolvedValue(null);

    await expect(
      commentsService.createComment("p1", "u1", { body: "hi", parentCommentId: "missing" }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("throws 400 when the parent comment belongs to a different post", async () => {
    mockPrisma.post.findUnique.mockResolvedValue({ id: "p1" });
    mockPrisma.comment.findUnique.mockResolvedValue({ id: "c1", postId: "other-post" });

    await expect(
      commentsService.createComment("p1", "u1", { body: "hi", parentCommentId: "c1" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("creates a top-level comment and increments the post's commentCount", async () => {
    mockPrisma.post.findUnique.mockResolvedValue({ id: "p1" });
    const created = { id: "c1", postId: "p1", authorId: "u1", body: "hi", parentCommentId: null };
    mockPrisma.comment.create.mockResolvedValue(created);
    mockPrisma.post.update.mockResolvedValue({});

    const result = await commentsService.createComment("p1", "u1", { body: "hi", parentCommentId: null });

    expect(result).toEqual(created);
    expect(mockPrisma.comment.create).toHaveBeenCalledWith({
      data: { postId: "p1", authorId: "u1", body: "hi", parentCommentId: null },
    });
    expect(mockPrisma.post.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { commentCount: { increment: 1 } },
    });
  });

  test("creates a threaded reply when parentCommentId is valid", async () => {
    mockPrisma.post.findUnique.mockResolvedValue({ id: "p1" });
    mockPrisma.comment.findUnique.mockResolvedValue({ id: "c1", postId: "p1" });
    mockPrisma.comment.create.mockResolvedValue({ id: "c2", parentCommentId: "c1" });
    mockPrisma.post.update.mockResolvedValue({});

    const result = await commentsService.createComment("p1", "u1", { body: "reply", parentCommentId: "c1" });

    expect(result.parentCommentId).toBe("c1");
  });
});

describe("listComments", () => {
  test("throws 404 when the post doesn't exist", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null);

    await expect(commentsService.listComments("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  test("returns comments ordered oldest first", async () => {
    mockPrisma.post.findUnique.mockResolvedValue({ id: "p1" });
    const comments = [{ id: "c1" }, { id: "c2" }];
    mockPrisma.comment.findMany.mockResolvedValue(comments);

    const result = await commentsService.listComments("p1");

    expect(result).toEqual(comments);
    expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
      where: { postId: "p1" },
      orderBy: { createdAt: "asc" },
    });
  });
});
