import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { LangProvider } from '@/context/LangContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';
import BottomNav from '@/components/BottomNav';
import ChatWidget from '@/components/ChatWidget';
import ScrollToTop from '@/components/ScrollToTop';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'MarketKG — B2B маркетплейс поставщиков Кыргызстана',
  description: 'Маркетплейс поставщиков продуктов питания B2B. Бишкек, Ош, Джалал-Абад и все регионы Кыргызстана.',
  openGraph: {
    title: 'MarketKG — B2B маркетплейс поставщиков Кыргызстана',
    description: 'Находите поставщиков продуктов питания, сравнивайте цены, заказывайте оптом. Бишкек, Ош и все регионы.',
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <LangProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <Toaster position="top-right" />
                <Header />
                <main className="flex-1">{children}</main>
                <FloatingCart />
                <ChatWidget />
                <ScrollToTop />
                <Footer />
                <BottomNav />
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
