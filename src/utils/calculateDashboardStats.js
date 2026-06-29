// calculateRate function will calculate the click rate and report rate
const calculateRate = (clicks, reports) => {
  clicks = Number(clicks || 0);
  reports = Number(reports || 0);

  const total = clicks + reports;

  return {
    clickRate: total ? Number(((clicks / total) * 100).toFixed(1)) : 0,
    reportRate: total ? Number(((reports / total) * 100).toFixed(1)) : 0,
  };
};

// calculateTrend function will calculate the trend
const calculateScoreTrend = (current, previous) => {
  current = Number(current || 0);
  previous = Number(previous || 0);

  if (previous === 0) {
    return {
      value: current > 0 ? 100 : 0,
      direction: current > 0 ? "up" : "neutral",
    };
  }

  const diff = current - previous;

  return {
    value: Number(Math.abs(diff).toFixed(1)),
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
  };
};

module.exports = {
  calculateRate,
  calculateScoreTrend,
};
