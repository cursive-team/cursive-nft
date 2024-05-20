// "use client";

import { Cursive } from "@/shared/Cursive";
import Image from "next/image";
import { Button } from "./components";
import { useEffect } from "react";

export default function Home() {
  const run = async () => {
    const cursive = new Cursive();

    const calldata = await cursive.calculateSolidityCalldata({
      demo: "data",
    });
  };

  run();

  return <main></main>;
}
