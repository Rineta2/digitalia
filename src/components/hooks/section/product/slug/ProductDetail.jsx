"use client";

import ProductImageSwiper from "@/components/hooks/section/product/slug/ProductImageSwiper";
import ProductRating from "@/components/hooks/section/product/slug/ProductRating";
import ProductActions from "@/components/hooks/section/product/slug/ProductActions";
import ProductReviews from "@/components/hooks/section/product/slug/ProductReviews";
import ProductFeatures from "@/components/hooks/section/product/slug/ProductFeatures";
import AuthModal from "@/components/ui/layout/auth/AuthModal";
import Checkout from "@/components/hooks/section/checkout/Checkout";

import { useProduct } from "@/components/hooks/section/product/slug/utils/useProduct";
import { usePayment } from "@/components/hooks/section/product/slug/utils/usePayment";

export default function ProductDetail({ slug }) {
  const {
    product,
    loading,
    selectedPrice,
    types,
    ratings,
    averageRating,
    viewCount,
    handleTypeChange,
    formatPrice,
    getCurrentType,
  } = useProduct(slug);

  const {
    showCheckout,
    showLoginPopup,
    activeTab,
    isAddingToCart,
    handleAddToCart,
    handleBuyNow,
    handlePayment,
    handleLoginClose,
    handleTabChange,
    setShowCheckout,
  } = usePayment(product, selectedPrice);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;
  if (showCheckout) {
    return (
      <Checkout
        product={product}
        selectedPrice={selectedPrice}
        onPayment={handlePayment}
        onCancel={() => setShowCheckout(false)}
        selectedType={getCurrentType()}
      />
    );
  }

  return (
    <div className="content">
      <div className="side">
        <div className="image">
          <ProductImageSwiper images={product.additionalImageUrls} />
        </div>
        <div className="product__details">
          <h1>{product.title}</h1>

          <ProductRating
            averageRating={averageRating}
            ratingsCount={ratings.length}
            viewCount={viewCount}
          />

          <div className="stock">
            <label htmlFor="stock">Stock :</label>
            <span id="stock">{product.stock}</span>
          </div>

          {selectedPrice && (
            <div className="price">
              <label htmlFor="price">Price :</label>
              <span id="price">{formatPrice(selectedPrice)}</span>
            </div>
          )}

          <ProductActions
            types={types}
            selectedPrice={selectedPrice}
            product={product}
            onTypeChange={handleTypeChange}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isAddingToCart={isAddingToCart}
          />

          <ProductFeatures />
        </div>
      </div>

      <div className="description">
        <div
          className="product-content"
          dangerouslySetInnerHTML={{ __html: product.content }}
        />
      </div>

      <ProductReviews ratings={ratings} />

      {showLoginPopup && (
        <AuthModal
          isOpen={showLoginPopup}
          onClose={handleLoginClose}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}
