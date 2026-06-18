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
  metadataBase: new URL("https://call.911restorationbakersfield.com"),
  title: "Emergency Water, Fire & Mold Damage Restoration in Bakersfield, CA | 911 Restoration",
  description:
    "24/7 emergency disaster restoration in Bakersfield & Kern County. 45-minute response, IICRC-certified, bilingual (Hablamos Español), free visual inspection, and direct insurance claim support. Water, fire & mold damage. Call (661) 416-8390.",
  openGraph: {
    title: "Emergency Water, Fire & Mold Damage Restoration in Bakersfield, CA | 911 Restoration",
    description:
      "24/7 emergency disaster restoration in Bakersfield & Kern County. 45-minute response, IICRC-certified, bilingual (Hablamos Español), free visual inspection, and direct insurance claim support. Call (661) 416-8390.",
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
        <meta name="mega-site-id" content="fa3156d9-b3e9-4b18-b1a2-fb8202bbbbfd" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.MEGA_TAG_CONFIG={siteKey:"546m6hgf5k0aozq2",siteId:"fa3156d9-b3e9-4b18-b1a2-fb8202bbbbfd",gtmId:"GTM-W9ZK7BXB"};window.API_ENDPOINT="https://optimizer.gomega.ai";window.TRACKING_API_ENDPOINT="https://events-api.gomega.ai";`,
          }}
        />
        <script
          id="optimizer-script"
          src="https://cdn.gomega.ai/scripts/optimizer.min.js"
          data-site-id="fa3156d9-b3e9-4b18-b1a2-fb8202bbbbfd"
          async
        />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-W9ZK7BXB');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W9ZK7BXB"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
        <Script src="https://572388.tctm.co/t.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
