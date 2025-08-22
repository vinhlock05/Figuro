import React from 'react';
import { CreditCard, Smartphone, Wallet, DollarSign } from 'lucide-react';

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    description: string;
    longDescription: string;
    features: string[];
    iconComponent?: React.ReactNode;
}

interface PaymentMethodSelectorProps {
    selectedMethod: string;
    onMethodChange: (method: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedMethod, onMethodChange }) => {
    const paymentMethods: PaymentMethod[] = [
        {
            id: 'momo',
            name: 'MoMo',
            icon: '💜',
            description: 'MoMo Wallet',
            longDescription: 'Fast and secure payment through MoMo mobile wallet',
            features: ['Instant payment', 'Secure wallet', 'Mobile app', 'Wide acceptance'],
            iconComponent: <Wallet className="h-6 w-6" />
        },
        {
            id: 'zalopay',
            name: 'ZaloPay',
            icon: '💙',
            description: 'ZaloPay App',
            longDescription: 'Convenient payment using ZaloPay mobile application',
            features: ['Quick payment', 'Zalo integration', 'Rewards program', 'Easy setup'],
            iconComponent: <Smartphone className="h-6 w-6" />
        },
        {
            id: 'vnpay',
            name: 'VNPAY',
            icon: '💚',
            description: 'VNPAY Gateway',
            longDescription: 'Comprehensive payment gateway with multiple options',
            features: ['Multiple banks', 'Credit cards', 'QR codes', 'Secure gateway'],
            iconComponent: <CreditCard className="h-6 w-6" />
        },
        {
            id: 'cod',
            name: 'COD',
            icon: '💵',
            description: 'Cash on Delivery',
            longDescription: 'Pay with cash when your order is delivered',
            features: ['No upfront payment', 'Pay on delivery', 'Cash only', 'Secure delivery'],
            iconComponent: <DollarSign className="h-6 w-6" />
        }
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {paymentMethods.map((method) => (
                    <div
                        key={method.id}
                        onClick={() => onMethodChange(method.id)}
                        className={`relative cursor-pointer transition-all duration-200 ${selectedMethod === method.id
                                ? 'ring-2 ring-brand ring-offset-2'
                                : 'hover:ring-2 hover:ring-neutral-300 dark:hover:ring-neutral-600'
                            }`}
                    >
                        <div
                            className={`p-4 border-2 rounded-xl transition-all duration-200 ${selectedMethod === method.id
                                    ? 'border-brand bg-brand/5 text-brand'
                                    : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                                }`}
                        >
                            {/* Method Header */}
                            <div className="text-center mb-3">
                                <div className="text-3xl mb-2">{method.icon}</div>
                                <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                                    {method.name}
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {method.description}
                                </div>
                            </div>

                            {/* Method Description */}
                            <div className="text-center mb-3">
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {method.longDescription}
                                </p>
                            </div>

                            {/* Method Features */}
                            <div className="space-y-1">
                                {method.features.map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-xs">
                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedMethod === method.id
                                                ? 'bg-brand'
                                                : 'bg-neutral-400 dark:bg-neutral-500'
                                            }`} />
                                        <span className={`${selectedMethod === method.id
                                                ? 'text-brand'
                                                : 'text-neutral-500 dark:text-neutral-400'
                                            }`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Selection Indicator */}
                            {selectedMethod === method.id && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Method Details */}
            {selectedMethod && (
                <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600">
                    <div className="flex items-center space-x-3 mb-3">
                        {paymentMethods.find(m => m.id === selectedMethod)?.iconComponent}
                        <div>
                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                                {paymentMethods.find(m => m.id === selectedMethod)?.name} Payment
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {paymentMethods.find(m => m.id === selectedMethod)?.longDescription}
                            </p>
                        </div>
                    </div>

                    {selectedMethod === 'cod' ? (
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            <p>• No payment required now</p>
                            <p>• Pay with cash when your order arrives</p>
                            <p>• Delivery fee may apply</p>
                        </div>
                    ) : (
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            <p>• You will be redirected to complete payment</p>
                            <p>• Payment is processed securely</p>
                            <p>• Order will be confirmed after successful payment</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelector;
