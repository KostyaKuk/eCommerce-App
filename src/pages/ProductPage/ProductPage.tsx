import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductByKey } from "../../utils/api";
import { Product } from "@commercetools/platform-sdk";
import "./ProductPage.css";

const ProductPage: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!key) {
        setError("No product key provided");
        setLoading(false);
        return;
      }

      try {
        const prod = await getProductByKey(key);
        setProduct(prod);
        setSelectedImage(prod.masterData.current.masterVariant.images?.[0]?.url || null);
        console.log("Product data:", prod);
        setLoading(false);
      } catch {
        setError("Failed to fetch product. Please try again later.");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [key]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return null;

  const name = product.masterData.current.name["en-GB"] || "No title";
  const attrs = product.masterData.current.masterVariant.attributes || [];
  const description = String(attrs.find((attr) => attr.name === "description")?.value || "No description available");
  const author = String(attrs.find((attr) => attr.name === "author")?.value || "Unknown author");
  const genre = String(attrs.find((attr) => attr.name === "genre")?.value || "No genre");
  const cover = String(attrs.find((attr) => attr.name === "Cover")?.value || "No cover");
  const age = String(attrs.find((attr) => attr.name === "age")?.value || "No age");
  const images = product.masterData.current.masterVariant.images || [];
  const price = product.masterData.current.masterVariant.prices?.[0];
  const originalPrice = price?.value.centAmount ? price.value.centAmount / 100 : null;
  const discountedPrice = price?.discounted?.value.centAmount ? price.discounted.value.centAmount / 100 : null;
  const sku = product.masterData.current.masterVariant.sku || "No SKU";

  return (
    <div className="product-page">
      <div className="product-container">
        <div className="product-images">
          {selectedImage ? (
            <img src={selectedImage} alt={name} className="product-main-image" />
          ) : (
            <div className="product-main-image placeholder">No Image</div>
          )}
          {images.length > 1 && (
            <div className="product-thumbnails">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`${name} thumbnail ${index + 1}`}
                  className={`product-thumbnail ${selectedImage === img.url ? "selected" : ""}`}
                  onClick={() => setSelectedImage(img.url)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="product-details">
          <h1 className="product-name">{name}</h1>
          <p className="product-author">By {author}</p>
          <p className="product-description">{description}</p>
          <div className="product-attributes">
            <p className="product-detail">Genre: {genre}</p>
            <p className="product-detail">Cover: {cover}</p>
            <p className="product-detail">Age: {age}</p>
            <p className="product-detail">SKU: {sku}</p>
          </div>
          <p className="product-price">
            {originalPrice !== null ? (
              discountedPrice !== null ? (
                <>
                  <span className="original-price">£{originalPrice.toFixed(2)}</span>
                  <span className="discounted-price">£{discountedPrice.toFixed(2)}</span>
                </>
              ) : (
                `£${originalPrice.toFixed(2)}`
              )
            ) : (
              "Price unavailable"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
