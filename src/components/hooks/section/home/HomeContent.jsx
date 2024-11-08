import Link from "next/link";

const HomeContent = ({ homeData }) => {
  return (
    <div className="title">
      {homeData.map((data) => (
        <div className="text" key={data.id}>
          <h1>{data.title}</h1>
          <p>{data.text}</p>
          <div className="btn">
            <Link href={data.path}>{data.name}</Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeContent;
