import ProductDetail from "@/components/hooks/section/product/slug/ProductDetail";

import { House, Tags, Captions, ChevronRight } from "lucide-react";

import "@/components/styling/Home.scss";

import Link from "next/link";

export default function Page({ params }) {
  return (
    <section className="slug">
      <div className="slug__container container">
        <div className="header__slug">
          <div className="box">
            <House size={24} />
            <Link href="/">Home</Link>
          </div>

          <ChevronRight size={24} />

          <div className="box">
            <Tags size={24} />
            <Link href={`/pages/products/${params.tag}`}>{params.tag}</Link>
          </div>

          <ChevronRight size={24} />

          <div className="box">
            <Captions size={24} />
            <Link href={`/pages/products/${params.tag}/${params.slug}`}>
              {params.slug}
            </Link>
          </div>
        </div>
        <ProductDetail slug={params.slug} />
      </div>
    </section>
  );
}
