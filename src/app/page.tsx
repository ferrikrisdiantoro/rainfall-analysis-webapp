import Link from 'next/link';
import Icon from '@/components/Icon';

export default function Home() {
  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section className="hero">
        {/* Decorative floating elements */}
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          top: '10%',
          left: '5%',
          animation: 'floatSlow 10s ease-in-out infinite',
          zIndex: 0,
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
          bottom: '20%',
          left: '15%',
          animation: 'floatSlow 8s ease-in-out infinite reverse',
          zIndex: 0,
          borderRadius: '50%',
        }} />

        <h1 className="hero-title">Analisis Curah Hujan</h1>
        <p className="hero-subtitle">
          Web aplikasi untuk analisis regresi dan prediksi curah hujan menggunakan Machine Learning.
          Upload data Anda, pilih model, dan dapatkan hasil instan.
        </p>
        <div className="flex justify-center gap-2" style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/regression" className="btn btn-primary">
            <Icon name="chart-line" size={20} />
            Modul Regresi
          </Link>
          <Link href="/prediction" className="btn btn-secondary">
            <Icon name="crystal-ball" size={20} />
            Prediksi Hujan
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mt-4">
        <div className="grid-2">
          {/* Regression Card */}
          <div className="feature-card">
            <div className="feature-icon">
              <Icon name="chart-bar" size={48} color="#6366f1" />
            </div>
            <h3 className="feature-title">Analisis Regresi</h3>
            <p className="feature-description">
              Fitting data dengan model regresi Linear, Polynomial, atau Exponential.
              Dapatkan formula akurat, visualisasi grafik, dan metrik akurasi (R², MAE, RMSE).
            </p>
            <div className="mt-3">
              <Link href="/regression" className="btn btn-primary btn-sm">
                Mulai Analisis
                <Icon name="chart-line" size={16} />
              </Link>
            </div>
          </div>

          {/* Prediction Card */}
          <div className="feature-card">
            <div className="feature-icon">
              <Icon name="crystal-ball" size={48} color="#8b5cf6" />
            </div>
            <h3 className="feature-title">Prediksi Curah Hujan</h3>
            <p className="feature-description">
              Prediksi curah hujan 1-30 hari ke depan menggunakan model ML (Gradient Boosting).
              Berdasarkan data historis harian dengan visualisasi gabungan.
            </p>
            <div className="mt-3">
              <Link href="/prediction" className="btn btn-primary btn-sm">
                Mulai Prediksi
                <Icon name="crystal-ball" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mt-4 mb-4">
        <h2 className="section-title text-center mb-3">
          <span className="gradient-text">Fitur Utama</span>
        </h2>
        <div className="grid-3">
          <div className="metric-card" style={{ padding: '28px' }}>
            <div style={{
              marginBottom: '16px',
              animation: 'float 3s ease-in-out infinite',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Icon name="folder" size={40} color="#6366f1" />
            </div>
            <div className="metric-label">Input Data</div>
            <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Manual atau Upload CSV
            </div>
          </div>
          <div className="metric-card" style={{ padding: '28px' }}>
            <div style={{
              marginBottom: '16px',
              animation: 'float 3s ease-in-out infinite 0.5s',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Icon name="chart-bar" size={40} color="#8b5cf6" />
            </div>
            <div className="metric-label">Visualisasi</div>
            <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Tabel & Grafik Interaktif
            </div>
          </div>
          <div className="metric-card" style={{ padding: '28px' }}>
            <div style={{
              marginBottom: '16px',
              animation: 'float 3s ease-in-out infinite 1s',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Icon name="robot" size={40} color="#a855f7" />
            </div>
            <div className="metric-label">Machine Learning</div>
            <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Gradient Boosting Regressor
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 24px',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        borderTop: '1px solid var(--border-color)',
        marginTop: '48px'
      }}>
        <p>© 2024 Analisis Curah Hujan. Dibuat dengan Next.js dan ONNX Runtime.</p>
      </footer>
    </div>
  );
}
