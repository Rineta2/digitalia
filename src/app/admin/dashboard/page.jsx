import React from "react";

import Link from "next/link";

export default function page() {
  return (
    <section>
      <h1>Dashboard Admin</h1>
      <Link href="/admin/dashboard/news-product">News Product</Link>
    </section>
  );
}
