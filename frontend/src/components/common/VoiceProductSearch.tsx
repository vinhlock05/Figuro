import React, { useState, useEffect } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import { voiceService } from '../../services/voiceService';
import { Search, Filter, Mic, X, ShoppingCart, Heart, Eye } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category?: {
        name: string;
    };
    stock?: number;
    isCustomizable?: boolean;
}

interface VoiceProductSearchProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuery?: string;
}

const VoiceProductSearch: React.FC<VoiceProductSearchProps> = ({ isOpen, onClose, initialQuery = '' }) => {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const { processTextInput, speak } = useVoice();

    // Load categories on component mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Load search results when query changes
    useEffect(() => {
        if (searchQuery.trim()) {
            performSearch();
        }
    }, [searchQuery, selectedCategory, selectedPriceRange]);

    const loadCategories = async () => {
        try {
            const cats = await voiceService.getProductCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const performSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const results = await voiceService.searchProductsByVoice(
                searchQuery,
                selectedCategory || undefined,
                selectedPriceRange || undefined,
                20
            );
            setSearchResults(results.products || []);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleVoiceSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            await speak(`Đang tìm kiếm sản phẩm: ${searchQuery}`);
            await processTextInput(`Tìm kiếm sản phẩm: ${searchQuery}`);
        } catch (error) {
            console.error('Voice search failed:', error);
        }
    };

    const handleProductClick = (product: Product) => {
        // Navigate to product detail page
        window.location.href = `/products/${product.id}`;
    };

    const handleAddToCart = (product: Product) => {
        // Add to cart logic
        console.log('Adding to cart:', product.name);
    };

    const handleAddToWishlist = (product: Product) => {
        // Add to wishlist logic
        console.log('Adding to wishlist:', product.name);
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedPriceRange('');
    };

    const priceRanges = [
        { value: 'low', label: 'Dưới 1 triệu VND' },
        { value: 'medium', label: '1-3 triệu VND' },
        { value: 'high', label: 'Trên 3 triệu VND' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            🎤 Tìm kiếm sản phẩm bằng giọng nói
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors"
                        >
                            <X className="h-6 w-6 text-neutral-500" />
                        </button>
                    </div>
                </div>

                {/* Search Input */}
                <div className="p-6 border-b-2 border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Nhập tên sản phẩm hoặc mô tả..."
                                className="w-full pl-10 pr-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-brand focus:border-brand bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                        <button
                            onClick={handleVoiceSearch}
                            className="p-3 bg-brand text-white rounded-xl hover:bg-brand-dark transition-colors"
                        >
                            <Mic className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-xl border-2 transition-colors ${showFilters
                                    ? 'border-brand bg-brand text-white'
                                    : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400'
                                }`}
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Danh mục
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                                    >
                                        <option value="">Tất cả danh mục</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Khoảng giá
                                    </label>
                                    <select
                                        value={selectedPriceRange}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                        className="w-full p-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                                    >
                                        <option value="">Tất cả giá</option>
                                        {priceRanges.map((range) => (
                                            <option key={range.value} value={range.value}>
                                                {range.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isSearching ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                            <span className="ml-3 text-neutral-600 dark:text-neutral-400">Đang tìm kiếm...</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl p-4 hover:border-brand/30 transition-all duration-200"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square bg-neutral-100 dark:bg-neutral-600 rounded-lg mb-4 flex items-center justify-center">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="text-neutral-400 text-4xl">🎭</div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-brand">
                                                {product.price?.toLocaleString('vi-VN')} VND
                                            </span>
                                            <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-600 px-2 py-1 rounded">
                                                {product.category?.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Product Actions */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-600">
                                        <button
                                            onClick={() => handleProductClick(product)}
                                            className="flex items-center space-x-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span>Xem chi tiết</span>
                                        </button>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAddToWishlist(product)}
                                                className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                                            >
                                                <Heart className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="p-2 text-neutral-400 hover:text-brand transition-colors"
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                                Không tìm thấy sản phẩm
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                                Không có sản phẩm nào phù hợp với từ khóa "{searchQuery}"
                            </p>
                            <button
                                onClick={() => processTextInput(`Tìm kiếm sản phẩm: ${searchQuery}`)}
                                className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
                            >
                                Hỏi trợ lý ảo
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎤</div>
                            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                                Bắt đầu tìm kiếm
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Nhập từ khóa hoặc sử dụng giọng nói để tìm sản phẩm
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceProductSearch;
