// app/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
// app/layout.tsx
import "./globals.css";
import "./styles/fonts.css";
import { Inter } from "next/font/google";
import { CartProvider } from "./Shop/_components/CartContext";
import { ServiceProvider } from "./admin/components/serviceContext";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Robi Fitness Hawassa",
    template: "%s | Robi Fitness Hawassa",
  },
  description:
    "Robi Fitness is a Health and Fitness Center in Hawassa, offering top-notch fitness services and facilities.",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  return (
    <html lang="en">
      <head>
        {/* Add your favicon here */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`font-jost ${inter.className}`}>
        {/* <ServiceProvider>
          <CartProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </CartProvider>
        </ServiceProvider> */}

        <div className="bg-black h-full">
          <h1 className="text-customBlue text-center ">
            {" "}
            Website Under Maintainance, please check back later.
          </h1>
        </div>
      </body>
    </html>
  );
}
