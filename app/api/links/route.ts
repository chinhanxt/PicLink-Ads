import { NextRequest, NextResponse } from 'next/server';
import { getAllCardsWithClicks, updateCardTarget, deleteCard } from '@/lib/db';

export async function GET() {
  try {
    const cards = getAllCardsWithClicks();
    return NextResponse.json({ success: true, cards });
  } catch (error: any) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, targetUrl } = body;

    if (!id || !targetUrl) {
      return NextResponse.json({ success: false, error: 'Card ID and targetUrl are required' }, { status: 400 });
    }

    const updated = updateCardTarget(Number(id), targetUrl);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Card not found or update failed' }, { status: 444 });
    }

    return NextResponse.json({ success: true, message: 'Card target URL updated successfully' });
  } catch (error: any) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update card' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Card ID is required' }, { status: 400 });
    }

    const deleted = deleteCard(Number(id));
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Card not found or deletion failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Card deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete card' },
      { status: 500 }
    );
  }
}
