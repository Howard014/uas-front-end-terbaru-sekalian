"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn, logoutUser, getCurrentUser } from "@/utils/auth";

interface User {
  name: string;
  email: string;
}

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // Function to update auth state
  const updateAuthState = () => {
    const authStatus = isLoggedIn();
    console.log('🔄 Updating auth state:', authStatus);
    setLoggedIn(authStatus);
    if (authStatus) {
      const currentUser = getCurrentUser();
      console.log('👤 Current user:', currentUser);
      setUser(currentUser);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial check
    updateAuthState();

    // Create custom event listener for auth changes
    const handleAuthChange = () => {
      console.log('🎯 Auth change event received');
      updateAuthState();
    };

    // Listen for custom auth events
    window.addEventListener('authChange', handleAuthChange);

    // Also listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rasamanado_token' || e.key === 'rasamanado_user') {
        console.log('💾 Storage changed:', e.key);
        updateAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // Check auth state every 2 seconds (fallback)
    const interval = setInterval(updateAuthState, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    logoutUser();

    // Update state immediately
    setLoggedIn(false);
    setUser(null);

    // Dispatch event to notify other components
    window.dispatchEvent(new Event('authChange'));

    router.push("/");
  };

  console.log('🎨 Navbar rendered - loggedIn:', loggedIn, 'user:', user);

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${isScrolled ? 'bg-dark scrolled' : 'bg-transparent'}`} style={{ zIndex: 1030 }}>
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold fs-3 text-warning" href="/">
          Rasa Manado
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Navigation Links */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link text-white" href="/">
                Beranda
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/#menu-gallery">
                Menu
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" href="/#brand">
                Tentang
              </Link>
            </li>
          </ul>

          {/* Auth Buttons & Order Button */}
          <div className="d-flex align-items-center" style={{ gap: '1.5rem' }}>
            {loggedIn ? (
              <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                <span className="text-white d-none d-md-block">
                  Halo, <strong>{user?.name || 'User'}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light"
                  style={{ minWidth: '100px' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn btn-outline-light"
                style={{ minWidth: '100px' }}
              >
                Login
              </Link>
            )}

            {/* Order Button */}
            <button
              onClick={() => router.push("/order")}
              className="btn btn-warning fw-bold text-dark px-4"
              style={{
                borderRadius: '25px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.transform = "scale(1.05)";
                el.style.boxShadow = "0 4px 12px rgba(255, 193, 7, 0.4)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.transform = "scale(1)";
                el.style.boxShadow = "none";
              }}
            >
              🍽 Dine In / Pesan
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
