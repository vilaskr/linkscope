import { useState } from "react";
import { 
  Globe, Shield, ShieldAlert, CheckCircle2, AlertCircle, XCircle, 
  Copy, Check, FileCode, Tag, Heart, Terminal, KeyRound, ArrowUpRight,
  Eye, Monitor, Server, Award
} from "lucide-react";
import { InspectionResult } from "../types";

interface DetailsDashboardProps {
  result: InspectionResult;
}

// Row component that manages its own copy state
function InfoRow({ 
  label, 
  value, 
  status = "info", 
  statusText = "" 
}: { 
  label: string; 
  value: string; 
  status?: "success" | "warning" | "error" | "info";
  statusText?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status indicator colors
  let statusDot = null;
  if (status === "success") {
    statusDot = (
      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wide">{statusText || "Passed"}</span>
      </span>
    );
  } else if (status === "warning") {
    statusDot = (
      <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wide">{statusText || "Warning"}</span>
      </span>
    );
  } else if (status === "error") {
    statusDot = (
      <span className="inline-flex items-center gap-1 text-red-600 font-medium">
        <XCircle className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wide">{statusText || "Missing"}</span>
      </span>
    );
  }

  return (
    <div className="py-3 border-b border-slate-100 last:border-b-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
      {/* Label & Status */}
      <div className="flex items-center gap-2.5 min-w-[150px]">
        <span className="font-medium text-slate-500 font-mono text-[11px] uppercase tracking-wider">{label}</span>
        {statusDot}
      </div>

      {/* Value & Copy */}
      <div className="flex-1 flex items-center justify-between gap-3 min-w-0 bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 p-2 rounded-lg transition-colors group">
        <span 
          className={`font-mono truncate select-all pr-1 text-slate-800 ${
            !value ? "text-slate-400 italic" : ""
          }`}
          title={value || "No value found"}
        >
          {value || "N/A"}
        </span>
        
        {value && (
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-md border flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
              copied 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-white text-slate-400 border-slate-200 hover:text-slate-700 hover:border-slate-300 shadow-2xs opacity-60 group-hover:opacity-100"
            }`}
            title={`Copy ${label}`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600">Copied</span>
              </>
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function DetailsDashboard({ result }: DetailsDashboardProps) {
  const { general, seo, openGraph, twitterCard, branding, technical } = result;

  // Helper to bypass CORS/hotlinking blocks on social images
  const getProxiedUrl = (originalUrl: string) => {
    if (!originalUrl) return "";
    if (/^https?:\/\//i.test(originalUrl)) {
      return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
    }
    return originalUrl;
  };

  // Evaluation helpers
  const getTitleStatus = (len: number) => {
    if (len === 0) return { status: "error" as const, text: "Missing Title" };
    if (len < 30) return { status: "warning" as const, text: "Too Short (< 30 ch)" };
    if (len > 60) return { status: "warning" as const, text: "Too Long (> 60 ch)" };
    return { status: "success" as const, text: "Optimal (30-60 ch)" };
  };

  const getDescStatus = (len: number) => {
    if (len === 0) return { status: "error" as const, text: "Missing Description" };
    if (len < 110) return { status: "warning" as const, text: "Too Short (< 110 ch)" };
    if (len > 160) return { status: "warning" as const, text: "Too Long (> 160 ch)" };
    return { status: "success" as const, text: "Optimal (110-160 ch)" };
  };

  const titleEval = getTitleStatus(seo.titleLength);
  const descEval = getDescStatus(seo.descriptionLength);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Website Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-display">Website Identity</h3>
              <p className="text-[11px] text-slate-500">Core parameters & general domain metrics.</p>
            </div>
          </div>

          <div className="space-y-1">
            <InfoRow 
              label="Domain Host" 
              value={general.domain} 
              status="info" 
            />
            <InfoRow 
              label="URL Protocol" 
              value={general.url} 
              status={general.isHttps ? "success" : "warning"} 
              statusText={general.isHttps ? "HTTPS Secure" : "HTTP Insecure"}
            />
            <InfoRow 
              label="HTML Language" 
              value={general.language} 
              status={general.language ? "success" : "warning"}
              statusText={general.language ? "Configured" : "Missing Lang"}
            />
            <InfoRow 
              label="Favicon Source" 
              value={branding.favicon} 
              status={branding.favicon ? "success" : "error"}
            />
            <InfoRow 
              label="Site Author" 
              value={general.author} 
              status={general.author ? "success" : "info"}
            />
            <InfoRow 
              label="Generator" 
              value={general.generator} 
              status="info"
            />
          </div>
        </div>

        {/* Card Footer branding favicon preview */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wide">Favicon Preview:</span>
            {branding.favicon ? (
              <img 
                src={branding.favicon} 
                alt="Favicon preview" 
                referrerPolicy="no-referrer"
                className="w-5 h-5 object-contain rounded bg-slate-50 border border-slate-200 p-0.5"
                onError={(e) => {
                  e.currentTarget.src = "https://example.com/favicon.ico";
                }}
              />
            ) : (
              <span className="text-xs text-slate-400">None found</span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            ID: linkscope-identity-card
          </span>
        </div>
      </div>

      {/* 2. SEO Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-display">Search Engine Optimization (SEO)</h3>
              <p className="text-[11px] text-slate-500">How search engines index and read this page.</p>
            </div>
          </div>

          <div className="space-y-1">
            <InfoRow 
              label="SEO Title" 
              value={seo.title} 
              status={titleEval.status}
              statusText={`${titleEval.text} (${seo.titleLength} ch)`}
            />
            <InfoRow 
              label="Meta Desc." 
              value={seo.description} 
              status={descEval.status}
              statusText={`${descEval.text} (${seo.descriptionLength} ch)`}
            />
            <InfoRow 
              label="Canonical URL" 
              value={seo.canonical} 
              status={seo.canonical ? "success" : "warning"}
              statusText={seo.canonical ? "Defined" : "Not set"}
            />
            <InfoRow 
              label="Robots Tag" 
              value={seo.robots} 
              status={seo.robots ? "success" : "warning"}
              statusText={seo.robots ? "Configured" : "Default fallback"}
            />
            <InfoRow 
              label="Meta Keywords" 
              value={seo.keywords} 
              status={seo.keywords ? "success" : "info"}
              statusText={seo.keywords ? "Legacy tag present" : "None"}
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Google crawler will fallback to Title tag and standard description.</span>
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
            ID: linkscope-seo-card
          </span>
        </div>
      </div>

      {/* 3. Open Graph Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Tag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-display">Open Graph (Facebook/LinkedIn Schema)</h3>
              <p className="text-[11px] text-slate-500">Rich snippet meta tags for Facebook and LinkedIn.</p>
            </div>
          </div>

          <div className="space-y-1">
            <InfoRow 
              label="og:title" 
              value={openGraph.title} 
              status={openGraph.title ? "success" : "error"}
            />
            <InfoRow 
              label="og:description" 
              value={openGraph.description} 
              status={openGraph.description ? "success" : "error"}
            />
            <InfoRow 
              label="og:image" 
              value={openGraph.image} 
              status={openGraph.image ? "success" : "error"}
            />
            <InfoRow 
              label="og:site_name" 
              value={openGraph.siteName} 
              status="info"
            />
            <InfoRow 
              label="og:url" 
              value={openGraph.url} 
              status="info"
            />
            <InfoRow 
              label="og:type" 
              value={openGraph.type} 
              status="info"
            />
            <InfoRow 
              label="og:locale" 
              value={openGraph.locale} 
              status="info"
            />
          </div>
        </div>

        {/* Thumbnail render preview */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          {openGraph.image ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                <img 
                  src={getProxiedUrl(openGraph.image)} 
                  alt="OG preview" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-800 font-mono truncate max-w-[200px]">
                  {openGraph.image.split("/").pop() || "og-image.png"}
                </p>
                <p className="text-[10px] text-slate-400">Resolved OpenGraph thumbnail image asset</p>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">No Open Graph thumbnail image specified.</div>
          )}
        </div>
      </div>

      {/* 4. Twitter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-slate-100 text-slate-900 rounded-xl">
              <FileCode className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-display">Twitter / X Cards Schema</h3>
              <p className="text-[11px] text-slate-500">Rich media layout details specified for X.</p>
            </div>
          </div>

          <div className="space-y-1">
            <InfoRow 
              label="twitter:card" 
              value={twitterCard.card} 
              status={twitterCard.card ? "success" : "warning"}
              statusText={twitterCard.card ? "Configured" : "Default fallback"}
            />
            <InfoRow 
              label="twitter:title" 
              value={twitterCard.title} 
              status={twitterCard.title ? "success" : "info"}
            />
            <InfoRow 
              label="twitter:description" 
              value={twitterCard.description} 
              status={twitterCard.description ? "success" : "info"}
            />
            <InfoRow 
              label="twitter:image" 
              value={twitterCard.image} 
              status={twitterCard.image ? "success" : "info"}
            />
            <InfoRow 
              label="twitter:creator" 
              value={twitterCard.creator} 
              status="info"
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Card fallback defaults to og:image if twitter:image is missing.</span>
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
            ID: linkscope-twitter-card
          </span>
        </div>
      </div>

      {/* 5. Branding Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Heart className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-display">Brand Assets & Identity</h3>
              <p className="text-[11px] text-slate-500">Branding touchpoints, icons, and themes.</p>
            </div>
          </div>

          <div className="space-y-1">
            <InfoRow 
              label="Favicon Link" 
              value={branding.favicon} 
              status={branding.favicon ? "success" : "warning"}
            />
            <InfoRow 
              label="Apple Touch Icon" 
              value={branding.appleTouchIcon} 
              status={branding.appleTouchIcon ? "success" : "warning"}
              statusText={branding.appleTouchIcon ? "Configured" : "Missing Apple Icon"}
            />
            <InfoRow 
              label="Theme Color" 
              value={branding.themeColor} 
              status={branding.themeColor ? "success" : "info"}
            />
            <InfoRow 
              label="PWA Webmanifest" 
              value={branding.manifest} 
              status={branding.manifest ? "success" : "info"}
              statusText={branding.manifest ? "PWA Ready" : "No manifest"}
            />
          </div>
        </div>

        {/* Color Block preview */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wide">Brand color:</span>
            {branding.themeColor ? (
              <div className="flex items-center gap-1.5">
                <span 
                  className="w-4 h-4 rounded-full border border-slate-300 inline-block shadow-2xs" 
                  style={{ backgroundColor: branding.themeColor }}
                />
                <span className="font-mono text-xs text-slate-700 font-bold">{branding.themeColor}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">None configured</span>
            )}
          </div>
          <span className="font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
            ID: linkscope-branding-card
          </span>
        </div>
      </div>

      {/* 6. Technical Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <Terminal className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-display">Technical Configuration</h3>
              <p className="text-[11px] text-slate-500">Document attributes and parser encoding settings.</p>
            </div>
          </div>

          <div className="space-y-1">
            <InfoRow 
              label="HTML Language" 
              value={technical.language} 
              status={technical.language ? "success" : "warning"}
            />
            <InfoRow 
              label="Character Set" 
              value={technical.charset} 
              status={technical.charset ? "success" : "warning"}
              statusText={technical.charset ? "Configured" : "Implicit/Inferred"}
            />
            <InfoRow 
              label="Viewport Tag" 
              value={technical.viewport} 
              status={technical.viewport ? "success" : "error"}
              statusText={technical.viewport ? "Mobile Friendly" : "Missing scale config"}
            />
            <InfoRow 
              label="Host Generator" 
              value={technical.generator} 
              status="info"
            />
            <InfoRow 
              label="Author Tag" 
              value={technical.author} 
              status="info"
            />
            <InfoRow 
              label="Canonical URL" 
              value={technical.canonical} 
              status="info"
            />
            <InfoRow 
              label="Security TLS/SSL" 
              value={technical.isHttps ? "Secure (TLS v1.3)" : "Unencrypted Connection (HTTP)"} 
              status={technical.isHttps ? "success" : "warning"}
              statusText={technical.isHttps ? "Active" : "Insecure"}
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Technical metrics verify layout scale, viewport safety, and server configurations.</span>
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
            ID: linkscope-tech-card
          </span>
        </div>
      </div>

    </div>
  );
}
