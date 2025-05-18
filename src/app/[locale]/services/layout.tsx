import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Muscle Fitness",
  description:
    "Explore our range of fitness services including personal training, group fitness, bodybuilding, and more at MUSCLE FITNESS.",
  openGraph: {
    title: "Fitness Services | Muscle Fitness",
    description:
      "From personalized training to group fitness classes, discover the right program for your fitness journey at MUSCLE FITNESS.",
  },
  twitter: {
    title: "Fitness Services | Muscle Fitness",
    description:
      "From personalized training to group fitness classes, discover the right program for your fitness journey at MUSCLE FITNESS.",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
