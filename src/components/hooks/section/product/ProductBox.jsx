import Image from "next/image";
import Link from "next/link";
import { Eye, Link as LucideLink } from "lucide-react";
import {
  formatTimeAgo,
  formatNumber,
} from "@/components/hooks/section/product/utils/formatters";

export default function ProductBox({ product, onProductSelect }) {
  return (
    <div key={product.id} className="box">
      <div className="img">
        <Image
          width={500}
          height={500}
          quality={100}
          src={product.imageUrl || "/placeholder-image.jpg"}
          alt={product.title}
        />
      </div>

      <div className="date">
        {product.createdAt
          ? formatTimeAgo(new Date(product.createdAt.toDate()))
          : "Tanggal tidak tersedia"}
      </div>

      <h1>{product.title}</h1>

      <span className="price">Rp. {formatNumber(product.price)}</span>

      <div className="overlay">
        <Link href={`/pages/products/${product.tags}/${product.slug}`}>
          <LucideLink size={30} />
        </Link>

        <button onClick={() => onProductSelect(product)}>
          <Eye size={30} />
        </button>
      </div>
    </div>
  );
}
