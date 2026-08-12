import { NextRequest, NextResponse } from 'next/server';
import { createCard, getCardBySlug } from '@/lib/db';

function generateRandomSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function sanitizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUrl, title, description, imageUrl, ctaType, customSlug, hideText } = body;

    if (!targetUrl) {
      return NextResponse.json({ success: false, error: 'Target URL is required' }, { status: 400 });
    }

    let slug = '';
    if (customSlug && typeof customSlug === 'string' && customSlug.trim() !== '') {
      slug = sanitizeSlug(customSlug);
      if (getCardBySlug(slug)) {
        return NextResponse.json({ success: false, error: 'Custom slug already exists' }, { status: 400 });
      }
    }

    if (!slug) {
      let attempts = 0;
      do {
        slug = generateRandomSlug(6);
        attempts++;
      } while (getCardBySlug(slug) && attempts < 10);
    }

    const card = createCard({
      slug,
      target_url: targetUrl,
      title: hideText ? ' ' : (title || null),
      description: hideText ? ' ' : (description || null),
      image_url: imageUrl || null,
      cta_type: ctaType || 'none',
      hide_text: hideText ? 1 : 0,
    });

    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const fullCardUrl = `${proto}://${host}/c/${card.slug}`;

    return NextResponse.json({
      success: true,
      slug: card.slug,
      cardUrl: `/c/${card.slug}`,
      fullCardUrl,
      card,
    });
  } catch (error: any) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create card' },
      { status: 500 }
    );
  }
}
