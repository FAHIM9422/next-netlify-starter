/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    const redirectHosts = [
      "agent-69b063bdbededeb0--loquacious-nougat-c0d6ec.netlify.app",
      "loquacious-nougat-c0d6ec.netlify.app",
      "0f37800a-b306-4b9f-a85f-6e8f9f1161ec.netlify.app"
    ];

    return redirectHosts.map((host) => ({
      source: "/:path*",
      has: [{ type: "host", value: host }],
      destination: "https://fahim9422.netlify.app/:path*",
      permanent: true
    }));
  }
};

module.exports = nextConfig;
