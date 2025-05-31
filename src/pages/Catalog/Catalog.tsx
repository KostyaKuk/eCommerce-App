import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsByCategory, getCategoryByLocalizedName } from "../../utils/api";
import Slider from "@mui/material/Slider";

import "./Catalog.css";

interface ProductAttribute {
  name: string;
  value: string | number | boolean;
}

interface ProductPrice {
  value: { centAmount: number; currencyCode: string };
  discounted?: { value: { centAmount: number } };
}

interface ProductVariant {
  attributes?: ProductAttribute[];
  images?: Array<{ url: string }>;
  prices?: ProductPrice[];
}

interface Product {
  id: string;
  name?: { "en-GB"?: string };
  masterVariant?: ProductVariant;
}

const ProductList: React.FC<{ products: Product[]; loading: boolean }> = React.memo(({ products, loading }) => {
  if (loading) return <p className="loading">Loading books...</p>;
  if (!products.length) return <p className="loading">No books found.</p>;

  return (
    <div className="product-grid">
      {products.map((product) => {
        const name = product.name?.["en-GB"] || "No title";
        const attrs = product.masterVariant?.attributes || [];
        const description = String(attrs.find((a) => a.name === "description")?.value || "No description");
        const author = String(attrs.find((a) => a.name === "author")?.value || "Unknown Author");
        const genre = String(attrs.find((a) => a.name === "genre")?.value || "No genre");
        const image = product.masterVariant?.images?.[0]?.url;
        const price = product.masterVariant?.prices?.[0];
        const originalPrice = price?.value.centAmount ? price.value.centAmount / 100 : null;
        const discountedPrice = price?.discounted?.value.centAmount ? price.discounted.value.centAmount / 100 : null;

        return (
          <div key={product.id} className="product-card">
            {image ? (
              <img src={image} alt={name} className="product-image" />
            ) : (
              <div className="product-image placeholder">No Image</div>
            )}
            <h2 className="product-name">{name}</h2>
            <p className="product-author">By {author}</p>
            <p className="product-description">{description}</p>
            <p className="product-genre">Genre: {genre}</p>
            <p className="product-price">
              {originalPrice !== null ? (
                discountedPrice !== null ? (
                  <>
                    <span className="original-price">£{(originalPrice * 0.8).toFixed(2)}</span>
                    <span className="discounted-price">£{(discountedPrice * 0.8).toFixed(2)}</span>
                  </>
                ) : (
                  `£${(originalPrice * 0.8).toFixed(2)}`
                )
              ) : (
                "Price unavailable"
              )}
            </p>
            <Link to={`/products/`} className="view-details-button">
              View Details
            </Link>
          </div>
        );
      })}
    </div>
  );
});

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [attributes, setAttributes] = useState<Record<string, string[]>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceLimits, setPriceLimits] = useState<[number, number]>([0, 0]);
  const [sortOrder, setSortOrder] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const category = await getCategoryByLocalizedName("Books", "en-GB");
        if (!category) return;

        const response = await getProductsByCategory(category.id);
        const results: Product[] = response.results;

        setProducts(results);

        const attrMap: Record<string, Set<string>> = {};
        let minPrice = Infinity;
        let maxPrice = -Infinity;

        results.forEach((product) => {
          const attrs = product.masterVariant?.attributes || [];
          attrs.forEach((attr) => {
            if (attr.name !== "description" && attr.value) {
              if (!attrMap[attr.name]) attrMap[attr.name] = new Set();
              attrMap[attr.name].add(String(attr.value));
            }
          });

          const price = product.masterVariant?.prices?.[0]?.value?.centAmount;
          if (typeof price === "number" && price > 0) {
            const pricePounds = (price / 100) * 0.8;
            minPrice = Math.min(minPrice, pricePounds);
            maxPrice = Math.max(maxPrice, pricePounds);
          }
        });

        const sortedAttrMap: Record<string, string[]> = {};
        Object.keys(attrMap).forEach((name) => {
          sortedAttrMap[name] = [...attrMap[name]].sort();
        });

        const finalMinPrice = Number.isFinite(minPrice) ? Math.floor(minPrice) : 0;
        const finalMaxPrice = Number.isFinite(maxPrice) ? Math.ceil(maxPrice) : 100;
        setAttributes(sortedAttrMap);
        setPriceLimits([finalMinPrice, finalMaxPrice]);
        setPriceRange([finalMinPrice, finalMaxPrice]);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const applyFilters = async () => {
    setLoading(true);

    try {
      const category = await getCategoryByLocalizedName("Books", "en-GB");
      if (!category) return;

      const filterArgs: string[] = [`categories.id:"${category.id}"`];

      Object.entries(selectedFilters).forEach(([attrName, value]) => {
        if (value) {
          filterArgs.push(`variants.attributes.${attrName}:"${value}"`);
        }
      });

      const [minPrice, maxPrice] = priceRange;
      const minCent = Math.round((minPrice / 0.8) * 100);
      const maxCent = Math.round((maxPrice / 0.8) * 100);
      filterArgs.push(`variants.price.centAmount:range(${minCent} to ${maxCent})`);

      const sortMap: Record<string, string> = {
        "price-asc": "price asc",
        "price-desc": "price desc",
        "title-asc": "name.en-GB asc",
        "title-desc": "name.en-GB desc",
      };

      const sortQuery = sortMap[sortOrder] || undefined;

      const response = await getProductsByCategory(category.id, filterArgs, sortQuery);
      const results = response.results;

      if (sortOrder === "author-asc" || sortOrder === "author-desc") {
        results.sort((a, b) => {
          const aAuthor = (a.masterVariant?.attributes?.find((attr) => attr.name === "author")?.value as string) || "";
          const bAuthor = (b.masterVariant?.attributes?.find((attr) => attr.name === "author")?.value as string) || "";
          return sortOrder === "author-asc" ? aAuthor.localeCompare(bAuthor) : bAuthor.localeCompare(aAuthor);
        });
      }

      setProducts(results);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [selectedFilters, priceRange, sortOrder]);

  const handleFilterChange = (attrName: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [attrName]: value,
    }));
  };

  const handlePriceChange = (_: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const resetFilters = () => {
    setSelectedFilters({});
    setPriceRange(priceLimits);
    setSortOrder("");
    setSearchQuery("");
  };

  const filterBySearch = (products: Product[]) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return products;

    return products.filter((product) => {
      const name = product.name?.["en-GB"]?.toLowerCase() || "";
      const author =
        product.masterVariant?.attributes
          ?.find((attr) => attr.name === "author")
          ?.value?.toString()
          .toLowerCase() || "";
      return name.includes(query) || author.includes(query);
    });
  };

  return (
    <div className="catalog-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Filters</h2>
        {Object.entries(attributes).map(([attrName, values]) => (
          <div key={attrName} className="filter-group">
            <label htmlFor={`${attrName}-filter`} className="filter-label">
              {attrName.charAt(0).toUpperCase() + attrName.slice(1)}
            </label>
            <select
              id={`${attrName}-filter`}
              value={selectedFilters[attrName] || ""}
              onChange={(e) => handleFilterChange(attrName, e.target.value)}
              className="filter-select"
            >
              <option value="">All {attrName}</option>
              {values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="filter-group">
          <label className="filter-label">Price Range (£) (Excluding discounts)</label>
          <div className="price-range">
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `£${value}`}
              min={priceLimits[0]}
              max={priceLimits[1]}
              step={1}
              className="price-slider"
            />
            <div className="price-values">
              <span>£{priceRange[0]}</span>
              <span>£{priceRange[1]}</span>
            </div>
          </div>
        </div>
        {(Object.values(selectedFilters).some((value) => value) ||
          priceRange[0] !== priceLimits[0] ||
          priceRange[1] !== priceLimits[1] ||
          sortOrder ||
          searchQuery) && (
          <button onClick={resetFilters} className="reset-button">
            Reset Filters
          </button>
        )}
      </aside>
      <main className="catalog-main">
        <div className="catalog-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sort-select">
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="filter-select">
              <option value="">Sort by...</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Title: A → Z</option>
              <option value="title-desc">Title: Z → A</option>
              <option value="author-asc">Author: A → Z</option>
              <option value="author-desc">Author: Z → A</option>
            </select>
          </div>
        </div>
        <ProductList products={filterBySearch(products)} loading={loading} />
      </main>
    </div>
  );
};

export default Catalog;
