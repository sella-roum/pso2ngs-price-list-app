let userConfig;
const candidates = ["./v0-user-next.config.mjs", "./v0-user-next.config.cjs", "./v0-user-next.config.js"];
for (const p of candidates) {
  try {
    userConfig = await import(p);
    break;
  } catch (e) {
    const code = e && (e.code || e.cause?.code);
    const msg = typeof e?.message === "string" ? e.message : "";
    // モジュールが見つからないエラーの場合は次の候補を試す
    if (code === "ERR_MODULE_NOT_FOUND" || msg.includes("Cannot find module")) {
      continue;
    }
    // それ以外のエラー（構文エラーなど）は早期に表面化させる
    throw e;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ビルド時にESLintエラーを無視する（trueにするとCI環境での型チェックが無効になるため注意）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ビルド時にTypeScriptエラーを無視する（trueにするとCI環境での型チェックが無効になるため注意）
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    // 外部ドメインの画像を使用する場合、ここにホスト名を追加
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/images/**',
      // },
    ],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig;

  for (const key in config) {
    if (typeof nextConfig[key] === "object" && !Array.isArray(nextConfig[key])) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      };
    } else {
      nextConfig[key] = config[key];
    }
  }
}

export default nextConfig;
