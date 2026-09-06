const { createMockPrisma } = require("../../../tests/mockPrisma");

const mockPrisma = createMockPrisma();
jest.mock("../../database/prisma", () => ({ prisma: mockPrisma }));

const usersService = require("../users.service");

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.$transaction.mockImplementation((ops) => Promise.all(ops));
});

describe("setSkills", () => {
  test("deduplicates skill names before writing them", async () => {
    mockPrisma.skill.deleteMany.mockResolvedValue({});
    mockPrisma.skill.createMany.mockResolvedValue({});
    const stored = [{ id: "s1", name: "Node.js" }, { id: "s2", name: "Postgres" }];
    mockPrisma.skill.findMany.mockResolvedValue(stored);

    const result = await usersService.setSkills("u1", ["Node.js", "Postgres", "Node.js"]);

    expect(mockPrisma.skill.createMany).toHaveBeenCalledWith({
      data: [{ userId: "u1", name: "Node.js" }, { userId: "u1", name: "Postgres" }],
    });
    expect(result).toEqual(stored);
  });
});

describe("experience ownership", () => {
  test("updateExperience throws 404 when the experience doesn't exist", async () => {
    mockPrisma.experience.findUnique.mockResolvedValue(null);

    await expect(
      usersService.updateExperience("u1", "missing", { title: "New" }),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(mockPrisma.experience.update).not.toHaveBeenCalled();
  });

  test("updateExperience throws 404 when the experience belongs to someone else", async () => {
    mockPrisma.experience.findUnique.mockResolvedValue({ id: "e1", userId: "someone-else" });

    await expect(
      usersService.updateExperience("u1", "e1", { title: "New" }),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(mockPrisma.experience.update).not.toHaveBeenCalled();
  });

  test("updateExperience succeeds when the caller owns the experience", async () => {
    mockPrisma.experience.findUnique.mockResolvedValue({ id: "e1", userId: "u1" });
    mockPrisma.experience.update.mockResolvedValue({ id: "e1", title: "New" });

    const result = await usersService.updateExperience("u1", "e1", { title: "New" });

    expect(mockPrisma.experience.update).toHaveBeenCalledWith({
      where: { id: "e1" },
      data: { title: "New" },
    });
    expect(result).toEqual({ id: "e1", title: "New" });
  });

  test("deleteExperience throws 404 for someone else's experience instead of deleting it", async () => {
    mockPrisma.experience.findUnique.mockResolvedValue({ id: "e1", userId: "someone-else" });

    await expect(usersService.deleteExperience("u1", "e1")).rejects.toMatchObject({ statusCode: 404 });

    expect(mockPrisma.experience.delete).not.toHaveBeenCalled();
  });
});
