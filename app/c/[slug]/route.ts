import { NextRequest, NextResponse } from 'next/server';
import { getCardBySlug, logClick } from '@/lib/db';
import { isSocialCrawler, detectDevice } from '@/lib/bot-detector';

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return new NextResponse('Invalid Slug', { status: 400 });
    }

    const card = getCardBySlug(slug);

    if (!card) {
      const notFoundHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Không tìm thấy Link | PicLink Ads</title>
  <style>
    body { background-color: #0a0d14; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: rgba(18, 24, 38, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 16px; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #f43f5e; font-size: 2rem; margin-bottom: 12px; }
    p { color: #94a3b8; font-size: 0.95rem; margin-bottom: 24px; }
    a { background: #6366f1; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; display: inline-block; }
  </style>
</head>
<body>
  <div class="card">
    <h1>404 Not Found</h1>
    <p>Liên kết quảng cáo này không tồn tại hoặc đã bị gỡ bỏ.</p>
    <a href="/">Về Trang Chủ PicLink Ads</a>
  </div>
</body>
</html>`;
      return new NextResponse(notFoundHtml, {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'http';

    const fullCardUrl = `${proto}://${host}/c/${card.slug}`;
    const fullImageUrl = card.image_url
      ? card.image_url.startsWith('http')
        ? card.image_url
        : `${proto}://${host}${card.image_url}`
      : `${proto}://${host}/favicon.ico`;

    const isHideText = Boolean(card.hide_text);
    const title = isHideText ? '&#8203;' : escapeHtml(card.title || 'PicLink Ads');
    const description = isHideText ? '' : escapeHtml(card.description || '');

    if (isSocialCrawler(userAgent)) {
      const botHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">

  <!-- Open Graph / Facebook / Zalo -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${fullImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${fullCardUrl}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${fullImageUrl}">
</head>
<body>
  <p>Đang chuyển hướng tới <a href="${card.target_url}">${card.target_url}</a>...</p>
</body>
</html>`;

      return new NextResponse(botHtml, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    // Human Visitor: Log click & Return Interstitial Redirect Page with Adsterra Direct Link & Popunder
    const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || null;
    const device = detectDevice(userAgent);

    try {
      logClick({
        card_id: card.id,
        user_agent: userAgent,
        ip_address: rawIp,
        device_type: device,
        referrer,
      });
    } catch (e) {
      console.error('Failed to log click:', e);
    }

    const directLinkUrl = 'https://www.effectivecpmnetwork.com/jczniw4qk?key=9083731f51eaa7f78478fe19b3f395f3';
    const escapedTarget = card.target_url.replace(/"/g, '%22');

    const redirectHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đang chuyển hướng...</title>
  <script src="https://pl30830126.effectivecpmnetwork.com/16/b8/35/16b8351a1bbdde1b816aa6cfd5d788a4.js" async></script>
  <script src="https://pl30830129.effectivecpmnetwork.com/80/2c/31/802c318ff1927b4621d18fff520f770c.js" async></script>
  <style>
    body { background-color: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .loader { border: 3px solid #1e293b; border-top: 3px solid #10b981; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    h2 { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin: 0 0 8px; }
    p { font-size: 0.85rem; color: #94a3b8; margin: 0; }
  </style>
</head>
<body>
  <div class="loader"></div>
  <h2>Đang chuyển hướng tới liên kết đích...</h2>
  <p>Nếu trang không tự mở, <a href="${card.target_url}" id="target-link" style="color: #10b981;">bấm vào đây</a>.</p>

  <script>
    (function() {
      var targetUrl = "${escapedTarget}";
      var directAdUrl = "${directLinkUrl}";
      
      try {
        var win = window.open(directAdUrl, '_blank');
        if (win) { win.blur(); window.focus(); }
      } catch(e) {}

      setTimeout(function() {
        window.location.replace(targetUrl);
      }, 500);
    })();
  </script>
</body>
</html>`;

    return new NextResponse(redirectHtml, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error in dynamic redirect route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
