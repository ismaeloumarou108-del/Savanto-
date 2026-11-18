import { Suspense } from "react";
import Login from "./Login";

export const metadata = { title: "Connexion" };

export default function Page() {
  return <Suspense><Login /></Suspense>;
}
