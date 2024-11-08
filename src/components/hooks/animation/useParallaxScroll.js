import { useEffect } from "react";

const useParallaxScroll = () => {
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
};

export default useParallaxScroll;
