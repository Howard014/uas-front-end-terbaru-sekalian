"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { loginUser, isLoggedIn } from "@/utils/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulasi loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (loginUser(email, password)) {
      console.log('✅ Login successful, dispatching authChange event');
      
      // 🔥 BARIS YANG DITAMBAHKAN - Dispatch event to notify navbar about login
      window.dispatchEvent(new Event('authChange'));
      
      // Redirect to home
      router.push("/");
    } else {
      setError("Email atau password salah!");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container-landscape">
      {/* Background dengan gradient dan pattern */}
      <div className="login-background-landscape">
        <div className="bg-pattern-landscape"></div>
        <div className="bg-gradient-landscape"></div>
      </div>

      {/* Main Content - Layout Horizontal */}
      <div className="login-content-wrapper">
        {/* Left Side - Brand/Info */}
        <div className="login-brand-section">
          <div className="brand-content">
            <div className="logo-icon-large">🍛</div>
            <h1 className="brand-title">Rasa Manado</h1>
            <p className="brand-subtitle">
              Jelajahi cita rasa khas Manado dan kisah di baliknya. Masuk untuk mengalami kuliner autentik Sulawesi Utara.
            </p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">🌶️</span>
                <span>Rasa Pedas Khas</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🐟</span>
                <span>Seafood Segar</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🍚</span>
                <span>Masakan Tradisional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="login-card-landscape">
            {/* Header */}
            <div className="login-header-landscape">
              <h2 className="login-title-landscape">Selamat Datang</h2>
              <p className="login-subtitle-landscape">
                Silakan masuk ke akun Anda
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="login-form-landscape">
              <div className="form-group-landscape">
                <label htmlFor="email" className="form-label-landscape">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input-landscape"
                  placeholder="masukkan@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-landscape">
                <label htmlFor="password" className="form-label-landscape">
                  🔒 Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-input-landscape"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message-landscape">
                  ⚠️ {error}
                </div>
              )}

              {/* Demo Credentials */}
              <div className="demo-credentials-landscape">
                <strong>Demo Account:</strong><br />
                Email: <span>admin@rasamanado.com</span><br />
                Password: <span>admin123</span>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                className="login-button-landscape"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner-landscape"></div>
                    Memproses...
                  </>
                ) : (
                  '🚀 Masuk ke Dashboard'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="login-footer-landscape">
              <Link href="/" className="back-link-landscape">
                ← Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="floating-element-landscape element-1">🌶️</div>
      <div className="floating-element-landscape element-2">🍚</div>
      <div className="floating-element-landscape element-3">🐟</div>
      <div className="floating-element-landscape element-4">🍋</div>
      <div className="floating-element-landscape element-5">🥥</div>
      <div className="floating-element-landscape element-6">🦐</div>
    </div>
  );
}