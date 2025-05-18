import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Muscle Fitness",
  description:
    "Learn about MUSCLE FITNESS's mission, values, and dedicated team helping members achieve their fitness goals in Addis.",
  openGraph: {
    title: "About MUSCLE FITNESS | Premier Fitness Center in Addis",
    description:
      "Discover our story, mission, and the team behind MUSCLE FITNESS - dedicated to transforming lives through fitness and wellness.",
  },
  twitter: {
    title: "About MUSCLE FITNESS | Premier Fitness Center in Addis",
    description:
      "Discover our story, mission, and the team behind MUSCLE FITNESS - dedicated to transforming lives through fitness and wellness.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
