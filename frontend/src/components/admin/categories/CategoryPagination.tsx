import React from 'react';

interface CategoryPaginationProps {
    page: number;
    totalPages: number;
    setPage: (page: number) => void;
}

const CategoryPagination: React.FC<CategoryPaginationProps> = ({ page, totalPages, setPage }) => (
    <div className="flex justify-center items-center gap-2 mt-4 text-black">
        <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 text-black"
        >
            Prev
        </button>
        <span>
            Page {page} / {totalPages}
        </span>
        <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
        >
            Next
        </button>
    </div>
);

export default CategoryPagination; 