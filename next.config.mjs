/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.swiki.jp",
        port: "",
        pathname: "/img0/**",
      },
    ],
  },
};

export default nextConfig;
