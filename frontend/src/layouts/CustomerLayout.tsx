import React from 'react';
import { Header, Footer } from '../components/customer/Layout';
import VoiceAgentButton from '../components/common/VoiceAgentButton';
import VoiceAgentModal from '../components/common/VoiceAgentModal';
import ToastContainer from '../components/common/ToastContainer';

interface CustomerLayoutProps {
    children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Header */}
            <Header />

            {/* Main content area - Enhanced with better spacing and animations */}
            <main className="flex-1 min-w-0 flex items-center justify-center py-8 relative z-10 bg-neutral-700">
                <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 hover:scale-[1.01]">
                        {/* Content wrapper with subtle border */}
                        <div className="relative">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Voice Agent Components */}
            <VoiceAgentButton />
            <VoiceAgentModal />

            {/* Toast Container */}
            <ToastContainer />
        </div>
    );
};

export default CustomerLayout; 