import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ إعادة توجيه طلبات الـ Push إلى Worker
  async rewrites() {
    return [
      {
        source: '/api/push/:path*',
        destination: 'https://study-bac-push.workers.dev/api/:path*',
      },
    ];
  },

  // ✅ إعدادات Service Worker
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },

  // ✅ ✅ ✅ التصحيح: استخدام serverExternalPackages بدلاً من transpilePackages
  // لاحظ: serverExternalPackages هي الخاصية الجديدة
  serverExternalPackages: ['@neondatabase/serverless'],

  // ✅ ✅ ✅ إزالة transpilePackages أو استخدامه فقط للمكتبات التي تحتاج تحويل
  // transpilePackages: [], // لا تضع @neondatabase/serverless هنا

  // ✅ إعدادات الصور
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: '**.neon.tech',
      },
    ],
  },
};

export default nextConfig;

// ✅ تهيئة OpenNext Cloudflare للتطوير المحلي
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();