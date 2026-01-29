import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/navbar/Navbar";

import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

import CartPersister from "@/components/CartPersister";
import StoreProvider from "@/app/StoreProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mokaze | Nature & Balance",
  description: "Ropa con espiritu del bosque",
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body 
        className={`
          ${inter.variable} 
          ${playfair.variable} 
          antialiased 
          font-sans 
          bg-mokaze-base 
          text-mokaze-dark
          selection:bg-mokaze-accent 
          selection:text-white
        `}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <StoreProvider>
            <CartPersister />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                  toastOptions={{
                    style: {
                      background: '#333',
                      color: '#fff',
                      fontFamily: 'serif',
                    },
                    success: {
                      duration: 4000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </main>
            </div>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}