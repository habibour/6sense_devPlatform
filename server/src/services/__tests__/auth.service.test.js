const { createMockPrisma } = require("../../../tests/mockPrisma");

const mockPrisma = createMockPrisma();
jest.mock("../../database/prisma", () => ({ prisma: mockPrisma }));

const authService = require("../auth.service");
const { comparePassword } = require("../../utils/password");
const { verifyAccessToken } = require("../../utils/jwt");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("register", () => {
  test("throws 409 when the email is already registered", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

    await expect(
      authService.register({ name: "A", email: "a@example.com", password: "secret123" }),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  test("hashes the password before storing and never returns it", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    let storedHash;
    mockPrisma.user.create.mockImplementation(({ data }) => {
      storedHash = data.passwordHash;
      return Promise.resolve({ id: "u1", name: data.name, email: data.email, passwordHash: storedHash });
    });

    const result = await authService.register({ name: "A", email: "a@example.com", password: "secret123" });

    expect(storedHash).not.toBe("secret123");
    await expect(comparePassword("secret123", storedHash)).resolves.toBe(true);
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(typeof result.accessToken).toBe("string");
    expect(verifyAccessToken(result.accessToken).sub).toBe("u1");
  }, 10000);
});

describe("login", () => {
  test("throws 401 when no user has that email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({ email: "nobody@example.com", password: "whatever" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test("throws 401 when the password doesn't match", async () => {
    const { hashPassword } = require("../../utils/password");
    const passwordHash = await hashPassword("correct-password");
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", email: "a@example.com", passwordHash });

    await expect(
      authService.login({ email: "a@example.com", password: "wrong-password" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  }, 10000);

  test("returns the public user and a valid access token on success", async () => {
    const { hashPassword } = require("../../utils/password");
    const passwordHash = await hashPassword("correct-password");
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      name: "A",
      email: "a@example.com",
      passwordHash,
    });

    const result = await authService.login({ email: "a@example.com", password: "correct-password" });

    expect(result.user).not.toHaveProperty("passwordHash");
    expect(verifyAccessToken(result.accessToken).sub).toBe("u1");
  }, 10000);
});
