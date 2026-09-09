/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The export is served from a subpath (ealush.com/emoji-picker-react via
  // GitHub Pages project site), so every asset URL must carry the prefix.
  // actions/configure-pages does NOT inject this; it lives here.
  basePath: '/emoji-picker-react',
}

module.exports = nextConfig
