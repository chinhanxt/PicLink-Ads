import { NextRequest, NextResponse } from 'next/server';
import { getCardBySlug, getCardStats } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug parameter is required' }, { status: 400 });
    }

    const card = getCardBySlug(slug);
    if (!card) {
      return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
    }

    const stats = getCardStats(card.id);
    if (!stats) {
      return NextResponse.json({ success: false, error: 'Stats unavailable' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      card: stats.card,
      stats: {
        total_clicks: stats.total_clicks,
        unique_clicks: stats.unique_clicks,
        device_breakdown: stats.device_breakdown,
        referrer_breakdown: stats.referrer_breakdown,
        recent_clicks: stats.recent_clicks,
      },
    });
  } catch (error: any) {
    console.error('Error fetching card stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
