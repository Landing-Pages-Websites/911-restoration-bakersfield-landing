"use client";

import { useEffect } from "react";

interface TrackingConfig {
  siteKey?: string;
  siteId?: string;
  gtmId?: string;
  gaId?: string;
  pixelId?: string;
}

export function useTracking(config: TrackingConfig) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Avoid loading multiple times
    if (document.getElementById("optimizer-script")) return;

    // Set MegaTag config BEFORE loading script
    if (config.siteKey) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).MEGA_TAG_CONFIG = {
        siteKey: config.siteKey,
        siteId: config.siteId,
        gtmId: config.gtmId,
        gaId: config.gaId,
        pixelId: config.pixelId,
      };
    }

    // Set API endpoints — REQUIRED
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).API_ENDPOINT = "https://optimizer.gomega.ai";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).TRACKING_API_ENDPOINT = "https://events-api.gomega.ai";

    // Load optimizer script
    const script = document.createElement("script");
    script.id = "optimizer-script";
    script.src = "https://cdn.gomega.ai/scripts/optimizer.min.js";
    script.async = true;
    document.head.appendChild(script);
  }, [config]);
}
