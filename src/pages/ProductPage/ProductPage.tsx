import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductByKey } from "../../utils/api";
import { Product } from "@commercetools/platform-sdk";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "./ProductPage.css";

const ProductPage: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const mainSwiperRef = useRef<SwiperType | null>(null);
  const lightboxSwiperRef = useRef<SwiperType | null>(null);

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
        const firstImage = prod.masterData.current.masterVariant.images?.[0]?.url || null;
        setSelectedImage(firstImage);
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
  const images = product.masterData.current.masterVariant.images?.slice(0, 3) || [];
  const price = product.masterData.current.masterVariant.prices?.[0];
  const originalPrice = price?.value.centAmount ? price.value.centAmount / 100 : null;
  const discountedPrice = price?.discounted?.value.centAmount ? price.discounted.value.centAmount / 100 : null;
  const sku = product.masterData.current.masterVariant.sku || "No SKU";

  const handleThumbnailClick = (imgUrl: string, index: number) => {
    setSelectedImage(imgUrl);
    mainSwiperRef.current?.slideTo(index);
    lightboxSwiperRef.current?.slideTo(index);
  };

  const handleMainSlideChange = (swiper: SwiperCore) => {
    const newUrl = images[swiper.activeIndex]?.url;
    if (newUrl) {
      setSelectedImage(newUrl);
      lightboxSwiperRef.current?.slideTo(swiper.activeIndex);
    }
  };

  const handleLightboxSlideChange = (swiper: SwiperCore) => {
    const newUrl = images[swiper.activeIndex]?.url;
    if (newUrl) {
      setSelectedImage(newUrl);
      mainSwiperRef.current?.slideTo(swiper.activeIndex);
    }
  };

  return (
    <div className="product-page">
      <div className="product-container">
        <div className="product-images">
          <div className="product-thumbnails">
            {images.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={`${name} thumbnail ${index + 1}`}
                className={`product-thumbnail ${selectedImage === img.url ? "selected" : ""}`}
                onClick={() => handleThumbnailClick(img.url, index)}
              />
            ))}
          </div>

          <div className="product-main-slider">
            <Swiper
              navigation
              modules={[Navigation]}
              spaceBetween={10}
              slidesPerView={1}
              onSwiper={(swiper) => {
                mainSwiperRef.current = swiper;
              }}
              onSlideChange={handleMainSlideChange}
            >
              {images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img.url}
                    alt={`${name} image ${index + 1}`}
                    className="product-main-image"
                    onClick={() => setShowLightbox(true)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
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

      {showLightbox && (
        <div className="lightbox" onClick={() => setShowLightbox(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setShowLightbox(false)}>
              ×
            </button>
            <Swiper
              navigation
              modules={[Navigation]}
              spaceBetween={10}
              slidesPerView={1}
              initialSlide={images.findIndex((img) => img.url === selectedImage)}
              onSwiper={(swiper) => {
                lightboxSwiperRef.current = swiper;
              }}
              onSlideChange={handleLightboxSlideChange}
            >
              {images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img src={img.url} alt={`${name} enlarged ${index + 1}`} className="lightbox-image" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
