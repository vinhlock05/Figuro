import React from 'react';
import { Search } from 'lucide-react';

interface ProductSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ searchTerm, setSearchTerm }) => (
    <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);

export default ProductSearch;
