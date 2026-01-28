import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css"; // Ajusta la ruta si moviste el archivo
import Navbar from "@/components/navbar/Navbar";

// Importaciones de Next-Intl
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
  description: "Equipamiento de aventura con alma zen.",
};

// Definimos los props incluyendo los params de locale
export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  
  // Obtenemos los mensajes del servidor para pasarlos al cliente

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
        <NextIntlClientProvider>
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
                    // Personalización para que combine con Mokaze
                    style: {
                      background: '#333',
                      color: '#fff',
                      fontFamily: 'serif', // Si usas serif en tu marca
                    },
                    success: {
                      duration: 4000,
                      iconTheme: {
                        primary: '#10B981', // Emerald green
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444', // Red
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