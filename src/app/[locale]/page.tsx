import Header from "./components/Header";
import Footer from "./components/Footer";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import the CSS
config.autoAddCss = false;
import OurServices from "./components/OurServices";
import Shop from "./components/Shops";
import Supporting from "./components/Supporting";
import Contact from "./components/Contact";
import Hero from "./components/Hero";
import About from "./components/About";
import { Metadata } from "next";
import Testimonials from "./components/Testimonials";

export const metadata: Metadata = {
  title: "MUSCLE FITNESS - Premier Fitness Center in Addis",
  description:
    "Transform your body and life at MUSCLE FITNESS. Professional trainers, state-of-the-art equipment, and personalized programs for all fitness levels.",
  openGraph: {
    title: "MUSCLE FITNESS - Premium Gym & Fitness Center in Addis",
    description:
      "Join MUSCLE FITNESS for personalized training programs, state-of-the-art equipment, and expert guidance to achieve your fitness goals.",
  },
  twitter: {
    title: "MUSCLE FITNESS - Premium Gym & Fitness Center in Addis",
    description:
      "Join MUSCLE FITNESS for personalized training programs, state-of-the-art equipment, and expert guidance to achieve your fitness goals.",
  },
};

export default function Home() {
  return (
    <body>
      <main>
        <Header />

        <Hero />
        <About />
        <OurServices />
        {/* <Shop />
        <Supporting /> */}
        <Testimonials />
        <Contact />

        <Footer />
      </main>
    </body>
  );
}
