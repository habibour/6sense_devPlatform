function computeScore(likeCount, dislikeCount, commentCount, weight = 2) {
  return (likeCount - dislikeCount) + commentCount * weight;
}

module.exports = { computeScore };
