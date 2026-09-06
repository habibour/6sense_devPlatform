const { computeScore } = require("../ranking");

describe("computeScore", () => {
  test("applies the default weight of 2 to comment count", () => {
    expect(computeScore(5, 2, 3)).toBe((5 - 2) + 3 * 2);
  });

  test("honors a custom weight", () => {
    expect(computeScore(5, 2, 3, 1)).toBe((5 - 2) + 3 * 1);
  });

  test("can go negative when dislikes dominate with no comments", () => {
    expect(computeScore(0, 5, 0)).toBe(-5);
  });

  test("returns just the like/dislike delta when there are no comments", () => {
    expect(computeScore(2, 1, 0)).toBe(1);
  });
});
