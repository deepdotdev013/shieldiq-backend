const { CAMPAIGN_EVENTS, SCORES } =
  require("../../configs/constants").constants;
const { User } = require("../models");

// computeScoreImpact computes the impact of user action on the campaign email.
const computeScoreImpact = async (eventType, isPhishing) => {
  // If user clicks on the phishing link, apply the phishing click penalty.
  if (eventType === CAMPAIGN_EVENTS.LinkClicked && isPhishing) {
    return SCORES.PHISHING_CLICK_PENALTY;
  }

  // If user reports the email, apply the appropriate reward or penalty.
  if (eventType === CAMPAIGN_EVENTS.Reported) {
    if (isPhishing) {
      return SCORES.PHISHING_REPORT_REWARD;
    }
    return SCORES.FALSE_POSITIVE_PENALTY;
  }
  return 0;
};

// applyScoreImpact applies the score impact to the user.
const applyScoreImpact = async (userId, score, transaction) => {
  // Find the user by ID.
  const user = await User.findOne({
    where: {
      id: userId,
      isDeleted: false,
    },
    attributes: ["securityScore"],
    transaction: transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!user) {
    return 0;
  }

  // Calculate the new score, ensuring it stays within the 0-100 range.
  const newScore = Math.max(0, Math.min(100, user.securityScore + score));

  // Update the user's securityScore
  await User.update(
    {
      securityScore: newScore,
    },
    {
      where: {
        id: user.id,
      },
      transaction: transaction,
      fields: ["securityScore"],
    },
  );

  return newScore;
};

module.exports = { computeScoreImpact, applyScoreImpact };
