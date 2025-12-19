import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable in dev to avoid caching issues, can comment out to test
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
