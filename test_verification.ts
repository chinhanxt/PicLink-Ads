import {
  getDb,
  createCard,
  getCardBySlug,
  logClick,
  getAllCards,
  updateCardTarget,
  deleteCard,
  getCardStats,
} from './lib/db';
import { isSocialCrawler, detectDevice } from './lib/bot-detector';

console.log('--- Testing SQLite DB ---');
const db = getDb();
console.log('Database instance initialized:', !!db);

const testSlug = `test-card-${Date.now()}`;
const card = createCard({
  slug: testSlug,
  target_url: 'https://example.com/target',
  title: 'Test Card Title',
  description: 'Test Card Description',
  image_url: '/uploads/test.jpg',
  cta_type: 'play_shop',
});
console.log('Created card:', card);

const fetchedCard = getCardBySlug(testSlug);
console.log('Fetched card by slug:', fetchedCard);

if (!fetchedCard) {
  throw new Error('Failed to fetch card by slug');
}

logClick({
  card_id: fetchedCard.id,
  user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
  ip_address: '127.0.0.1',
  device_type: detectDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'),
  referrer: 'https://facebook.com',
});

const allCards = getAllCards();
console.log('Total cards in db:', allCards.length);

const updated = updateCardTarget(fetchedCard.id, 'https://example.com/new-target');
console.log('Updated card target_url success:', updated);

const stats = getCardStats(fetchedCard.id);
console.log('Card stats:', stats);

const deleted = deleteCard(fetchedCard.id);
console.log('Deleted card success:', deleted);

console.log('\n--- Testing Bot Detector ---');
console.log('facebookexternalhit isSocialCrawler:', isSocialCrawler('facebookexternalhit/1.1'));
console.log('Twitterbot isSocialCrawler:', isSocialCrawler('Twitterbot/1.0'));
console.log('Googlebot isSocialCrawler:', isSocialCrawler('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'));
console.log('Standard Chrome isSocialCrawler:', isSocialCrawler('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'));

console.log('Device (iPhone):', detectDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)'));
console.log('Device (Android):', detectDevice('Mozilla/5.0 (Linux; Android 13; Pixel 7)'));
console.log('Device (Macintosh):', detectDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'));
console.log('Device (Windows):', detectDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'));
console.log('Device (Null):', detectDevice(null));

console.log('\nAll DB and Bot Detector tests completed successfully!');
