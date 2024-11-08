import { useState, useEffect } from "react";

export const useProductSelection = (selectedProduct) => {
  const [selectedType, setSelectedType] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    if (selectedProduct) {
      // Set default type and price when product is selected
      const defaultType = selectedProduct.types?.[0]?.name || "";
      setSelectedType(defaultType);

      // Set initial price
      const initialPrice =
        selectedProduct.types?.[0]?.price || selectedProduct.price || 0;
      setCurrentPrice(initialPrice);
    } else {
      // Reset when no product is selected
      setSelectedType("");
      setCurrentPrice(0);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct && selectedType) {
      // Update price when type changes
      const selectedTypeData = selectedProduct.types?.find(
        (type) => type.name === selectedType
      );
      const newPrice = selectedTypeData?.price || selectedProduct.price || 0;
      setCurrentPrice(newPrice);
    }
  }, [selectedType, selectedProduct]);

  return { selectedType, setSelectedType, currentPrice };
};

export const useModalEffect = (isModalOpen) => {
  useEffect(() => {
    if (isModalOpen) {
      // Prevent background scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore scrolling when modal is closed
      document.body.style.overflow = "unset";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);
};
