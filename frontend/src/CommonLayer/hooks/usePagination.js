import { useState, useMemo } from 'react';

/**
 * Client-side pagination hook.
 *
 * @param {Array}  data      - full dataset to paginate
 * @param {number} [pageSize=10] - items per page
 *
 * @returns {{
 *   paginatedData: Array,
 *   currentPage: number,
 *   totalPages: number,
 *   totalItems: number,
 *   goToPage: (page: number) => void,
 *   nextPage: () => void,
 *   prevPage: () => void,
 *   hasNext: boolean,
 *   hasPrev: boolean,
 * }}
 *
 * Usage
 * ─────
 * const { paginatedData, currentPage, totalPages, nextPage, prevPage } =
 *   usePagination(products, 20);
 */
export const usePagination = (data = [], pageSize = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Clamp current page if data shrinks
    const safePage = Math.min(currentPage, totalPages);

    const paginatedData = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, safePage, pageSize]);

    const goToPage = (page) => {
        const clamped = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(clamped);
    };

    const nextPage = () => goToPage(safePage + 1);
    const prevPage = () => goToPage(safePage - 1);

    return {
        paginatedData,
        currentPage: safePage,
        totalPages,
        totalItems,
        goToPage,
        nextPage,
        prevPage,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
    };
};
