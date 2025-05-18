import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Muscle Fitness - Premier Fitness Center";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  try {
    // Font
    const interSemiBold = fetch(
      new URL("./Inter-SemiBold.ttf", import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 128,
            background: "linear-gradient(to right, #000000, #121212)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              MUSCLE FITNESS
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 400,
                color: "#4099ff", // This is the customBlue color as referenced in the website
                marginBottom: 32,
                textAlign: "center",
              }}
            >
              Premier Fitness Center in Addis
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: "#cccccc",
                textAlign: "center",
                maxWidth: 800,
              }}
            >
              Transform your body and life with professional trainers and
              state-of-the-art facilities
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: "Inter",
            data: await interSemiBold,
            style: "normal",
            weight: 400,
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
