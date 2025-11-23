import './styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clínica — Mater-like',
  description: 'Atención de calidad para tu familia'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Google Fonts: Montserrat (primaria) + Poppins (secundaria) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800&family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
        {/* Tailwind Play CDN — solo para prototipo */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if (typeof window !== "undefined") { const s = document.createElement('script'); s.src = "https://cdn.tailwindcss.com"; document.head.appendChild(s); }`
          }}
        />
      </head>
      <body className="font-primary antialiased bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}