import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteProduct } from "@/components/hooks/admin/product/NewsProduct/utils/productServices";
import { formatPriceRange } from "@/components/hooks/admin/product/NewsProduct/utils/formatters";
import toast from "react-hot-toast";

export default function ProductTable({ products, onProductsChange }) {
  const [deleteLoading, setDeleteLoading] = useState(null);
  const router = useRouter();

  const handleEdit = (id) => {
    router.push(`/admin/dashboard/news-product/form?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    setDeleteLoading(id);
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      onProductsChange();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
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
      <tbody className="product-table__body">
        {products.map((product) => (
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
                  src={product.imageUrl || "/placeholder-image.jpg"}
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
              <button
                className="edit-button"
                onClick={() => handleEdit(product.id)}
              >
                Edit
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(product.id)}
                disabled={deleteLoading === product.id}
              >
                {deleteLoading === product.id ? "Deleting..." : "Delete"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
