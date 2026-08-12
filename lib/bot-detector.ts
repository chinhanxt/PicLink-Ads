const SOCIAL_CRAWLERS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'telegrambot',
  'whatsapp',
  'zalobot',
  'zalo',
  'pinterest',
  'skypeuripreview',
  'slackbot',
  'discordbot',
  'googlebot',
  'bingbot',
];

export function isSocialCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const lower = userAgent.toLowerCase();
  return SOCIAL_CRAWLERS.some((bot) => lower.includes(bot));
}

export function detectDevice(userAgent: string | null): string {
  if (!userAgent) return 'Desktop/Other';
  const lower = userAgent.toLowerCase();

  if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('ipod')) {
    return 'iOS';
  }
  if (lower.includes('android')) {
    return 'Android';
  }
  if (lower.includes('macintosh') || lower.includes('mac os x')) {
    return 'macOS';
  }
  if (lower.includes('windows') || lower.includes('win32') || lower.includes('win64')) {
    return 'Windows';
  }
  return 'Desktop/Other';
}
