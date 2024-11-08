import { Fragment } from "react";

import bg from "@/components/assest/home/bg.png";

import Image from "next/image";

export default function Background() {
  return (
    <Fragment>
      <Image src={bg} alt="bg" className="bg" />
    </Fragment>
  );
}
