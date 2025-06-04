import React from 'react';
import { Inter } from 'next/font/google';
import Header from '../components/Header';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

const Layout = ({ children }) => {
    return (
        <div className={inter.className}>
            <Header />
            <main>{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;