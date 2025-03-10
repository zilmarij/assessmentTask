import "@/styles/globals.css";
import Navbar from "@/components/Nabvbar";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Navbar />
      <Component {...pageProps} />;
    </div>
  );
}
