/**
 * Daily wisdom - short Stoic (and adjacent) lines for the morning check-in.
 * Warm, never preachy. Indexed by day-of-year so everyone sees the same quote
 * on a given calendar day.
 */

export interface DailyQuote {
  text: string;
  author: string;
}

const QUOTES: DailyQuote[] = [
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
  { text: "He who is brave is free.", author: "Seneca" },
  { text: "Associate with people who are likely to improve you.", author: "Seneca" },
  { text: "If a man knows not which port he sails, no wind is favorable.", author: "Seneca" },
  { text: "The greatest remedy for anger is delay.", author: "Seneca" },
  { text: "As long as you live, keep learning how to live.", author: "Seneca" },
  { text: "It is a rough road that leads to the heights of greatness.", author: "Seneca" },
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "When you arise in the morning, think of what a privilege it is to be alive.", author: "Marcus Aurelius" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "Very little is needed to make a happy life; it is all within yourself.", author: "Marcus Aurelius" },
  { text: "It is not death that a man should fear, but he should fear never beginning to live.", author: "Marcus Aurelius" },
  { text: "How much more grievous are the consequences of anger than the causes of it.", author: "Marcus Aurelius" },
  { text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.", author: "Marcus Aurelius" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "It is not what happens to you, but how you react to it that matters.", author: "Epictetus" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "Do not explain your philosophy. Embody it.", author: "Epictetus" },
  { text: "Progress is not achieved by luck or accident, but by working on yourself daily.", author: "Epictetus" },
  { text: "If you want to improve, be content to be thought foolish and stupid.", author: "Epictetus" },
  { text: "No great thing is created suddenly.", author: "Epictetus" },
  { text: "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.", author: "Epictetus" },
  { text: "Know thyself.", author: "The Delphic Maxim" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant (on Aristotle)" },
  { text: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.", author: "Dan Millman" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Be kind, for everyone you meet is fighting a hard battle.", author: "Attributed to Plato" },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
];

/** Day-of-year quote (1-366). Stable for a given calendar day. */
export function getDailyQuote(date: Date = new Date()): DailyQuote {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return QUOTES[((dayOfYear % QUOTES.length) + QUOTES.length) % QUOTES.length];
}
