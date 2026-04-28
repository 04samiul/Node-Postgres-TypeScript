import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SITE_NAME = "Crack-CU";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

export function useSEO({ title, description, path, ogType = "website", noIndex = false }: SEOProps) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const baseUrl = "https://crackcu.eu.cc";
    const ogImage = `${baseUrl}/favicon.png`;

    setMeta("description", description);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:image", ogImage, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    if (path) {
      const canonicalUrl = `${baseUrl}${path}`;
      setCanonical(canonicalUrl);
      setMeta("og:url", canonicalUrl, true);
    }

    if (noIndex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow");
    }

    return () => {
      document.title = `${SITE_NAME} - Don't Just Study, Crack It!`;
    };
  }, [title, description, path, ogType, noIndex]);

  // Add schema
    if (schema) {
      let el = document.querySelector('script[data-seo="true"]') as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement("script");
        el.type = "application/ld+json";
        el.setAttribute("data-seo", "true");
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema);
    }

    return () => {
      document.title = `${SITE_NAME} - Don't Just Study, Crack It!`;
      document.querySelector('script[data-seo="true"]')?.remove();
    };
  }, [title, description, path, ogType, noIndex, schema]);
}
