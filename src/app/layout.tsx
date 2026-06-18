import type { Metadata } from "next";
import { Outfit, Barlow_Condensed, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display-bold",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plumbing, Drain, Sewer & Septic Experts | Conejo Bros Plumbing — Thousand Oaks, CA",
  description:
    "Septic tank service, drain cleaning, hydro jetting, trenchless sewer repair, and 24/7 emergency plumbing across Thousand Oaks and Ventura County. One of very few CA companies handling septic design, geological testing, and installation in-house. Request your free quote.",
  openGraph: {
    title: "Plumbing, Drain, Sewer & Septic Experts | Conejo Bros Plumbing",
    description:
      "Septic, drain, sewer, and emergency plumbing in Thousand Oaks & the Conejo Valley. Trenchless no-dig repair, hydro jetting, and in-house septic design. Free quote — same-day response.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${barlow.variable} ${dmSans.variable}`}
    >
      <head>
        <meta name="mega-site-id" content="c4c1e2bb-8d8c-4255-a90a-27adefc7fc8f" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.MEGA_TAG_CONFIG={siteKey:"uqousx988ir14mdy",siteId:"c4c1e2bb-8d8c-4255-a90a-27adefc7fc8f",gtmId:"GTM-TDVDDXHW"};window.API_ENDPOINT="https://optimizer.gomega.ai";window.TRACKING_API_ENDPOINT="https://events-api.gomega.ai";`,
          }}
        />
        <script
          id="optimizer-script"
          src="https://cdn.gomega.ai/scripts/optimizer.min.js"
          data-site-id="c4c1e2bb-8d8c-4255-a90a-27adefc7fc8f"
          async
        />
      </head>
      <body className="antialiased">
        {children}
        <Script src="https://572388.tctm.co/t.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
