import React from "react";

import Link from "next/link";

export default function page() {
  return (
    <section>
      <h1>Dashboard User</h1>
      <Link href="/users/dashboard/seting">Setting</Link>
      <Link href="/users/dashboard/rating">Rating</Link>
    </section>
  );
}
