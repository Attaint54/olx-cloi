import React from 'react';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import SellModal from '../components/SellModal';
import ToastContainer from '../components/Toast';
import AnimatedCursor from 'react-animated-cursor';

export const metadata = {
  title: 'OLX - Buy and Sell Cars, Mobile Phones, Jobs, Home, & More',
  description: 'OLX makes buying and selling simple, secure, and instant.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts: Inter & Outfit */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* FontAwesome Icon Library */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <AppProvider>
          <div id="app-container">
            <Header />
            <main id="main-content" className="fade-in">
              {children}
            </main>
            <Footer />
          </div>
          
          {/* Overlay components */}
          <AnimatedCursor
            innerSize={8}
            outerSize={32}
            color="0, 162, 154"
            outerAlpha={0.15}
            innerScale={0.7}
            outerScale={4}
            trailingSpeed={6}
            clickables={['a', 'button', 'input', 'select', 'textarea', '.btn', '.category-bubble']}
            outerStyle={{ border: '2px solid rgba(0, 162, 154, 0.6)' }}
          />
          <AuthModal />
          <SellModal />
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
