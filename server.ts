import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as cheerio from "cheerio";

const app = express();
const PORT = 3000;

app.use(express.json());

// Resolve relative URLs to absolute based on base URL
function resolveUrl(relativeUrl: string | undefined, baseUrl: string): string {
  if (!relativeUrl) return "";
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch (e) {
    return relativeUrl;
  }
}

// Inspect API Route
app.post("/api/inspect", async (req: express.Request, res: express.Response) => {
  let { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  // Prepend https:// if no protocol is provided
  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  // Validate normalized URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      res.status(400).json({ error: "Only http and https protocols are allowed" });
      return;
    }
  } catch (e) {
    res.status(400).json({ error: "Invalid URL format" });
    return;
  }

  const hostname = parsedUrl.hostname;
  const isHttps = parsedUrl.protocol === "https:";

  try {
    // Fetch HTML with an 8-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LinkScope/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      res.status(response.status >= 500 ? 502 : 400).json({
        error: `Failed to fetch website. Status code: ${response.status} ${response.statusText}`
      });
      return;
    }

    const htmlText = await response.text();
    const $ = cheerio.load(htmlText);

    // Extract raw tags
    const title = $("title").first().text().trim() || $("meta[property='og:title']").first().attr("content")?.trim() || $("meta[name='twitter:title']").first().attr("content")?.trim() || "";
    
    const metaDescription = $("meta[name='description']").first().attr("content")?.trim() || $("meta[property='og:description']").first().attr("content")?.trim() || $("meta[name='twitter:description']").first().attr("content")?.trim() || "";
    
    const canonical = $("link[rel='canonical']").first().attr("href")?.trim() || "";
    const resolvedCanonical = canonical ? resolveUrl(canonical, normalizedUrl) : "";

    const robots = $("meta[name='robots']").first().attr("content")?.trim() || "";
    const keywords = $("meta[name='keywords']").first().attr("content")?.trim() || "";

    // Open Graph
    const ogTitle = $("meta[property='og:title']").first().attr("content")?.trim() || "";
    const ogDescription = $("meta[property='og:description']").first().attr("content")?.trim() || "";
    const ogImageRaw = $("meta[property='og:image']").first().attr("content")?.trim() || "";
    const ogImage = ogImageRaw ? resolveUrl(ogImageRaw, normalizedUrl) : "";
    const ogUrlRaw = $("meta[property='og:url']").first().attr("content")?.trim() || "";
    const ogUrl = ogUrlRaw ? resolveUrl(ogUrlRaw, normalizedUrl) : "";
    const ogType = $("meta[property='og:type']").first().attr("content")?.trim() || "";
    const ogSiteName = $("meta[property='og:site_name']").first().attr("content")?.trim() || "";
    const locale = $("meta[property='og:locale']").first().attr("content")?.trim() || "";

    // Twitter Card
    const twitterCard = $("meta[name='twitter:card']").first().attr("content")?.trim() || "";
    const twitterTitle = $("meta[name='twitter:title']").first().attr("content")?.trim() || "";
    const twitterDescription = $("meta[name='twitter:description']").first().attr("content")?.trim() || "";
    const twitterImageRaw = $("meta[name='twitter:image']").first().attr("content")?.trim() || "";
    const twitterImage = twitterImageRaw ? resolveUrl(twitterImageRaw, normalizedUrl) : "";
    const twitterCreator = $("meta[name='twitter:creator']").first().attr("content")?.trim() || "";

    // Branding
    let faviconRaw = $("link[rel~='icon']").first().attr("href")?.trim() || 
                     $("link[rel='shortcut icon']").first().attr("href")?.trim() || "";
    const favicon = faviconRaw ? resolveUrl(faviconRaw, normalizedUrl) : resolveUrl("/favicon.ico", normalizedUrl);

    const appleTouchIconRaw = $("link[rel='apple-touch-icon']").first().attr("href")?.trim() || "";
    const appleTouchIcon = appleTouchIconRaw ? resolveUrl(appleTouchIconRaw, normalizedUrl) : "";

    const themeColor = $("meta[name='theme-color']").first().attr("content")?.trim() || "";
    
    // Check manifest
    const manifestRaw = $("link[rel='manifest']").first().attr("href")?.trim() || "";
    const manifest = manifestRaw ? resolveUrl(manifestRaw, normalizedUrl) : "";

    // Technical details
    const language = $("html").attr("lang")?.trim() || $("meta[http-equiv='content-language']").attr("content")?.trim() || "";
    const charset = $("meta[charset]").attr("charset")?.trim() || 
                    $("meta[http-equiv='Content-Type']").attr("content")?.match(/charset=([\w-]+)/i)?.[1]?.trim() || "";
    const viewport = $("meta[name='viewport']").first().attr("content")?.trim() || "";
    const generator = $("meta[name='generator']").first().attr("content")?.trim() || "";
    const author = $("meta[name='author']").first().attr("content")?.trim() || "";

    // SEO Score Calculation
    let score = 0;
    if (title.length > 0) score += 15;
    if (metaDescription.length > 0) score += 15;
    if (resolvedCanonical.length > 0) score += 10;
    if (robots.length > 0) score += 10;
    
    const hasOG = (ogTitle || ogImage || ogDescription) ? true : false;
    if (hasOG) score += 15;

    const hasTwitter = (twitterCard || twitterTitle || twitterImage || twitterDescription) ? true : false;
    if (hasTwitter) score += 10;

    if (faviconRaw || favicon) score += 10; // since we resolved fallback to domain/favicon.ico, we count it if we found a tag or fallback is active
    if (viewport.length > 0) score += 10;
    if (isHttps) score += 5;
    if (themeColor.length > 0) score += 5;

    let rating: "Excellent" | "Good" | "Needs Improvement" | "Poor";
    if (score >= 80) {
      rating = "Excellent";
    } else if (score >= 60) {
      rating = "Good";
    } else if (score >= 40) {
      rating = "Needs Improvement";
    } else {
      rating = "Poor";
    }

    const payload = {
      general: {
        url: normalizedUrl,
        domain: hostname,
        isHttps,
        language,
        charset,
        generator,
        author,
        viewport,
      },
      seo: {
        title,
        titleLength: title.length,
        description: metaDescription,
        descriptionLength: metaDescription.length,
        canonical: resolvedCanonical,
        robots,
        keywords,
      },
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        image: ogImage,
        url: ogUrl,
        type: ogType,
        siteName: ogSiteName,
        locale,
      },
      twitterCard: {
        card: twitterCard,
        title: twitterTitle,
        description: twitterDescription,
        image: twitterImage,
        creator: twitterCreator,
      },
      branding: {
        favicon,
        appleTouchIcon,
        themeColor,
        manifest,
      },
      technical: {
        viewport,
        charset,
        language,
        generator,
        author,
        canonical: resolvedCanonical,
        isHttps,
      },
      seoScore: {
        score,
        rating,
      }
    };

    res.json(payload);
  } catch (error: any) {
    console.error("Fetch/Parse Error:", error);
    let message = "An unexpected error occurred while inspecting the website.";
    if (error.name === "AbortError" || error.message?.includes("aborted")) {
      message = "Request timed out. The website is taking too long to respond.";
    } else if (error.code === "ENOTFOUND" || error.message?.includes("getaddrinfo")) {
      message = "DNS Lookup failed. Could not reach the host or the website does not exist.";
    } else if (error.code === "ECONNREFUSED") {
      message = "Connection refused by the host.";
    } else {
      message = error.message || message;
    }
    res.status(500).json({ error: message });
  }
});

// Image Proxy Route to bypass CORS, Referrer hotlinking protection and Mixed Content (HTTP on HTTPS)
app.get("/api/image-proxy", async (req: express.Request, res: express.Response) => {
  const imageUrl = req.query.url;
  if (!imageUrl || typeof imageUrl !== "string") {
    res.status(400).send("Image URL is required");
    return;
  }

  try {
    const parsedUrl = new URL(imageUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      res.status(400).send("Only http and https protocols are allowed");
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LinkScope/1.0",
        "Accept": "image/*, */*;q=0.8"
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      res.status(response.status >= 500 ? 502 : 400).send(`Failed to retrieve image: ${response.status}`);
      return;
    }

    const contentType = response.headers.get("content-type") || "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache image proxy responses for 24 hours

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error: any) {
    console.error("Image proxy error:", error.message);
    res.status(500).send("Error fetching image via proxy");
  }
});

// Serve frontend build and handle dev-server middleware mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
