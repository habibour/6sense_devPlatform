// Comments are weighted 2x likes because a comment signals deeper engagement than a
// single click, and this keeps a heavily-discussed post competitive with one that's
// merely well-liked (see README's "Ranking formula" section for the product rationale).
function computeScore(likeCount, dislikeCount, commentCount, weight = 2) {
  return (likeCount - dislikeCount) + commentCount * weight;
}

module.exports = { computeScore };
