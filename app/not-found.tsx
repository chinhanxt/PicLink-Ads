import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#0052ff', marginBottom: '8px' }}>404</h1>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Trang không tồn tại</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa.</p>
      <Link href="/" className="btn-primary-action" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
        Quay về trang chủ
      </Link>
    </div>
  );
}
