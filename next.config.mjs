/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/export/skill-pack": ["./skill-template/**/*"]
  }
};

export default nextConfig;
