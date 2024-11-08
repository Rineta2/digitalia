"use client";
import { useState, useEffect } from "react";

import { db, storage } from "@/utils/firebase";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { useRouter, useSearchParams } from "next/navigation";

import toast from "react-hot-toast";

import Image from "next/image";

import { generateSlug } from "@/components/hooks/helpers";

import "@/components/styling/Admin.scss";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/hooks/content/index"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function ProductForm() {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    image: null,
    imageUrl: "",
    imagePreview: null,
    slug: "",
    content: null,
    category: "",
    types: [],
    tags: [],
    prices: {},
    previewUrl: "",
    stock: "",
    code: "",
    additionalImages: [],
    additionalImageUrls: [],
    additionalImagePreviews: [],
  });
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      fetchProduct();
    } else {
      generateNextProductCode();
    }
    fetchCategories();
  }, [id]);

  useEffect(() => {
    if (formData.category) {
      fetchTypes(formData.category);
      fetchTags(formData.category);
    }
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
      const categoryCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoryCollection);
      const categoryList = categorySnapshot.docs.map((doc) => doc.data().name);
      setCategories(categoryList);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTypes = async (category) => {
    try {
      const typeCollection = collection(db, "types");
      const typeSnapshot = await getDocs(typeCollection);
      const typeList = typeSnapshot.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
        .filter((type) => !category || type.category === category)
        .map((type) => type.name);
      setTypes(typeList);
    } catch (error) {
      console.error("Error fetching types:", error);
      toast.error("Failed to fetch types");
    }
  };

  const fetchTags = async (category) => {
    try {
      const tagsCollection = collection(db, "tags");
      const tagsSnapshot = await getDocs(tagsCollection);

      console.log(
        "All tags:",
        tagsSnapshot.docs.map((doc) => doc.data())
      );

      const tagsList = tagsSnapshot.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
        .filter((tag) => !category || tag.category === category)
        .map((tag) => tag.name);

      console.log("Filtered tags for category:", category, tagsList);

      setTags(tagsList);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to fetch tags");
    }
  };

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const prices = data.prices || {};
        const types = data.types || [];

        setFormData((prev) => ({
          ...prev,
          ...data,
          prices: prices,
          types: types,
          price: calculatePriceRange(prices),
        }));

        if (data.category) {
          await fetchTypes(data.category);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to fetch product");
    }
  };

  const calculatePriceRange = (prices) => {
    if (!prices || Object.keys(prices).length === 0) return "";

    const validPrices = Object.values(prices)
      .map((p) => Number(p))
      .filter((p) => !isNaN(p) && p > 0);

    if (validPrices.length === 0) return "";

    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);

    setFormData((prev) => ({
      ...prev,
      minPrice,
      maxPrice,
    }));

    if (validPrices.length > 1) {
      return `${formatNumber(minPrice)} - ${formatNumber(maxPrice)}`;
    } else {
      return `${formatNumber(minPrice)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (name === "title") {
        setFormData((prev) => ({
          ...prev,
          slug: generateSlug(value),
        }));
      }

      if (name === "category") {
        fetchTypes(value);
      }
    }
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files);
    const previewUrls = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ...files],
      additionalImagePreviews: [
        ...prev.additionalImagePreviews,
        ...previewUrls,
      ],
    }));
  };

  const handleRemoveAdditionalImage = async (index) => {
    try {
      if (formData.additionalImageUrls[index]) {
        try {
          const imageUrl = formData.additionalImageUrls[index];
          const pathFromUrl = decodeURIComponent(
            imageUrl.split("?")[0].split("/o/")[1]
          );
          const storageRef = ref(storage, pathFromUrl);
          await deleteObject(storageRef);
        } catch (storageError) {
          if (storageError.code !== "storage/object-not-found") {
            throw storageError;
          }
          console.warn(
            "Image not found in storage, continuing with removal from database"
          );
        }

        if (id) {
          try {
            const docRef = doc(db, "products", id);
            const updatedUrls = formData.additionalImageUrls.filter(
              (_, i) => i !== index
            );
            await updateDoc(docRef, {
              additionalImageUrls: updatedUrls,
            });
          } catch (firestoreError) {
            console.error("Error updating Firestore:", firestoreError);
            toast.error("Failed to update database");
            return;
          }
        }
      }

      if (formData.additionalImagePreviews[index]) {
        URL.revokeObjectURL(formData.additionalImagePreviews[index]);
      }

      setFormData((prev) => ({
        ...prev,
        additionalImages: prev.additionalImages.filter((_, i) => i !== index),
        additionalImagePreviews: prev.additionalImagePreviews.filter(
          (_, i) => i !== index
        ),
        additionalImageUrls: prev.additionalImageUrls.filter(
          (_, i) => i !== index
        ),
      }));

      const fileInput = document.querySelector(
        'input[name="additionalImages"]'
      );
      if (fileInput) {
        fileInput.value = "";
      }

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading(
      id ? "Updating product..." : "Adding product..."
    );

    try {
      let imageUrl = formData.imageUrl;
      let additionalImageUrls = [...formData.additionalImageUrls];

      if (formData.image) {
        const filename = `${Date.now()}-${formData.image.name}`;
        const storageRef = ref(storage, `products/${filename}`);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (formData.additionalImages.length > 0) {
        for (const image of formData.additionalImages) {
          const filename = `${Date.now()}-${image.name}`;
          const storageRef = ref(storage, `products/additional/${filename}`);
          await uploadBytes(storageRef, image);
          const url = await getDownloadURL(storageRef);
          additionalImageUrls.push(url);
        }
      }

      const calculatedPrice = calculatePriceRange(formData.prices);

      const productData = {
        code: formData.code,
        title: formData.title,
        price: calculatedPrice,
        imageUrl: imageUrl,
        slug: formData.slug,
        content: formData.content,
        category: formData.category,
        types: formData.types,
        tags: formData.tags,
        prices: formData.prices,
        previewUrl: formData.previewUrl,
        stock: Number(formData.stock),
        additionalImageUrls: additionalImageUrls,
        updatedAt: serverTimestamp(),
      };

      if (id) {
        await updateDoc(doc(db, "products", id), productData);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }

      toast.dismiss(loadingToast);
      toast.success(
        id ? "Product updated successfully!" : "Product added successfully!"
      );
      router.push("/admin/dashboard/news-product");
    } catch (error) {
      console.error("Error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  useEffect(() => {
    return () => {
      formData.additionalImagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, []);

  const handleTypeChange = (e) => {
    const type = e.target.value;
    const isChecked = e.target.checked;

    setFormData((prev) => {
      const newTypes = isChecked
        ? [...prev.types, type]
        : prev.types.filter((t) => t !== type);

      const newPrices = { ...prev.prices };
      if (isChecked) {
        newPrices[type] = "";
      } else {
        delete newPrices[type];
      }

      return {
        ...prev,
        types: newTypes,
        prices: newPrices,
        price: calculatePriceRange(newPrices),
      };
    });
  };

  const handlePriceChange = (type, e) => {
    const numericValue = e.target.value.replace(/[^\d]/g, "");

    setFormData((prev) => {
      const newPrices = {
        ...prev.prices,
        [type]: numericValue,
      };

      return {
        ...prev,
        prices: newPrices,
        price: calculatePriceRange(newPrices),
      };
    });
  };

  const formatNumber = (num) => {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleUrlChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      previewUrl: value,
    }));
  };

  const generateNextProductCode = async () => {
    try {
      const productsCollection = collection(db, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const productCodes = productsSnapshot.docs.map((doc) => doc.data().code);

      if (productCodes.length === 0) {
        return setFormData((prev) => ({ ...prev, code: "BRG001" }));
      }

      const usedNumbers = productCodes
        .map((code) => parseInt(code.replace("BRG", ""), 10))
        .sort((a, b) => a - b);

      let nextNumber = 1;
      for (const num of usedNumbers) {
        if (num !== nextNumber) {
          break;
        }
        nextNumber++;
      }

      const nextCode = `BRG${String(nextNumber).padStart(3, "0")}`;
      setFormData((prev) => ({ ...prev, code: nextCode }));
    } catch (error) {
      console.error("Error generating product code:", error);
      toast.error("Failed to generate product code");
    }
  };

  const handleTagChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      tags: [value],
    }));
  };

  const handleRemoveMainImage = async () => {
    try {
      if (formData.imageUrl) {
        try {
          const storageRef = ref(storage, formData.imageUrl);
          await deleteObject(storageRef);
        } catch (storageError) {
          if (storageError.code !== "storage/object-not-found") {
            throw storageError;
          }
          console.warn(
            "Main image not found in storage, continuing with removal from database"
          );
        }

        if (id) {
          try {
            const docRef = doc(db, "products", id);
            await updateDoc(docRef, {
              imageUrl: "",
            });
          } catch (firestoreError) {
            console.error("Error updating Firestore:", firestoreError);
            toast.error("Failed to update database");
            return;
          }
        }

        setFormData((prev) => ({
          ...prev,
          image: null,
          imageUrl: "",
          imagePreview: null,
        }));

        toast.success("Main image deleted successfully");
      }
    } catch (error) {
      console.error("Error removing main image:", error);
      toast.error("Failed to delete main image");
    }
  };

  return (
    <section className="form-product">
      <div className="form__container container">
        <form onSubmit={handleSubmit}>
          <div className="triple__box">
            <div className="box">
              <label>Product Code:</label>
              <input type="text" name="code" value={formData.code} readOnly />
            </div>

            <div className="box">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="box">
              <label>Slug:</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                readOnly
              />
            </div>
          </div>

          <div className="form__box">
            <div className="box">
              <label>Stock:</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Enter stock quantity"
                min="0"
              />
            </div>

            <div className="box">
              <label>Price:</label>
              <input
                type="text"
                name="price"
                value={formatNumber(formData.price)}
                onChange={handleChange}
                required
                readOnly
              />
            </div>
          </div>

          <div className="single__box">
            <label>Category:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="" disabled={formData.category !== ""}>
                Select a category
              </option>
              {categories.map((category, index) => (
                <option key={`${category}-${index}`} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="types__list">
            <label>Types:</label>
            {types.map((type) => (
              <div key={type} className="types__item">
                <input
                  type="checkbox"
                  id={type}
                  value={type}
                  checked={formData.types.includes(type)}
                  onChange={handleTypeChange}
                />

                <label htmlFor={type}>{type}</label>

                {formData.types.includes(type) && (
                  <input
                    type="text"
                    placeholder={`Price for ${type}`}
                    value={formData.prices[type] || ""}
                    onChange={(e) => handlePriceChange(type, e)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="single__box">
            <label>Tags:</label>
            <select
              name="tags"
              value={formData.tags[0] || ""}
              onChange={handleTagChange}
            >
              <option value="" disabled={formData.tags.length > 0}>
                Select a tag
              </option>
              {tags.map((tag, index) => (
                <option key={`${tag}-${index}`} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {formData.category === "Website" && (
            <div className="single__box">
              <label>Website URL:</label>
              <input
                type="url"
                name="previewUrl"
                value={formData.previewUrl}
                onChange={handleUrlChange}
                placeholder="Enter website URL"
              />
            </div>
          )}

          <div className="image__box">
            <label>Main Image:</label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
            <div className="mt-2">
              {(formData.imagePreview || formData.imageUrl) && (
                <div className="image-preview-item">
                  <Image
                    src={formData.imagePreview || formData.imageUrl}
                    alt="Preview"
                    width={200}
                    height={200}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveMainImage}
                    className="remove-image"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="image__box">
            <label>Additional Images:</label>
            <input
              type="file"
              name="additionalImages"
              onChange={handleAdditionalImages}
              accept="image/*"
              multiple
            />

            <div className="image__preview">
              {formData.additionalImagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <Image
                    src={preview}
                    alt={`Additional Preview ${index + 1}`}
                    width={200}
                    height={200}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalImage(index)}
                    className="remove-image"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.additionalImageUrls.map((url, index) => (
                <div key={`existing-${index}`} className="image-preview-item">
                  <Image
                    src={url}
                    alt={`Existing Additional ${index + 1}`}
                    width={200}
                    height={200}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveAdditionalImage(
                        index + formData.additionalImagePreviews.length
                      )
                    }
                    className="remove-image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="editor__box">
            <Editor
              value={formData.content}
              onChange={handleEditorChange}
              productId={id || "temp-" + Date.now()}
              placeholder="Write your content here..."
              style={{
                width: "100%",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "1rem 2%",
              }}
            />
          </div>

          {id ? (
            <button type="submit" disabled={loading} className="add">
              {loading ? "Updating..." : "Update Product"}
            </button>
          ) : (
            <button type="submit" disabled={loading} className="add">
              {loading ? "Adding..." : "Add Product"}
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
