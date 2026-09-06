const { createMockPrisma } = require("../../../tests/mockPrisma");

const mockPrisma = createMockPrisma();
jest.mock("../../database/prisma", () => ({ prisma: mockPrisma }));

const postsService = require("../posts.service");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getPostById", () => {
  test("throws 404 when the post doesn't exist", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null);

    await expect(postsService.getPostById("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  test("attaches the computed score to the returned post", async () => {
    mockPrisma.post.findUnique.mockResolvedValue({
      id: "p1",
      likeCount: 5,
      dislikeCount: 1,
      commentCount: 2,
    });

    const post = await postsService.getPostById("p1");

    expect(post.score).toBe((5 - 1) + 2 * 2);
  });
});

describe("listPosts", () => {
  const post = (overrides) => ({
    id: "id",
    likeCount: 0,
    dislikeCount: 0,
    commentCount: 0,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    ...overrides,
  });

  test("orders by score descending", async () => {
    mockPrisma.post.findMany.mockResolvedValue([
      post({ id: "low", likeCount: 1 }),
      post({ id: "high", likeCount: 10 }),
      post({ id: "mid", likeCount: 5 }),
    ]);

    const { posts } = await postsService.listPosts({ page: 1, limit: 10 });

    expect(posts.map((p) => p.id)).toEqual(["high", "mid", "low"]);
  });

  test("breaks ties by newest createdAt first", async () => {
    mockPrisma.post.findMany.mockResolvedValue([
      post({ id: "older", likeCount: 3, createdAt: new Date("2024-01-01T00:00:00Z") }),
      post({ id: "newer", likeCount: 3, createdAt: new Date("2024-06-01T00:00:00Z") }),
    ]);

    const { posts } = await postsService.listPosts({ page: 1, limit: 10 });

    expect(posts.map((p) => p.id)).toEqual(["newer", "older"]);
  });

  test("paginates the ranked list and reports total", async () => {
    mockPrisma.post.findMany.mockResolvedValue([
      post({ id: "a", likeCount: 3 }),
      post({ id: "b", likeCount: 2 }),
      post({ id: "c", likeCount: 1 }),
    ]);

    const result = await postsService.listPosts({ page: 2, limit: 1 });

    expect(result.posts.map((p) => p.id)).toEqual(["b"]);
    expect(result.pagination).toEqual({ page: 2, limit: 1, total: 3 });
  });
});
