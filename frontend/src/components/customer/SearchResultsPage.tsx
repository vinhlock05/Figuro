import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import type { Product } from '../../services/customerService';
import ToastMessage, { type ToastType } from '../common/ToastMessage';
import { formatVND } from '../../utils/currency';
import {
    Search,
    Filter,
    Grid,
    List,
    ShoppingCart,
    Heart,
    X
} from 'lucide-react';

const SearchResultsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({});
    const [showFilters, setShowFilters] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; type: ToastType; message: string }>({
        open: false,
        type: 'success',
        message: ''
    });



    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);



    useEffect(() => {
        const loadSearchResults = async () => {
            try {
                setLoading(true);

                const params = {
                    page: currentPage,
                    limit: 12,
                    search: searchQuery,
                    sort: sortBy,
                    minPrice: priceRange.min,
                    maxPrice: priceRange.max,
                    categories: selectedCategories.join(','),
                };

                const result = await customerService.getProducts(params);
                setProducts(result.products);
                setTotalPages(result.totalPages);
                setTotalProducts(result.total);
            } catch (error) {
                console.error('Error loading search results:', error);
            } finally {
                setLoading(false);
            }
        };

        if (searchQuery.trim()) {
            loadSearchResults();
        }
    }, [currentPage, searchQuery, sortBy, priceRange, selectedCategories]);

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
        if (sortBy) params.set('sort', sortBy);
        if (priceRange.min) params.set('minPrice', priceRange.min);
        if (priceRange.max) params.set('maxPrice', priceRange.max);
        if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));

        setSearchParams(params);
    }, [searchQuery, sortBy, priceRange, selectedCategories, setSearchParams]);

    const handleAddToCart = async (productId: string) => {
        try {
            await customerService.addToCart(productId, 1);
            // TODO: Show success notification
        } catch (error) {
            console.error('Error adding to cart:', error);
            // TODO: Show error notification
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

    const clearFilters = () => {
        setSearchQuery('');
        setSortBy('relevance');
        setPriceRange({ min: '', max: '' });
        setSelectedCategories([]);
        setCurrentPage(1);
    };

    const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
        <Link to={`/products/${product.slug}`} className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow block">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <div className="h-12 w-12 text-gray-400">📦</div>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>

                <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-gray-900">
                        {formatVND(parseFloat(product.price))}
                    </p>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToWishlist(product.id.toString());
                        }}
                        className={`p-2 transition-colors ${wishlistStatus[product.id.toString()]
                            ? 'text-red-500'
                            : 'text-gray-400 hover:text-red-500'
                            }`}
                    >
                        <Heart className={`h-5 w-5 ${wishlistStatus[product.id.toString()] ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>
        </Link>
    );

    const ProductListItem: React.FC<{ product: Product }> = ({ product }) => (
        <Link to={`/products/${product.slug}`} className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 block">
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
                <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            </div>

            <div className="ml-4 flex flex-col items-end justify-between">
                <p className="text-lg font-medium text-gray-900 mb-2">
                    {formatVND(parseFloat(product.price))}
                </p>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToWishlist(product.id.toString());
                    }}
                    className={`p-2 transition-colors ${wishlistStatus[product.id.toString()]
                        ? 'text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                        }`}
                >
                    <Heart className={`h-5 w-5 ${wishlistStatus[product.id.toString()] ? 'fill-current' : ''}`} />
                </button>
            </div>
        </Link>
    );

    if (!searchQuery.trim()) {
        return (
            <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có từ khóa tìm kiếm</h3>
                <p className="text-gray-500">
                    Vui lòng nhập từ khóa để tìm sản phẩm.
                </p>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-gray-900">Kết quả tìm kiếm</h1>
                    <p className="text-gray-600">
                        {totalProducts} kết quả cho "{searchQuery}"
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

            {/* Active Filters */}
            {(sortBy !== 'relevance' || priceRange.min || priceRange.max || selectedCategories.length > 0) && (
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Bộ lọc đang hoạt động:</span>
                            {sortBy !== 'relevance' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                                    Sắp xếp: {sortBy}
                                    <button
                                        onClick={() => setSortBy('relevance')}
                                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {priceRange.min && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                                    Tối thiểu: {formatVND(parseFloat(priceRange.min))}
                                    <button
                                        onClick={() => setPriceRange(prev => ({ ...prev, min: '' }))}
                                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {priceRange.max && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                                    Tối đa: {formatVND(parseFloat(priceRange.max))}
                                    <button
                                        onClick={() => setPriceRange(prev => ({ ...prev, max: '' }))}
                                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <option value="relevance">Liên quan</option>
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
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
                                    placeholder="Tối thiểu"
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <input
                                    type="number"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                    placeholder="Tối đa"
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Danh mục
                            </label>
                            <select
                                multiple
                                value={selectedCategories}
                                onChange={(e) => {
                                    const values = Array.from(e.target.selectedOptions, option => option.value);
                                    setSelectedCategories(values);
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="electronics">Điện tử</option>
                                <option value="clothing">Quần áo</option>
                                <option value="books">Sách</option>
                                <option value="home">Nhà cửa & Vườn</option>
                                <option value="sports">Thể thao</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Results */}
            {loading ? (
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : products.length > 0 ? (
                <>
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
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
                                Tiếp
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                    <p className="text-gray-500 mb-6">
                        Thử điều chỉnh tiêu chí tìm kiếm hoặc duyệt sản phẩm của chúng tôi.
                    </p>
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Xóa bộ lọc
                    </button>
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

export default SearchResultsPage; 