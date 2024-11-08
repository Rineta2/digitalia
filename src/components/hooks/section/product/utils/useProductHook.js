import { useState, useEffect } from "react";

export const useProductSelection = (selectedProduct) => {
  const [selectedType, setSelectedType] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    if (selectedProduct) {
      const defaultType = selectedProduct.types?.[0]?.name || "";
      setSelectedType(defaultType);

      const initialPrice =
        selectedProduct.types?.[0]?.price || selectedProduct.price || 0;
      setCurrentPrice(initialPrice);
    } else {
      setSelectedType("");
      setCurrentPrice(0);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct && selectedType) {
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);
};
