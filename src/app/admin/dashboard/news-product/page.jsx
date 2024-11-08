"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db, storage } from "@/utils/firebase";
import { useAuth } from "@/utils/auth/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteObject, ref } from "firebase/storage";
import toast from "react-hot-toast";
import Image from "next/image";
import "@/components/styling/Admin.scss";
import ReactPaginate from 'react-paginate';

export default function NewsProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = querySnapshot.docs.map((doc) => doc.data().name);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/dashboard/news-product/form?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = docSnap.data();
          
          // Hapus gambar utama
          if (productData.imageUrl) {
            try {
              const mainImagePath = decodeURIComponent(productData.imageUrl.split('?')[0].split('/o/')[1]);
              const mainImageRef = ref(storage, mainImagePath);
              await deleteObject(mainImageRef);
            } catch (storageError) {
              if (storageError.code !== 'storage/object-not-found') {
                console.error("Error deleting main image:", storageError);
              }
            }
          }
          
          // Hapus gambar tambahan
          if (productData.additionalImageUrls && productData.additionalImageUrls.length > 0) {
            for (const imageUrl of productData.additionalImageUrls) {
              try {
                const imagePath = decodeURIComponent(imageUrl.split('?')[0].split('/o/')[1]);
                const imageRef = ref(storage, imagePath);
                await deleteObject(imageRef);
              } catch (storageError) {
                if (storageError.code !== 'storage/object-not-found') {
                  console.error("Error deleting additional image:", storageError);
                }
              }
            }
          }
          
          // Hapus dokumen dari Firestore
          await deleteDoc(docRef);
          
          toast.success("Product deleted successfully");
          fetchProducts();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const formatNumberToIDR = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const formatPriceRange = (prices) => {
    if (!prices || typeof prices !== 'object') {
      return 'Price not set';
    }

    const priceValues = Object.values(prices)
      .map(price => Number(price))
      .filter(price => !isNaN(price) && price > 0);

    if (priceValues.length === 0) {
      return 'Price not set';
    }

    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);

    if (minPrice === maxPrice) {
      return formatNumberToIDR(minPrice);
    }
    return `${formatNumberToIDR(minPrice)} - ${formatNumberToIDR(maxPrice)}`;
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login to access this page</div>;

  const filteredProducts = products.filter(product =>
    (product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === "" || product.category === selectedCategory)
  );

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected + 1);
  };

  return (
    <section className="product">
      <div className="product__container container">
        <div className="product__content">
          <h2>Products List</h2>

          <Link href="/admin/dashboard/news-product/form">
            Create Product
          </Link>
        </div>

        <div className="tollbar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <table className="product-table">
          <thead className="product-table__head">
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Image</th>
              <th>Price Range</th>
              <th>Category</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="product-table__body" style={{ marginTop: '2rem' }}>
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <span>{product.code}</span>
                </td>

                <td>
                  <h2 className="product-title">{product.title}</h2>
                </td>

                <td>
                  <div className="image-container">
                    <Image
                      src={product.imageUrl || '/placeholder-image.jpg'}
                      alt={product.title}
                      className="product-image"
                      width={100}
                      height={100}
                    />
                  </div>
                </td>

                <td>{formatPriceRange(product.prices)}</td>
                <td>{product.category}</td>
                <td>{product.createdAt?.toDate().toLocaleDateString()}</td>

                <td>
                  <button className="edit-button" onClick={() => handleEdit(product.id)}>Edit</button>
                  <button className="delete-button" onClick={() => handleDelete(product.id)} disabled={deleteLoading === product.id}>
                    {deleteLoading === product.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span>Page {currentPage} of {totalPages}</span>

          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            pageCount={totalPages}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
          />
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div>
            No products found. Create your first product!
          </div>
        )}
      </div>
    </section>
  );
}
