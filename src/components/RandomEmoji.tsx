export default function RandomEmoji() {
  return <div>{getRandomEmoji()}</div>;
}

function getRandomEmoji() {
  return funEmojis[Math.floor(Math.random() * funEmojis.length)];
}

const funEmojis = [
  "😄",
  "😃",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🥰",
  "😍",
  "🤩",
  "😎",
  "🥳",
  "🤗",
  "🤔",
  "🌟",
  "✨",
  "🌈",
  "🌸",
  "🌺",
  "🎉",
  "🎊",
  "🎈",
  "🎶",
  "🎁",
  "🍀",
  "🌞",
  "🐾",
  "🚀",
];
