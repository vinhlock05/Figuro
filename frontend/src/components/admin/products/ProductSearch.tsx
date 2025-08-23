import React from 'react';
import { Search } from 'lucide-react';

interface ProductSearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ searchTerm, setSearchTerm }) => (
    <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
        <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-background text-black placeholder-black focus:outline-none focus:placeholder-black focus:ring-2 focus:ring-ring focus:border-ring sm:text-sm"
        />
    </div>
);

export default ProductSearch;
