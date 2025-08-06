import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import type { Product, Category, GroupedCustomizationOptions } from '../../services/customerService';
import ToastMessage, { type ToastType } from '../common/ToastMessage';
import { useCart } from '../../contexts/CartContext';
import { formatVND } from '../../utils/currency';
import {
    Search,
    Filter,
    Grid,
    List,
    ShoppingCart,
    Heart,
    ChevronDown,
    X,
    Settings,
    Package
} from 'lucide-react';

const ProductsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Customization states
    const [showCustomizationModal, setShowCustomizationModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [customizationOptions, setCustomizationOptions] = useState<GroupedCustomizationOptions>({});
    const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});
    const [customizedPrice, setCustomizedPrice] = useState<number | null>(null);
    const [loadingCustomizations, setLoadingCustomizations] = useState(false);
    const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({});

    // Toast states
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({
        open: false,
        type: 'success',
        message: ''
    });

    const { incrementCartCount } = useCart();

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);

                const params = {
                    page: currentPage,
                    limit: 12,
                    search: searchQuery,
                    category: selectedCategory,
                    sort: sortBy,
                    minPrice: priceRange.min,
                    maxPrice: priceRange.max,
                };

                const result = await customerService.getProducts(params);
                setProducts(result.products);
                setTotalPages(result.totalPages);
                setTotalProducts(result.total);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        };

        const loadCategories = async () => {
            try {
                const categoriesData = await customerService.getCategories();
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };

        loadProducts();
        loadCategories();
    }, [currentPage, searchQuery, selectedCategory, sortBy, priceRange]);

    // Load wishlist status for products
    useEffect(() => {
        const loadWishlistStatus = async () => {
            try {
                const statusMap: Record<string, boolean> = {};
                for (const product of products) {
                    statusMap[product.id.toString()] = await customerService.isInWishlist(product.id.toString());
                }
                setWishlistStatus(statusMap);
            } catch (error) {
                console.error('Error loading wishlist status:', error);
            }
        };

        if (products.length > 0) {
            loadWishlistStatus();
        }
    }, [products]);

    useEffect(() => {
        // Update URL params when filters change
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        if (sortBy) params.set('sort', sortBy);
        if (priceRange.min) params.set('minPrice', priceRange.min);
        if (priceRange.max) params.set('maxPrice', priceRange.max);

        setSearchParams(params);
    }, [searchQuery, selectedCategory, sortBy, priceRange, setSearchParams]);

    const handleAddToCart = async (productId: string) => {
        try {
            await customerService.addToCart(productId, 1);
            incrementCartCount();
            setToast({
                open: true,
                type: 'success',
                message: 'Sản phẩm đã được thêm vào giỏ hàng!'
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.'
            });
        }
    };

    const handleAddToWishlist = async (productId: string) => {
        try {
            const isInWishlist = wishlistStatus[productId];

            if (isInWishlist) {
                await customerService.removeFromWishlist(productId);
                setWishlistStatus(prev => ({ ...prev, [productId]: false }));
                setToast({
                    open: true,
                    type: 'success',
                    message: 'Đã xóa sản phẩm khỏi danh sách yêu thích!'
                });
            } else {
                await customerService.addToWishlist(productId);
                setWishlistStatus(prev => ({ ...prev, [productId]: true }));
                setToast({
                    open: true,
                    type: 'success',
                    message: 'Đã thêm sản phẩm vào danh sách yêu thích!'
                });
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.'
            });
        }
    };

    const handleCustomizeProduct = async (product: Product) => {
        setSelectedProduct(product);
        setSelectedCustomizations({});
        setCustomizedPrice(null);
        setShowCustomizationModal(true);

        if (product.isCustomizable) {
            setLoadingCustomizations(true);
            try {
                const options = await customerService.getCustomizationOptions(product.id.toString());
                setCustomizationOptions(options);
            } catch (error) {
                console.error('Error loading customization options:', error);
            } finally {
                setLoadingCustomizations(false);
            }
        }
    };

    const handleCustomizationChange = async (optionType: string, optionValue: string) => {
        const newCustomizations = {
            ...selectedCustomizations,
            [optionType]: optionValue
        };
        setSelectedCustomizations(newCustomizations);

        // Calculate new price
        if (selectedProduct) {
            try {
                const customizationsArray = Object.entries(newCustomizations).map(([type, value]) => ({
                    type,
                    value
                }));
                const result = await customerService.calculateCustomizedPrice(
                    selectedProduct.id.toString(),
                    customizationsArray
                );
                setCustomizedPrice(result.price);
            } catch (error) {
                console.error('Error calculating price:', error);
            }
        }
    };

    const handleAddCustomizedToCart = async () => {
        if (!selectedProduct) return;

        try {
            const customizationsArray = Object.entries(selectedCustomizations).map(([type, value]) => ({
                type,
                value
            }));

            await customerService.addToCart(
                selectedProduct.id.toString(),
                1,
                customizationsArray
            );

            setShowCustomizationModal(false);
            setSelectedProduct(null);
            setSelectedCustomizations({});
            setCustomizedPrice(null);
            incrementCartCount();
            setToast({
                open: true,
                type: 'success',
                message: 'Sản phẩm tùy chỉnh đã được thêm vào giỏ hàng!'
            });
        } catch (error) {
            console.error('Error adding customized product to cart:', error);
            setToast({
                open: true,
                type: 'error',
                message: 'Không thể thêm sản phẩm tùy chỉnh vào giỏ hàng. Vui lòng thử lại.'
            });
        }
    };

    const closeCustomizationModal = () => {
        setShowCustomizationModal(false);
        setSelectedProduct(null);
        setSelectedCustomizations({});
        setCustomizedPrice(null);
        setCustomizationOptions({});
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSortBy('newest');
        setPriceRange({ min: '', max: '' });
        setCurrentPage(1);
    };

    const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
        <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                        <Link to={`/products/${product.slug}`} className="hover:text-indigo-600 transition-colors">
                            {product.name}
                        </Link>
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>

                    <div className="mb-3">
                        <p className="text-lg font-medium text-gray-900">
                            {formatVND(product.price)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 mt-auto">
                    {product.isCustomizable ? (
                        <>
                            <button
                                onClick={() => handleCustomizeProduct(product)}
                                className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                            >
                                <Settings className="h-4 w-4 mr-1" />
                                Tùy chỉnh
                            </button>
                            <button
                                onClick={() => handleAddToCart(product.id.toString())}
                                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
                            >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Thêm nhanh
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => handleAddToCart(product.id.toString())}
                            className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                        >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Thêm vào giỏ hàng
                        </button>
                    )}
                    <button
                        onClick={() => handleAddToWishlist(product.id.toString())}
                        className={`p-2 transition-colors ${wishlistStatus[product.id.toString()]
                            ? 'text-red-500'
                            : 'text-gray-400 hover:text-red-500'
                            }`}
                    >
                        <Heart className={`h-5 w-5 ${wishlistStatus[product.id.toString()] ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );

    const ProductListItem: React.FC<{ product: Product }> = ({ product }) => (
        <div className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                    />
                ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <div className="h-8 w-8 text-gray-400">📦</div>
                    </div>
                )}
            </div>

            <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                    <Link to={`/products/${product.slug}`} className="hover:text-indigo-600 transition-colors">
                        {product.name}
                    </Link>
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            </div>

            <div className="ml-4 flex flex-col items-end justify-between">

                <p className="text-lg font-medium text-gray-900 mb-2">
                    {formatVND(product.price)}
                </p>
                <div className="flex items-center space-x-2">
                    {product.isCustomizable ? (
                        <>
                            <button
                                onClick={() => handleCustomizeProduct(product)}
                                className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                            >
                                <Settings className="h-4 w-4 mr-1" />
                                Tùy chỉnh
                            </button>
                            <button
                                onClick={() => handleAddToCart(product.id.toString())}
                                className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center"
                            >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Thêm nhanh
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => handleAddToCart(product.id.toString())}
                            className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                        >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Thêm vào giỏ hàng
                        </button>
                    )}
                    <button
                        onClick={() => handleAddToWishlist(product.id.toString())}
                        className={`p-2 transition-colors ${wishlistStatus[product.id.toString()]
                            ? 'text-red-500'
                            : 'text-gray-400 hover:text-red-500'
                            }`}
                    >
                        <Heart className={`h-5 w-5 ${wishlistStatus[product.id.toString()] ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
                    <p className="text-gray-600">
                        Tìm thấy {totalProducts} sản phẩm
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* View mode toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Bộ lọc
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Danh mục
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sắp xếp theo
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="newest">Mới nhất trước</option>
                                <option value="oldest">Cũ nhất trước</option>
                                <option value="price_low">Giá: Thấp đến cao</option>
                                <option value="price_high">Giá: Cao đến thấp</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Khoảng giá
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                    placeholder="Min"
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <input
                                    type="number"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                    placeholder="Max"
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            )}

            {/* Products Grid/List */}
            {loading ? (
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : products.length > 0 ? (
                <>
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch'
                        : 'space-y-4'
                    }>
                        {products.map((product) => (
                            viewMode === 'grid' ? (
                                <ProductCard key={product.id} product={product} />
                            ) : (
                                <ProductListItem key={product.id} product={product} />
                            )
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 border rounded-md text-sm font-medium ${currentPage === page
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                    <p className="text-gray-500 mb-6">
                        Hãy thử điều chỉnh tìm kiếm hoặc tiêu chí lọc.
                    </p>
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            )}

            {/* Customization Modal */}
            {showCustomizationModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Tùy chỉnh {selectedProduct.name}
                                </h3>
                                <button
                                    onClick={closeCustomizationModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Product Info */}
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    {selectedProduct.imageUrl ? (
                                        <img
                                            src={selectedProduct.imageUrl}
                                            alt={selectedProduct.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                            <div className="h-8 w-8 text-gray-400">📦</div>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                                        <p className="text-sm text-gray-500">Giá cơ bản: {formatVND(selectedProduct.price)}</p>
                                        {customizedPrice && (
                                            <p className="text-sm font-medium text-indigo-600">
                                                Giá tùy chỉnh: {formatVND(customizedPrice)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Customization Options */}
                                {loadingCustomizations ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : Object.keys(customizationOptions).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(customizationOptions).map(([optionType, options]) => (
                                            <div key={optionType} className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 capitalize">
                                                    {optionType.replace('_', ' ')}
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {options.map((option) => (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => handleCustomizationChange(option.optionType, option.optionValue)}
                                                            className={`p-3 text-left border rounded-lg transition-colors ${selectedCustomizations[option.optionType] === option.optionValue
                                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            <div className="font-medium">{option.optionValue}</div>
                                                            {Number(option.priceDelta) > 0 && (
                                                                <div className="text-sm text-green-600">
                                                                    +{formatVND(option.priceDelta)}
                                                                </div>
                                                            )}
                                                            {Number(option.priceDelta) < 0 && (
                                                                <div className="text-sm text-red-600">
                                                                    -{formatVND(Math.abs(Number(option.priceDelta)))}
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Không có tùy chọn tùy chỉnh cho sản phẩm này.
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={closeCustomizationModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleAddCustomizedToCart}
                                        disabled={Object.keys(selectedCustomizations).length === 0}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Thêm vào giỏ hàng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Message */}
            <ToastMessage
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
            />
        </div>
    );
};

export default ProductsPage; 