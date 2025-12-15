"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";

export interface FilterState {
  search: string;
  categories: string[];
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

const CATEGORIES = ["Clothing", "Shoes", "Accessories", "Electronics"];

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" }
];

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categories: [],
    minPrice: "",
    maxPrice: "",
    sortBy: "price_asc",
  });

  const priceDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const notifyFilterChange = useCallback(
    (newFilters: FilterState) => {
      onFilterChange(newFilters);
    },
    [onFilterChange]
  );

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      notifyFilterChange(newFilters);
    }, 300);
  };

  // Handle category toggle
  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    notifyFilterChange(newFilters);
  };

  // Handle price change with debounce
  const handlePriceChange = (value: string) => {
    const newFilters = { ...filters, maxPrice: value };
    setFilters(newFilters);

    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }

    priceDebounceRef.current = setTimeout(() => {
      notifyFilterChange(newFilters);
    }, 500);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sortBy: value };
    setFilters(newFilters);
    notifyFilterChange(newFilters);
  };

  // Cleanup debounce timers
  useEffect(() => {
    return () => {
      if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const sliderValue = Number(filters.maxPrice) || 10000;
  const sliderPercent = (sliderValue / 10000) * 100;

  return (
    <div className="filters">
      {/* Search */}
      <div className="filters__search">
        <FiSearch className="filters__search-icon" />
        <input
          type="text"
          placeholder="Search"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="filters__search-input"
        />
      </div>

      {/* Category */}
      <div className="filters__section">
        <h4 className="filters__section-title">Category</h4>
        <div className="filters__categories">
          {CATEGORIES.map((category) => (
            <label key={category} className="filters__checkbox">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
              <span className="filters__checkbox-label">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filters__section">
        <h4 className="filters__section-title">Price Range</h4>
        <div className="filters__price-slider">
          <div className="filters__price-slider-row">
            <span className="filters__price-slider-label">0</span>
            <span className="filters__price-slider-label">max</span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={sliderValue}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="filters__price-slider-input"
            style={
              {
                "--slider-percent": `${sliderPercent}%`,
              } as React.CSSProperties
            }
          />
        </div>
      </div>

      {/* Sort by */}
      <div className="filters__section">
        <h4 className="filters__section-title">Sort by</h4>
        <div className="filters__sort">
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="filters__sort-select"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
