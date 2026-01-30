'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({
    onSearch,
    placeholder = 'Buscar...'
}: {
    onSearch: (query: string) => void;
    placeholder?: string;
}) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300); // Debounce de 300ms

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
}
