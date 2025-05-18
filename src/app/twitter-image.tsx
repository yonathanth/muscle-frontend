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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#4099ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                  fontSize: 32,
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                MF
              </div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                MUSCLE FITNESS
              </div>
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 400,
                color: "#4099ff",
                marginBottom: 24,
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
              Where strength meets determination. Your journey to a stronger,
              better you starts here.
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
