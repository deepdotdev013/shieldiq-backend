const crypto = require("crypto");

// generateRandomPassword is used to generate random password based on the input length.
function generateRandomPassword(length = 12) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const number = "0123456789";
  const special = "@#$%^&*";

  const allChars = upper + lower + number + special;

  const password = [
    upper[randomInt(upper.length)],
    lower[randomInt(lower.length)],
    number[randomInt(number.length)],
    special[randomInt(special.length)],
  ];

  // Fill remaining characters
  for (let i = password.length; i < length; i++) {
    password.push(allChars[randomInt(allChars.length)]);
  }

  // Shuffle to randomize positions
  return shuffle(password).join("");
}

// randomInt uses crypto package to generate random integer.
function randomInt(max) {
  return crypto.randomInt(0, max);
}

// shuffle uses crypto package to shuffle the array.
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = {
  generateRandomPassword,
};
