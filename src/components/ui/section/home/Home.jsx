"use client";

import { homeData, homeImg } from "@/components/ui/data/Home";

import "@/components/styling/Home.scss";

import useParallaxScroll from "@/components/hooks/animation/useParallaxScroll";

import HomeContent from "@/components/hooks/section/home/HomeContent";

import HomeImages from "@/components/hooks/section/home/HomeImages";

import Background from "@/components/hooks/section/home/Background";

export default function Home() {
  useParallaxScroll();

  return (
    <section className="home">
      <div className="home__container container">
        <div className="content">
          <HomeContent homeData={homeData} />
          <HomeImages homeImg={homeImg} />
        </div>

        <Background />
      </div>
    </section>
  );
}
