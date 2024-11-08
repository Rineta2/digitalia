import Link from "next/link";

export default function ProductHeader() {
  return (
    <div className="product__content">
      <h2>Products List</h2>
      <Link href="/admin/dashboard/news-product/form">Create Product</Link>
    </div>
  );
}
