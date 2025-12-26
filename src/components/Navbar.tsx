'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon, { IconName } from './Icon';

export default function Navbar() {
    const pathname = usePathname();

    const links: { href: string; label: string; icon: IconName }[] = [
        { href: '/', label: 'Beranda', icon: 'home' },
        { href: '/regression', label: 'Regresi', icon: 'chart-line' },
        { href: '/prediction', label: 'Prediksi Hujan', icon: 'crystal-ball' },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link href="/" className="navbar-brand">
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
                    }}>
                        <Icon name="chart-bar" size={20} />
                    </span>
                    Analisis Curah Hujan
                </Link>
                <div className="navbar-links">
                    {links.map((link, index) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
                            style={{
                                animationDelay: `${index * 0.1}s`,
                            }}
                        >
                            <Icon name={link.icon} size={18} style={{ marginRight: '6px' }} />
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
