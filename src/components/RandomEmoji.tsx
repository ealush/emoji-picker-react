import { useState, useRef, useEffect } from "react";

export default function RandomEmoji() {
  const [currentEmoji, setCurrentEmoji] = useState(getRandomEmoji());

  useEffect(() => {
    setTimeout(() => {
      setCurrentEmoji(getRandomEmoji());
    }, 150) as unknown as number;
  }, [currentEmoji]);

  return <div suppressHydrationWarning>{currentEmoji}</div>;
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
