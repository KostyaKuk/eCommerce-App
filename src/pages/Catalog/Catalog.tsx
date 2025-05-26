import { useEffect, useState } from "react";
import { getProductsByCategory, getCategoryByLocalizedName } from "../../utils/api";

import "./Catalog.css";

type ProductAttribute = { name: string; value: unknown };

const Catalog = () => {
  const [products, setProducts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const category = await getCategoryByLocalizedName("Books", "en-GB");
        if (!category) {
          console.error("Category 'Books' not found");
          return;
        }

        const response = await getProductsByCategory(category.id);
        setProducts(response.results);

        response.results.forEach((product: unknown) => {
          const typedProduct = product as {
            name?: { "en-GB"?: string };
            masterVariant?: {
              prices?: Array<{ value: { centAmount: number }; discounted?: { value: { centAmount: number } } }>;
            };
          };
          const name = typedProduct.name?.["en-GB"];
          const price = typedProduct.masterVariant?.prices?.[0];
          if (price?.discounted) {
            const original = price.value.centAmount / 100;
            const discounted = price.discounted.value.centAmount / 100;
            console.log(`${name}: £${original} → £${discounted}`);
          } else {
            console.log(`${name}: £${price?.value.centAmount / 100}`);
          }
        });
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="loading">Loading books...</p>;
  if (!products.length) return <p className="loading">No books found.</p>;

  return (
    <div className="catalog-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Filters</h2>
        <p>Placeholder for sliders</p>
      </aside>
      <main className="catalog-main">
        <div className="search-bar">
          <input type="text" placeholder="Search products..." className="search-input" />
        </div>
        <div className="product-grid">
          {products.map((product: unknown) => {
            const typedProduct = product as {
              id: string;
              name?: { "en-GB"?: string };
              masterVariant?: {
                attributes?: ProductAttribute[];
                images?: Array<{ url: string }>;
                prices?: Array<{ value: { centAmount: number }; discounted?: { value: { centAmount: number } } }>;
              };
            };
            const name = typedProduct.name?.["en-GB"] || "No title";
            const attrs = typedProduct.masterVariant?.attributes || [];
            const descriptionAttr = attrs.find((a: ProductAttribute) => a.name === "description");
            const authorAttr = attrs.find((a: ProductAttribute) => a.name === "author");
            const genreAttr = attrs.find((a: ProductAttribute) => a.name === "genre");
            const description = descriptionAttr?.value || "No description";
            const author = authorAttr?.value || "Unknown Author";
            const genre = genreAttr?.value || "Unknown Genre";
            const image = typedProduct.masterVariant?.images?.[0]?.url;
            const price = typedProduct.masterVariant?.prices?.[0];
            const originalPrice = typeof price?.value.centAmount === "number" ? price.value.centAmount / 100 : "N/A";
            const discountedPrice =
              typeof price?.discounted?.value.centAmount === "number" ? price.discounted.value.centAmount / 100 : null;

            return (
              <div key={typedProduct.id} className="product-card">
                {image ? (
                  <img src={image} alt={name} className="product-image" />
                ) : (
                  <div className="product-image placeholder">No Image</div>
                )}
                <h2 className="product-name">{name}</h2>
                <p className="product-author">By {String(author)}</p>
                <p className="product-genre">{String(genre)}</p>
                <p className="product-description">{String(description)}</p>
                <p className="product-price">
                  {discountedPrice !== null ? (
                    <>
                      <span className="original-price">
                        £{typeof originalPrice === "number" ? originalPrice.toFixed(2) : originalPrice}
                      </span>
                      <span className="discounted-price">£{discountedPrice.toFixed(2)}</span>
                    </>
                  ) : (
                    `£${typeof originalPrice === "number" ? originalPrice.toFixed(2) : originalPrice}`
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Catalog;
