'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon, { IconName } from './Icon';

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const links: { href: string; label: string; icon: IconName }[] = [
        { href: '/', label: 'Beranda', icon: 'home' },
        { href: '/regression', label: 'Regresi', icon: 'chart-line' },
        { href: '/prediction', label: 'Prediksi Hujan', icon: 'crystal-ball' },
    ];

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 24px',
                    height: '64px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    {/* Brand */}
                    <Link href="/" onClick={closeMenu} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        textDecoration: 'none',
                    }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            borderRadius: '10px',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            color: 'white',
                            flexShrink: 0,
                        }}>
                            <Icon name="chart-bar" size={20} />
                        </span>
                        <span className="navbar-brand-text">Analisis Curah Hujan</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="navbar-links-desktop" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    color: pathname === link.href ? '#6366f1' : '#475569',
                                    textDecoration: 'none',
                                    background: pathname === link.href ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <Icon name={link.icon} size={18} style={{ marginRight: '6px' }} />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Hamburger Button */}
                    <button
                        className="navbar-hamburger"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                        style={{
                            display: 'none',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '40px',
                            height: '40px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                        }}
                    >
                        <span style={{
                            width: '20px',
                            height: '2px',
                            background: '#1e293b',
                            borderRadius: '2px',
                            margin: '2px 0',
                            transition: 'all 0.3s ease',
                            transform: isMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
                        }}></span>
                        <span style={{
                            width: '20px',
                            height: '2px',
                            background: '#1e293b',
                            borderRadius: '2px',
                            margin: '2px 0',
                            transition: 'all 0.3s ease',
                            opacity: isMenuOpen ? 0 : 1,
                        }}></span>
                        <span style={{
                            width: '20px',
                            height: '2px',
                            background: '#1e293b',
                            borderRadius: '2px',
                            margin: '2px 0',
                            transition: 'all 0.3s ease',
                            transform: isMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
                        }}></span>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                <div style={{
                    display: isMenuOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px',
                    background: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}>
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMenu}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '14px 16px',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: pathname === link.href ? '#6366f1' : '#475569',
                                textDecoration: 'none',
                                background: pathname === link.href ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            }}
                        >
                            <Icon name={link.icon} size={20} style={{ marginRight: '10px' }} />
                            {link.label}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Overlay */}
            {isMenuOpen && (
                <div
                    onClick={closeMenu}
                    style={{
                        position: 'fixed',
                        top: '64px',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.3)',
                        zIndex: 999,
                    }}
                />
            )}

            <style jsx global>{`
                @media (max-width: 768px) {
                    .navbar-links-desktop {
                        display: none !important;
                    }
                    .navbar-hamburger {
                        display: flex !important;
                    }
                    .navbar-brand-text {
                        font-size: 1rem;
                    }
                }
                @media (max-width: 480px) {
                    .navbar-brand-text {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}
