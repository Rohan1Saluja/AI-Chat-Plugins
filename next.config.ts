/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Or your existing config
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openweathermap.org", // You already have this for weather icons
        port: "",
        pathname: "/img/wn/**",
      },
      {
        protocol: "https",
        hostname: "image.cnbcfm.com", // Add this for CNBC images
        port: "",
        pathname: "/api/v1/image/**", // Make this as specific or general as needed
      },
      // Add more hostnames as you discover them or if NewsAPI uses a wide variety
      // It's often better to be more specific with pathnames if possible.
      // For a general catch-all for many news sources (use with caution, less secure):
      // {
      //   protocol: 'https',
      //   hostname: '**', // This allows all hostnames, generally not recommended for production
      // },
      {
        // <<< --- ADD THIS NEW ENTRY --- >>>
        protocol: "https",
        hostname: "platform.theverge.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "nbcsports.brightspotcdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ichef.bbci.co.uk",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.cnn.com",
        port: "",
        pathname: "/**", // Allow any path from this hostname
      },
      {
        protocol: "https",
        hostname: "s.abcnews.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.foxnews.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s.yimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.buzzfeed.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.the-independent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets3.cbsnewsstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "npr.brightspotcdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "variety.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.axios.com",
        port: "",
        pathname: "/**",
      },
      // Add any other domains you see frequently in news results
    ],
    // If you were using the older `domains` array (deprecated in favor of remotePatterns):
    // domains: ['openweathermap.org', 'image.cnbcfm.com', 'media.cnn.com', ...],
  },
  // ... any other configurations you have
};

module.exports = nextConfig;
