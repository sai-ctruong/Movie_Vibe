import natural from 'natural';

const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();

export interface SentimentResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
}

export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    return { score: 0, label: 'neutral' };
  }

  const tokens = tokenizer.tokenize(text.toLowerCase());
  if (!tokens || tokens.length === 0) {
    return { score: 0, label: 'neutral' };
  }
  const score = analyzer.getSentiment(tokens);

  // Normalize score to -1 to 1 range
  const normalizedScore = Math.max(-1, Math.min(1, score / 5));

  let label: 'positive' | 'negative' | 'neutral';
  if (normalizedScore > 0.1) {
    label = 'positive';
  } else if (normalizedScore < -0.1) {
    label = 'negative';
  } else {
    label = 'neutral';
  }

  return {
    score: normalizedScore,
    label,
  };
}

export function moderateContent(text: string): { flagged: boolean; reason?: string } {
  const lowerText = text.toLowerCase();
  
  // Simple profanity filter
  const profanityList = ['spam', 'scam', 'fake', 'hate'];
  const hasProfanity = profanityList.some(word => lowerText.includes(word));
  
  if (hasProfanity) {
    return { flagged: true, reason: 'Contains inappropriate content' };
  }

  // Check for excessive caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.7 && text.length > 20) {
    return { flagged: true, reason: 'Excessive use of capital letters' };
  }

  return { flagged: false };
}
