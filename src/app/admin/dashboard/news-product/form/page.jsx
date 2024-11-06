"use client";
import { useState, useEffect } from "react";

import { db, storage } from "@/utils/firebase";

import { collection, addDoc, doc, getDoc, updateDoc, getDocs, serverTimestamp } from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { useRouter, useSearchParams } from "next/navigation";

import toast from "react-hot-toast";

import Image from "next/image";

import { generateSlug } from "@/components/hooks/helpers";

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/hooks/content/index'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

import "@/components/styling/Admin.scss";

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
    code: ""
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
      if (formData.category === "Website") {
        fetchTags();
      }
    }
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
      const categoryCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoryCollection);
      const categoryList = categorySnapshot.docs.map(doc => doc.data().name);
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
        .map(doc => ({
          ...doc.data(),
          id: doc.id
        }))
        .filter(type => !category || type.category === category)
        .map(type => type.name);
      setTypes(typeList);
    } catch (error) {
      console.error("Error fetching types:", error);
      toast.error("Failed to fetch types");
    }
  };

  const fetchTags = async () => {
    try {
      const tagsCollection = collection(db, "tags");
      const tagsSnapshot = await getDocs(tagsCollection);
      const tagsList = tagsSnapshot.docs.map(doc => doc.data().name);
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

        setFormData(prev => ({
          ...prev,
          ...data,
          prices: prices,
          types: types,
          price: calculatePriceRange(prices)
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
    if (!prices || Object.keys(prices).length === 0) return '';

    const validPrices = Object.values(prices)
      .map(p => Number(p))
      .filter(p => !isNaN(p) && p > 0);

    if (validPrices.length === 0) return '';

    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);

    setFormData(prev => ({
      ...prev,
      minPrice,
      maxPrice
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
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (name === 'title') {
        setFormData(prev => ({
          ...prev,
          slug: generateSlug(value)
        }));
      }

      if (name === 'category') {
        fetchTypes(value);
      }
    }
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading(id ? 'Updating product...' : 'Adding product...');

    try {
      let imageUrl = formData.imageUrl;

      if (formData.image) {
        const filename = `${Date.now()}-${formData.image.name}`;
        const storageRef = ref(storage, `products/${filename}`);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
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
        updatedAt: serverTimestamp()
      };

      if (id) {
        await updateDoc(doc(db, "products", id), productData);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp()
        });
      }

      toast.dismiss(loadingToast);
      toast.success(id ? 'Product updated successfully!' : 'Product added successfully!');
      router.push('/admin/dashboard/news-product');
    } catch (error) {
      console.error("Error:", error);
      toast.dismiss(loadingToast);
      toast.error('Failed to save product');
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

  const handleTypeChange = (e) => {
    const type = e.target.value;
    const isChecked = e.target.checked;

    setFormData(prev => {
      const newTypes = isChecked
        ? [...prev.types, type]
        : prev.types.filter(t => t !== type);

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
        price: calculatePriceRange(newPrices)
      };
    });
  };

  const handlePriceChange = (type, e) => {
    const numericValue = e.target.value.replace(/[^\d]/g, '');

    setFormData(prev => {
      const newPrices = {
        ...prev.prices,
        [type]: numericValue
      };

      return {
        ...prev,
        prices: newPrices,
        price: calculatePriceRange(newPrices)
      };
    });
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleUrlChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      previewUrl: value
    }));
  };

  const generateNextProductCode = async () => {
    try {
      const productsCollection = collection(db, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const productCodes = productsSnapshot.docs.map(doc => doc.data().code);

      const maxCode = productCodes.reduce((max, code) => {
        const num = parseInt(code.replace(/\D/g, ''), 10);
        return num > max ? num : max;
      }, 0);

      const nextCode = `BRG${String(maxCode + 1).padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, code: nextCode }));
    } catch (error) {
      console.error("Error generating product code:", error);
      toast.error("Failed to generate product code");
    }
  };

  const handleTagChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      tags: [value]
    }));
  };

  return (
    <section className="form-product">
      <div className="form__container container">
        <form onSubmit={handleSubmit}>
          <div className="triple__box">
            <div className="box">
              <label>Product Code:</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                readOnly
              />
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
              <label>
                Stock:
              </label>
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
            {types.map(type => (
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

          {formData.category === "Website" && (
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
          )}

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
            <label>Image:</label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
            <div className="mt-2">
              {formData.imagePreview ? (
                <Image
                  src={formData.imagePreview}
                  alt="Preview"
                  width={200}
                  height={200}
                />
              ) : formData.imageUrl ? (
                <Image
                  src={formData.imageUrl}
                  alt="Current image"
                  width={200}
                  height={200}
                />
              ) : null}
            </div>
          </div>

          <div className="editor__box">
            <Editor
              value={formData.content}
              onChange={handleEditorChange}
              productId={id || 'temp-' + Date.now()}
              placeholder="Write your content here..."
              style={{
                width: "100%",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "1rem 2%"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading} className="add">
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </section>
  );
}
