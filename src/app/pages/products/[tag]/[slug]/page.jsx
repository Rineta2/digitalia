import React from "react";

export default function page({ params }) {
  const { tag, slug } = params;

  return (
    <section className="slug">
      <div className="slug__container container">
        <h1>
          {tag} - {slug}
        </h1>
      </div>
    </section>
  );
}
