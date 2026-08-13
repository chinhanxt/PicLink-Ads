'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  triggerDirectLinkAd,
  AdsterraLeaderboardBanner,
  Adsterra468x60Banner,
  Adsterra300x250Banner,
  AdsterraNativeBanner,
} from '@/components/AdComponents';

interface CreateCardResponse {
  success: boolean;
  slug?: string;
  cardUrl?: string;
  fullCardUrl?: string;
  error?: string;
}

// SVG Icons
const IconTag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l11 11 10-10L12 2z" />
    <circle cx="7" cy="7" r="2" />
  </svg>
);

const IconImage = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IconUploadCloud = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSparkles = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
  </svg>
);

const IconSpinner = () => (
  <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconGlobe = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconZap = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconSuccessBadge = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconPlaceholderImg = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function HomePage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [ctaType] = useState<string>('none');
  const [hideText, setHideText] = useState<boolean>(false);
  const [customSlug, setCustomSlug] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successResult, setSuccessResult] = useState<CreateCardResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setErrorMsg('');

    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);

    await uploadAndProcessImage(file);
  };

  const uploadAndProcessImage = async (fileObj?: File) => {
    const fileToUpload = fileObj || selectedFile;
    if (!fileToUpload) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('ctaType', ctaType);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setImageUrl(data.imageUrl);
        setPreviewImage(`${data.imageUrl}?t=${Date.now()}`);
      } else {
        setErrorMsg(data.error || 'Lỗi xử lý ảnh');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Tải ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessResult(null);

    if (!targetUrl) {
      setErrorMsg('Vui lòng nhập link đích (Target URL)');
      return;
    }

    let formattedTargetUrl = targetUrl.trim();
    if (formattedTargetUrl && !/^https?:\/\//i.test(formattedTargetUrl)) {
      formattedTargetUrl = `https://${formattedTargetUrl}`;
    }

    setLoading(true);
    triggerDirectLinkAd();

    try {
      const res = await fetch('/api/create-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: formattedTargetUrl,
          title: hideText ? '' : (title || 'PicLink Ads'),
          description: hideText ? '' : description,
          imageUrl: imageUrl || previewImage || '/uploads/placeholder.jpg',
          ctaType,
          customSlug,
          hideText,
        }),
      });

      const data: CreateCardResponse = await res.json();
      if (data.success) {
        data.fullCardUrl = `${window.location.origin}/c/${data.slug}`;
        setSuccessResult(data);
      } else {
        setErrorMsg(data.error || 'Tạo card thất bại');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Có lỗi xảy ra khi tạo link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerDirectLinkAd();
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    triggerDirectLinkAd();
    setTargetUrl('');
    setTitle('');
    setDescription('');
    setImageUrl('');
    setSelectedFile(null);
    setPreviewImage('');
    setHideText(false);
    setCustomSlug('');
    setErrorMsg('');
    setSuccessResult(null);
    setCopied(false);
  };

  const getDisplayDomain = (urlStr: string) => {
    if (!urlStr) return 'SHOPEE.VN';
    try {
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return parsed.hostname.replace(/^www\./, '').toUpperCase();
    } catch {
      return 'PICLINK.VN';
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header className="app-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">P</span>
            <span className="brand-name">PicLink Ads</span>
          </Link>
        </div>
      </header>

      <main className="studio-viewport">
        {/* Top Leaderboard Banner */}
        <AdsterraLeaderboardBanner />

        <div className="studio-split-layout">
          {/* Left Form Side Panel */}
          <div className="compact-form-card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Top Bar: Studio Title & Mode Toggle */}
              <div className="studio-top-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                    Tạo Thẻ Quảng Cáo
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: 'var(--blue-primary)',
                      background: 'var(--blue-light)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      border: '1px solid var(--blue-border)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Studio
                  </span>
                </div>

                <div className="mode-toggle-group">
                  <button
                    type="button"
                    className={`mode-toggle-btn ${!hideText ? 'active' : ''}`}
                    onClick={() => setHideText(false)}
                  >
                    <IconTag />
                    <span>Card đầy đủ</span>
                  </button>
                  <button
                    type="button"
                    className={`mode-toggle-btn ${hideText ? 'active' : ''}`}
                    onClick={() => setHideText(true)}
                  >
                    <IconImage />
                    <span>Ảnh sạch</span>
                  </button>
                </div>
              </div>

              {/* Form Input Body */}
              <div className="compact-form-body">
                {/* Row 1: Target URL & Custom Slug */}
                <div className="compact-row-2col">
                  <div className="compact-field-group">
                    <label className="compact-label">
                      <span>Link đích <span style={{ color: '#ef4444' }}>*</span></span>
                    </label>
                    <input
                      type="text"
                      className="compact-input"
                      placeholder="shopee.vn hoặc https://shopee.vn/product/..."
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="compact-field-group">
                    <label className="compact-label">
                      <span>Link ngắn (/c/...)</span>
                    </label>
                    <input
                      type="text"
                      className="compact-input"
                      placeholder="khuyen-mai-shopee"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 2: Premium Upload Image Box */}
                <div className="compact-field-group">
                  <label className="compact-label">
                    <span>Ảnh bìa (Tỷ lệ 1.91:1 / 1200×630px)</span>
                  </label>

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="file-upload-input"
                    />
                    <label htmlFor="file-upload-input" className={`compact-dropzone ${selectedFile ? 'has-file' : ''}`}>
                      <div className="compact-dropzone-ico-box">
                        {selectedFile ? <IconCheck /> : <IconUploadCloud />}
                      </div>
                      <div className="compact-dropzone-txt">
                        <span className="compact-dropzone-title">
                          {selectedFile ? selectedFile.name : 'Bấm hoặc kéo thả ảnh bìa từ máy'}
                        </span>
                        <span className="compact-dropzone-sub">
                          {selectedFile ? 'Đã chọn ảnh bìa thành công' : 'Định dạng JPG, PNG, WEBP — Chuẩn 1200×630px'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Row 3: Title & Description */}
                <div className="compact-field-group" style={{ opacity: hideText ? 0.45 : 1 }}>
                  <div className="compact-label">
                    <span>Tiêu đề bài viết</span>
                    <span style={{ fontSize: '11px', color: title.length > 90 ? '#ef4444' : 'var(--text-muted)' }}>
                      {title.length}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    className="compact-input"
                    maxLength={100}
                    disabled={hideText}
                    placeholder="Săn Sale Giảm 50% Ngay Hôm Nay..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="compact-field-group" style={{ opacity: hideText ? 0.45 : 1 }}>
                  <div className="compact-label">
                    <span>Mô tả ngắn</span>
                    <span style={{ fontSize: '11px', color: description.length > 180 ? '#ef4444' : 'var(--text-muted)' }}>
                      {description.length}/200
                    </span>
                  </div>
                  <textarea
                    className="compact-textarea"
                    rows={2}
                    maxLength={200}
                    disabled={hideText}
                    placeholder="Ưu đãi giới hạn cho 100 khách hàng đầu tiên..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Banner 468x60 above submit button */}
              <Adsterra468x60Banner />

              {/* Bottom Actions */}
              <div className="compact-form-bottom">
                <button
                  type="submit"
                  className="compact-submit-btn"
                  disabled={loading || uploading}
                >
                  {loading || uploading ? (
                    <>
                      <IconSpinner />
                      <span>Đang khởi tạo link...</span>
                    </>
                  ) : (
                    <>
                      <IconSparkles />
                      <span>Tạo Link Chạy Ads Ngay</span>
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="alert-error" style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconAlert />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>
          </div>

          {/* Right Live Preview Side Panel */}
          <div className="preview-side-card">
            <div className="preview-glow-bg" />

            <div className="preview-badge-header">
              <span className="preview-badge-pulse" />
              <span>Facebook Live Preview</span>
            </div>

            {/* Facebook Post Simulator Card */}
            <div className="fb-post-simulator">
              <div className="fb-post-header">
                <div className="fb-avatar">P</div>
                <div className="fb-user-info">
                  <span className="fb-user-name">PicLink Ad Campaign</span>
                  <span className="fb-post-time">
                    <span>Vừa xong</span>
                    <span style={{ margin: '0 2px' }}>·</span>
                    <IconGlobe />
                  </span>
                </div>
              </div>

              {/* Facebook Image Box */}
              <div className="fb-card-image-wrap">
                {previewImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={previewImage} alt="Card Preview" className="fb-card-img" />
                ) : (
                  <div className="fb-card-img-placeholder">
                    <IconPlaceholderImg />
                    <span>Tải ảnh bìa để xem trước thẻ</span>
                  </div>
                )}
              </div>

              {/* Facebook Card Text Body */}
              <div className="fb-card-body">
                <div className="fb-card-domain">{getDisplayDomain(targetUrl)}</div>
                {hideText ? (
                  <div className="fb-card-clean-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconZap />
                    <span>Chế độ Ảnh sạch — Tiêu đề & Mô tả tự động ẩn trên Facebook</span>
                  </div>
                ) : (
                  <>
                    <div className="fb-card-title">
                      {title || 'Tiêu đề thẻ sẽ hiển thị tại đây khi khách lướt thấy bài đăng'}
                    </div>
                    <div className="fb-card-desc">
                      {description || 'Mô tả chi tiết thu hút lượt click về trang bán hàng.'}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Ad Banner 300x250 below Preview */}
            <Adsterra300x250Banner />
          </div>
        </div>

        {/* Modal Output Result */}
        {successResult && (
          <div className="overlay">
            <div className="modal modal-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '12px' }}>
                <IconSuccessBadge />
              </div>
              <h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '6px' }}>
                Link đã sẵn sàng!
              </h2>
              <p className="modal-sub" style={{ textAlign: 'center', marginBottom: '16px' }}>
                Dán link này lên bài đăng Facebook — FB tự hiện tấm ảnh bìa,
                khách bấm vào ảnh sẽ được chuyển thẳng về link đích.
              </p>

              {/* Native Banner inside Modal */}
              <AdsterraNativeBanner />

              <div className="link-box" style={{ marginBottom: '16px', width: '100%' }}>
                <span className="link">{successResult.fullCardUrl}</span>
                <button onClick={() => copyToClipboard(successResult.fullCardUrl || '')} className="btn btn-primary btn-sm">
                  {copied ? 'Đã copy' : 'Copy link'}
                </button>
              </div>

              <div className="modal-footer" style={{ width: '100%', display: 'flex', gap: '10px' }}>
                <a
                  href={successResult.fullCardUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerDirectLinkAd()}
                  className="btn btn-soft"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Mở thử link
                </a>
                <button onClick={resetForm} className="btn btn-ghost" style={{ flex: 1 }}>
                  Tạo tiếp
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}