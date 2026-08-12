'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CreateCardResponse {
  success: boolean;
  slug?: string;
  cardUrl?: string;
  fullCardUrl?: string;
  error?: string;
}

export default function HomePage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [ctaType, setCtaType] = useState<string>('none');
  const [hideText, setHideText] = useState<boolean>(false);
  const [customSlug, setCustomSlug] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successResult, setSuccessResult] = useState<CreateCardResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const applyPreset = (presetType: 'shopee' | 'lazada' | 'tiktok' | 'zalo') => {
    switch (presetType) {
      case 'shopee':
        setTargetUrl('https://shopee.vn/product/12345/67890');
        if (!title) setTitle('🔥 SIÊU SALE SHOPEE - Áo Phông Nam Cao Cấp Giảm 50%');
        if (!description) setDescription('Mua ngay trên Shopee với giá ưu đãi cực sốc, miễn phí vận chuyển toàn quốc!');
        break;
      case 'lazada':
        setTargetUrl('https://lazada.vn/products/i123456.html');
        if (!title) setTitle('⚡ LAZADA SUPER BRAND DAY - Tai Nghe Bluetooth Unbox');
        if (!description) setDescription('Hàng chính hãng 100%, voucher giảm thêm 100k cho đơn từ 0Đ!');
        break;
      case 'tiktok':
        setTargetUrl('https://vt.tiktok.com/ZSN123456/');
        if (!title) setTitle('🎬 TIKTOK SHOP TRENDING - Combo Mỹ Phẩm Skincare Hot');
        if (!description) setDescription('Xem video review và săn ngay deal hời duy nhất hôm nay trên TikTok Shop!');
        break;
      case 'zalo':
        setTargetUrl('https://zalo.me/g/sample123');
        if (!title) setTitle('💬 NHÓM ZALO SẮN VOUCHER ĐỘC QUYỀN PICLINK');
        if (!description) setDescription('Tham gia nhóm Zalo để nhận thông báo deal giảm giá sâu và quà tặng!');
        break;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setErrorMsg('');

    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);

    await uploadAndProcessImage(file, ctaType);
  };

  const uploadAndProcessImage = async (fileObj?: File, cta?: string) => {
    const fileToUpload = fileObj || selectedFile;
    const currentCta = cta !== undefined ? cta : ctaType;

    if (imageSourceMode === 'upload' && fileToUpload) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('ctaType', currentCta);

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
    } else if (imageSourceMode === 'url' && imageUrl) {
      setPreviewImage(imageUrl);
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

    setLoading(true);

    try {
      let finalImageUrl = imageUrl;

      if (imageSourceMode === 'url' && imageUrl && ctaType !== 'none' && !imageUrl.startsWith('/uploads/')) {
        setUploading(true);
        const resUpload = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl, ctaType }),
        });
        const dataUpload = await resUpload.json();
        if (dataUpload.success) {
          finalImageUrl = dataUpload.imageUrl;
          setImageUrl(finalImageUrl);
        }
        setUploading(false);
      }

      const res = await fetch('/api/create-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          title: hideText ? '' : (title || 'PicLink Ads'),
          description: hideText ? '' : description,
          imageUrl: finalImageUrl || previewImage || '/uploads/placeholder.jpg',
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
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setTargetUrl('');
    setTitle('');
    setDescription('');
    setImageSourceMode('upload');
    setImageUrl('');
    setSelectedFile(null);
    setPreviewImage('');
    setCtaType('none');
    setHideText(false);
    setCustomSlug('');
    setErrorMsg('');
    setSuccessResult(null);
    setCopied(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">P</span>
            <span className="brand-name">PicLink Ads</span>
          </Link>
          <nav className="nav">
            <Link href="/" className="nav-link active">
              Tạo thẻ
            </Link>
            <Link href="/links" className="nav-link">
              Danh sách & Thống kê
            </Link>
          </nav>
        </div>
      </header>

      <main className="page page-form" style={{ flex: 1, width: '100%' }}>
        <div className="studio">
          <div className="card card-pad">
            <div className="card-header">
              <h2 className="section-title">Điền thông tin thẻ</h2>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <section className="fstep">
                <div className="fstep-head">
                  <span className="step-no" aria-hidden="true">01</span>
                  <div>
                    <div className="fstep-title">Link đích</div>
                    <div className="fstep-hint">Nơi người xem được chuyển đến khi bấm vào thẻ.</div>
                  </div>
                </div>

                <label className="field-label">
                  Link sản phẩm / chiến dịch <span className="req">*</span>
                </label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://shopee.vn/product/..."
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required
                />

                <div className="preset-row">
                  <span className="preset-label">Điền nhanh:</span>
                  <button type="button" className="preset-chip" onClick={() => applyPreset('shopee')}>
                    Shopee
                  </button>
                  <button type="button" className="preset-chip" onClick={() => applyPreset('lazada')}>
                    Lazada
                  </button>
                  <button type="button" className="preset-chip" onClick={() => applyPreset('tiktok')}>
                    TikTok Shop
                  </button>
                  <button type="button" className="preset-chip" onClick={() => applyPreset('zalo')}>
                    Zalo
                  </button>
                </div>
              </section>

              <section className="fstep">
                <div className="fstep-head">
                  <span className="step-no" aria-hidden="true">02</span>
                  <div>
                    <div className="fstep-title">Ảnh bìa</div>
                    <div className="fstep-hint">Ảnh duy nhất hiện trên thẻ — 1200×630.</div>
                  </div>
                </div>

                <label className="field-label">Nguồn ảnh</label>
                <div className="seg">
                  <button
                    type="button"
                    className={`seg-btn ${imageSourceMode === 'upload' ? 'active' : ''}`}
                    onClick={() => setImageSourceMode('upload')}
                  >
                    Tải ảnh lên
                  </button>
                  <button
                    type="button"
                    className={`seg-btn ${imageSourceMode === 'url' ? 'active' : ''}`}
                    onClick={() => setImageSourceMode('url')}
                  >
                    Dán URL ảnh
                  </button>
                </div>

                {imageSourceMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="file-upload-input"
                    />
                    <label htmlFor="file-upload-input" className="dropzone">
                      <span className="dropzone-icon">🖼️</span>
                      <span className="dropzone-text">
                        <span className="dropzone-title">{selectedFile ? selectedFile.name : 'Chọn ảnh bìa từ máy'}</span>
                        <span className="dropzone-hint">JPG, PNG, WEBP — tối ưu 1200×630px</span>
                      </span>
                    </label>
                  </div>
                ) : (
                  <input
                    type="url"
                    className="input"
                    placeholder="https://example.com/banner.jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setPreviewImage(e.target.value);
                    }}
                  />
                )}

                <label className="field-label" style={{ marginTop: '12px' }}>
                  Loại thẻ
                </label>
                <div className="card-radio-group" role="radiogroup" aria-label="Loại thẻ">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!hideText}
                    className={`card-radio ${!hideText ? 'active' : ''}`}
                    onClick={() => setHideText(false)}
                  >
                    <span className="cr-ico">🏷️</span>
                    <span>
                      <span className="cr-title">Card đầy đủ</span>
                      <span className="cr-sub">Tiêu đề + mô tả như bài viết bình thường</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={hideText}
                    aria-label="Mode Ẩn Chữ"
                    className={`card-radio ${hideText ? 'active' : ''}`}
                    onClick={() => setHideText(true)}
                  >
                    <span className="cr-ico">🖼️</span>
                    <span>
                      <span className="cr-title">Ảnh sạch</span>
                      <span className="cr-sub">Chỉ hiện ảnh bìa, tự ẩn tiêu đề & mô tả</span>
                    </span>
                  </button>
                </div>
              </section>

              <section className={`fstep ${hideText ? 'is-dim' : ''}`}>
                <div className="fstep-head">
                  <span className="step-no" aria-hidden="true">03</span>
                  <div>
                    <div className="fstep-title">Chữ trên thẻ</div>
                    <div className="fstep-hint">
                      {hideText
                        ? 'Chế độ Ảnh sạch đang bật — chữ không hiện trên thẻ.'
                        : 'Tiêu đề và mô tả xuất hiện dưới ảnh bìa.'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="field-meta">
                    <label className="field-label">Tiêu đề</label>
                    <span className={`char-count ${title.length > 90 ? 'over' : ''}`}>{title.length}/100</span>
                  </div>
                  <input
                    type="text"
                    className="input"
                    maxLength={100}
                    disabled={hideText}
                    placeholder="Săn Sale Giảm 50% Ngay Hôm Nay..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: '10px' }}>
                  <div className="field-meta">
                    <label className="field-label">Mô tả</label>
                    <span className={`char-count ${description.length > 180 ? 'over' : ''}`}>{description.length}/200</span>
                  </div>
                  <textarea
                    className="textarea"
                    rows={1}
                    maxLength={200}
                    disabled={hideText}
                    placeholder="Ưu đãi giới hạn cho 100 khách hàng đầu tiên..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </section>

              <div className="form-actions">
                <div className="form-actions-row">
                  <div>
                    <label className="field-label">Link ngắn (tuỳ chọn)</label>
                    <div className="input-with-prefix">
                      <span className="prefix">/c/</span>
                      <input
                        type="text"
                        className="input"
                        placeholder="khuyen-mai-shopee"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading || uploading}
                  >
                    {loading || uploading ? 'Đang tạo thẻ...' : 'Tạo link chạy ads'}
                  </button>
                </div>

                {errorMsg && (
                  <div className="alert-error" style={{ marginTop: '12px' }}>
                    <span>⚠️</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="form-actions-note">Thẻ là link ngắn riêng của bạn — bài đăng đã đăng không bị thay đổi.</div>
              </div>
            </form>
          </div>
        </div>

        {successResult && (
          <div className="overlay">
            <div className="modal modal-sm">
              <div className="modal-success-ico">🎉</div>
              <h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '6px' }}>
                Link đã sẵn sàng
              </h2>
              <p className="modal-sub" style={{ textAlign: 'center', marginBottom: '20px' }}>
                Dán link này lên bài đăng Facebook — FB tự hiện tấm ảnh bìa,
                khách bấm vào ảnh là được chuyển thẳng về link đích.
              </p>

              <div className="link-box" style={{ marginBottom: '16px' }}>
                <span className="link">{successResult.fullCardUrl}</span>
                <button onClick={() => copyToClipboard(successResult.fullCardUrl || '')} className="btn btn-primary btn-sm">
                  {copied ? 'Đã copy' : 'Copy link'}
                </button>
              </div>

              <div className="modal-footer">
                <a
                  href={successResult.fullCardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-soft"
                  style={{ flex: 1 }}
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