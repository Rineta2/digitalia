"use client";

import { useEffect } from "react";

import { homeData, homeImg } from "@/components/ui/data/Home";

import Link from "next/link";

import Image from "next/image";

import "@/components/styling/Home.scss";

import bg from "@/components/assest/home/bg.png";

export default function Home() {
  useEffect(() => {
    const handleScroll = () => {
      const parallaxElements = Array.from(
        document.querySelectorAll(".parallax__image")
      );
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-speed") || "0");
        const yPos = window.scrollY * speed;

        requestAnimationFrame(() => {
          el.style.transform = `translateY(${yPos}px)`;
        });
      });
    };

    const throttledHandleScroll = throttle(handleScroll, 10);

    window.addEventListener("scroll", throttledHandleScroll);

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, []);

  const throttle = (callback, delay) => {
    let previousCall = new Date().getTime();
    return function () {
      const time = new Date().getTime();

      if (time - previousCall >= delay) {
        callback();
        previousCall = time;
      }
    };
  };

  return (
    <section className="home">
      <div className="home__container container">
        <div className="content">
          <div className="title">
            {homeData.map((data) => {
              return (
                <div className="text" key={data.id}>
                  <h1>{data.title}</h1>

                  <p>{data.text}</p>

                  <div className="btn">
                    <Link href={data.path}>{data.name}</Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="img">
            {homeImg.map((img) => {
              return (
                <Image
                  src={img.img}
                  alt="home"
                  quality={100}
                  key={img.id}
                  className="parallax__image"
                  data-speed="0.5"
                />
              );
            })}
          </div>
        </div>
      </div>

      <Image src={bg} alt="bg" className="bg" />
    </section>
  );
}
