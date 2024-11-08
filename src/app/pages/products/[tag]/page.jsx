"use client";

import React from "react";

import { useParams } from "next/navigation";

export default function Tag() {
  const { tag } = useParams();

  return (
    <section>
      <div className="container">{tag}</div>;
    </section>
  );
}
