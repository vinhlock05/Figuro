import React from 'react';
import { Link } from 'react-router-dom';
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Mail,
    Phone,
    MapPin,
    ArrowUp
} from 'lucide-react';

const Footer: React.FC = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-neutral-50 dark:bg-neutral-800 border-t-2 border-neutral-100 dark:border-neutral-700 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* Main footer content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Company info */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center shadow-lg border border-brand/30">
                                <span className="text-brand font-bold text-2xl">F</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                    Figuro
                                </span>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Premium Anime Figures</p>
                            </div>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                            Discover the perfect blend of craftsmanship and creativity with our premium anime figures.
                            Experience art like never before.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="p-3 bg-white dark:bg-neutral-700 rounded-2xl hover:bg-brand/10 hover:text-brand transition-all duration-300 shadow-lg hover:shadow-xl border border-neutral-200 dark:border-neutral-600">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-3 bg-white dark:bg-neutral-700 rounded-2xl hover:bg-brand/10 hover:text-brand transition-all duration-300 shadow-lg hover:shadow-xl border border-neutral-200 dark:border-neutral-600">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-3 bg-white dark:bg-neutral-700 rounded-2xl hover:bg-brand/10 hover:text-brand transition-all duration-300 shadow-lg hover:shadow-xl border border-neutral-200 dark:border-neutral-600">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-3 bg-white dark:bg-neutral-700 rounded-2xl hover:bg-brand/10 hover:text-brand transition-all duration-300 shadow-lg hover:shadow-xl border border-neutral-200 dark:border-neutral-600">
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center">
                                <span className="text-brand text-sm">🔗</span>
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Quick Links</h3>
                        </div>
                        <ul className="space-y-3">
                            {[
                                { name: 'Shop All', href: '/products', icon: '🛍️' },
                                { name: 'New Arrivals', href: '/products?new=true', icon: '🆕' },
                                { name: 'Best Sellers', href: '/products?bestsellers=true', icon: '⭐' },
                                { name: 'Sale Items', href: '/products?sale=true', icon: '🏷️' },
                                { name: 'Gift Cards', href: '/gift-cards', icon: '🎁' }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-300 hover:text-brand transition-all duration-300 text-sm group hover:translate-x-1"
                                    >
                                        <span className="text-lg group-hover:scale-110 transition-transform">{link.icon}</span>
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer service */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
                                <span className="text-accent text-sm">🎧</span>
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Customer Service</h3>
                        </div>
                        <ul className="space-y-3">
                            {[
                                { name: 'Contact Us', href: '/contact', icon: '📞' },
                                { name: 'Help Center', href: '/help', icon: '❓' },
                                { name: 'Returns & Exchanges', href: '/returns', icon: '🔄' },
                                { name: 'Shipping Info', href: '/shipping', icon: '🚚' },
                                { name: 'Size Guide', href: '/size-guide', icon: '📏' }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-300 hover:text-accent transition-all duration-300 text-sm group hover:translate-x-1"
                                    >
                                        <span className="text-lg group-hover:scale-110 transition-transform">{link.icon}</span>
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center">
                                <span className="text-brand text-sm">📧</span>
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Contact Info</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 group hover:translate-x-1 transition-transform duration-300">
                                <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-4 w-4 text-brand" />
                                </div>
                                <div className="pt-1">
                                    <p className="text-neutral-600 dark:text-neutral-300 text-sm font-medium">
                                        123 Innovation Street<br />
                                        Tech District, TD 12345
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 group hover:translate-x-1 transition-transform duration-300">
                                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Phone className="h-4 w-4 text-accent" />
                                </div>
                                <p className="text-neutral-600 dark:text-neutral-300 text-sm font-medium">+1 (555) 123-4567</p>
                            </div>
                            <div className="flex items-center space-x-3 group hover:translate-x-1 transition-transform duration-300">
                                <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-4 w-4 text-brand" />
                                </div>
                                <p className="text-neutral-600 dark:text-neutral-300 text-sm font-medium">support@figuro.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Newsletter signup */}
                <div className="mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-600">
                    <div className="max-w-lg mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand/10 rounded-2xl mb-6 shadow-lg">
                            <span className="text-brand text-2xl">📧</span>
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                            Stay Updated
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6 leading-relaxed">
                            Get the latest product updates, exclusive offers, and anime figure news delivered to your inbox.
                        </p>
                        <div className="flex space-x-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 px-5 py-4 border-2 border-neutral-200 dark:border-neutral-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand text-sm shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                            />
                            <button className="px-8 py-4 bg-brand text-white rounded-2xl hover:bg-brand-dark transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transform">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
                        <div className="flex items-center space-x-8 text-sm text-neutral-600 dark:text-neutral-300">
                            <span className="font-medium">&copy; 2024 Figuro. All rights reserved.</span>
                            <Link to="/privacy" className="hover:text-brand transition-all duration-300 hover:scale-105 transform">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="hover:text-brand transition-all duration-300 hover:scale-105 transform">
                                Terms of Service
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">Secure payments with:</span>
                            <div className="flex space-x-3">
                                <div className="w-10 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-md">
                                    VISA
                                </div>
                                <div className="w-10 h-6 bg-red-500 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-md">
                                    MC
                                </div>
                                <div className="w-10 h-6 bg-blue-400 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-md">
                                    PP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to top button */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-8 right-24 md:right-28 p-3 rounded-full bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-200 z-30"
            >
                <ArrowUp className="h-5 w-5" />
            </button>
        </footer>
    );
};

export default Footer;
