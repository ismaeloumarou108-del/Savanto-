import { Suspense } from "react";
import Pricing from "./Pricing";

export const metadata = { title: "Tarifs" };

export default function Page() {
  return <Suspense><Pricing /></Suspense>;
}
