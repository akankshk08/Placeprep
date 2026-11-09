// Only allow normal web links. Links from AI answers could otherwise be
// "javascript:" URLs that run code when clicked.
export function safeUrl(url) {
  if (typeof url !== 'string') return undefined;
  try {
    const u = new URL(url.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : undefined;
  } catch {
    return undefined;
  }
}
