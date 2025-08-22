import React, { useState, useEffect } from 'react';
import { customerService } from '../../../services/customerService';
import type { Product, Category } from '../../../services/customerService';
import { useCart } from '../../../contexts/CartContext';
import { useToast } from '../../../contexts/ToastContext';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [customizable, setCustomizable] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    const { incrementCartCount } = useCart();
    const { showToast } = useToast();

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [currentPage, sortBy, selectedCategory, searchQuery, minPrice, maxPrice, customizable]);

    const loadCategories = async () => {
        try {
            const categoriesData = await customerService.getCategories();
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading categories:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load categories',
                duration: 5000
            });
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);

            // Build filter parameters
            const params: any = {
                page: currentPage,
                limit: 12,
                sort: sortBy
            };

            // Add search query
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }

            // Add category filter
            if (selectedCategory) {
                params.category = selectedCategory;
            }

            // Add price filters
            if (minPrice) {
                params.minPrice = parseFloat(minPrice);
            }
            if (maxPrice) {
                params.maxPrice = parseFloat(maxPrice);
            }

            // Add customizable filter
            if (customizable !== 'all') {
                params.customizable = customizable;
            }

            const result = await customerService.getProducts(params);
            setProducts(result.products);
            setTotalProducts(result.total);
            setTotalPages(Math.ceil(result.total / 12));
        } catch (error) {
            console.error('Error loading products:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load products',
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product: Product, customizations?: Record<string, string>, quantity: number = 1) => {
        try {
            // Convert customizations to the format expected by the API
            const customizationsArray = customizations ? Object.entries(customizations).map(([type, value]) => ({
                type,
                value
            })) : undefined;

            await customerService.addToCart(product.id.toString(), quantity, customizationsArray);
            incrementCartCount();

            const customizationText = customizations && Object.keys(customizations).length > 0
                ? ` with customizations`
                : '';

            showToast({
                type: 'success',
                title: 'Success',
                message: `${product.name}${customizationText} added to cart successfully!`,
                duration: 3000
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to add product to cart',
                duration: 5000
            });
        }
    };

    const handleToggleWishlist = async (product: Product) => {
        try {
            // TODO: Implement wishlist toggle functionality
            console.log('Toggle wishlist for product:', product.id);
            showToast({
                type: 'info',
                title: 'Info',
                message: 'Wishlist functionality coming soon!',
                duration: 3000
            });
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            showToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to update wishlist',
                duration: 5000
            });
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setCustomizable('all');
        setCurrentPage(1);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        loadProducts();
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-8">
                        <div className="relative">

                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                                    Our Products
                                </h1>
                                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                                    Discover amazing anime figures and collectibles
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-6 mb-8">
                    {/* Filter Toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Filters</h3>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-sm text-brand hover:text-brand-dark transition-colors"
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="space-y-4">
                            {/* Search and Category Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Search Products
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full p-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-brand focus:ring-brand focus:bg-white dark:focus:bg-neutral-800 transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full p-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Price Range Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Min Price (₫)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full p-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Max Price (₫)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="No limit"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full p-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Customizable
                                    </label>
                                    <select
                                        value={customizable}
                                        onChange={(e) => setCustomizable(e.target.value)}
                                        className="w-full p-3 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                    >
                                        <option value="all">All Products</option>
                                        <option value="true">Customizable Only</option>
                                        <option value="false">Non-Customizable Only</option>
                                    </select>
                                </div>
                            </div>

                            {/* Sort and Actions Row */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-600">
                                <div className="flex items-center space-x-4">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Sort by:
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="p-2 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:border-brand focus:ring-brand transition-all duration-200"
                                    >
                                        <option value="createdAt">Newest First</option>
                                        <option value="name">Name A-Z</option>
                                        <option value="price">Price Low to High</option>
                                        <option value="price-desc">Price High to Low</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-200"
                                    >
                                        Clear Filters
                                    </button>
                                    <button
                                        onClick={handleSearch}
                                        className="px-6 py-2 bg-brand text-white hover:bg-brand-dark rounded-lg transition-all duration-200 font-medium"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            Products
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                            {loading ? 'Loading...' : `Showing ${products.length} of ${totalProducts} products`}
                        </p>
                    </div>
                    {!loading && products.length > 0 && (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            Page {currentPage} of {totalPages}
                        </div>
                    )}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin-slow rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                        <p className="text-neutral-500 dark:text-neutral-400">Loading products...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onAddToWishlist={handleToggleWishlist}
                                getCustomizationOptions={customerService.getCustomizationOptions}
                                calculateCustomizedPrice={async (productId: string, customizations: Array<{ type: string; value: string }>) => {
                                    const result = await customerService.calculateCustomizedPrice(productId, customizations);
                                    return { price: result.totalPrice || result.price || 0 };
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Package className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                            No products found
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                            Try adjusting your filters or search terms.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-brand text-white hover:bg-brand-dark rounded-xl transition-all duration-200 font-medium"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="card border-2 border-neutral-100 dark:border-neutral-700 shadow-soft bg-white dark:bg-neutral-800 rounded-2xl p-4">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-2 rounded-xl border-2 transition-all duration-200 ${page === currentPage
                                            ? 'border-brand bg-brand text-white'
                                            : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-brand hover:text-brand'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage; 