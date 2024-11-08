import Image from "next/image";

const HomeImages = ({ homeImg }) => {
  return (
    <div className="img">
      {homeImg.map((img) => (
        <Image
          src={img.img}
          alt="home"
          quality={100}
          key={img.id}
          className="parallax__image"
          data-speed="0.5"
        />
      ))}
    </div>
  );
};

export default HomeImages;
