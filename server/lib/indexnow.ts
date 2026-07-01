// IndexNow lets you push updated URLs straight to Bing, so it recrawls
// pages within minutes instead of waiting for a scheduled crawl.
// Docs: https://www.indexnow.org/documentation

const INDEXNOW_KEY = "c6df9621c16ae297bf22ca426c0c8b75";
const SITE_HOST = "crackcu.com";
const BASE_URL = `https://${SITE_HOST}`;

export async function pingIndexNow(paths: string[]) {
  if (!paths.length) return;

  const urlList = paths.map((p) => `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`);

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
  } catch (error) {
    // Never let an IndexNow failure break the actual admin action.
    console.error("IndexNow ping failed:", error);
  }
}

export { INDEXNOW_KEY };
