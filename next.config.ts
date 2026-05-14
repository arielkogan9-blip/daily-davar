import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Turbopack from being confused by stray package.json files
    // in parent directories (e.g. a Vercel-CLI package.json on the Desktop).
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
