/**
 * Add a speech-recognition chunk without duplicating a final result.
 *
 * Chromium can resend a final result after an interim result, and Electron
 * can repeat the last chunk when a continuous recognition session restarts.
 */
export function appendVoiceTranscript(currentValue: string, incomingValue: string): string {
  const current = normalize(currentValue);
  const incoming = normalize(incomingValue);

  if (!incoming) return current;
  if (!current) return incoming;
  if (current === incoming) return current;

  const currentWords = current.split(' ');
  const incomingWords = incoming.split(' ');

  // The restarted recognizer sometimes returns the whole previous sentence.
  if (current.endsWith(` ${incoming}`) || current.endsWith(incoming)) {
    return current;
  }

  // Keep the largest suffix/prefix overlap and append only the new words.
  const maxOverlap = Math.min(currentWords.length, incomingWords.length);
  for (let size = maxOverlap; size >= 1; size -= 1) {
    const currentSuffix = currentWords.slice(-size).join(' ');
    const incomingPrefix = incomingWords.slice(0, size).join(' ');
    if (currentSuffix === incomingPrefix) {
      const remainder = incomingWords.slice(size).join(' ');
      return remainder ? `${current} ${remainder}` : current;
    }
  }

  return `${current} ${incoming}`;
}

function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}