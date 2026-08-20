import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "KaamSetu — AI Safety Net for BRICS Informal Workers",
  description: "800 million workers. Zero safety net. Until now. KaamSetu bridges the gap between informal workers and government welfare schemes across India, Brazil, Russia, China, and South Africa.",
  keywords: "KaamSetu, BRICS, informal workers, migrant workers, welfare schemes, eShram, PMJAY, worker rights",
  openGraph: {
    title: "KaamSetu — AI Safety Net for BRICS Workers",
    description: "AI-powered bridge between 800M+ informal workers and their government entitlements.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a3a6b" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} bg-[#f8fafc] antialiased`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
