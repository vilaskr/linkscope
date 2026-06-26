import React, { useState, useEffect, useRef } from "react";
import { 
  Globe, Search, Sparkles, Loader2, RefreshCw, AlertTriangle, 
  Download, Copy, Check, FileJson, FileText, FileSpreadsheet, ArrowRight, CheckCircle2 
} from "lucide-react";
import CircularScore from "./components/CircularScore";
import SocialPreviews from "./components/SocialPreviews";
import DetailsDashboard from "./components/DetailsDashboard";
import { InspectionResult } from "./types";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InspectionResult | null>(null);
  
  // Loading state status message cycler
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Connecting to DNS servers...",
    "Establishing secure handshakes...",
    "Downloading HTML markup payload...",
    "Parsing HTML directives with Cheerio...",
    "Auditing SEO schema directives...",
    "Resolving absolute brand & favicon assets...",
    "Generating realistic social embed cards..."
  ];

  // Copy/Export indicators
  const [jsonCopied, setJsonCopied] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  // Monitor scroll for sticky inspection bar
  useEffect(() => {
    const handleScroll = () => {
      if (result && window.scrollY > 300) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [result]);

  // Status message cycler effect
  useEffect(() => {
    let intervalId: any;
    if (loading) {
      setLoadingStep(0);
      intervalId = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [loading]);

  // Fast demo links to click inspect immediately
  const handleQuickInspect = (demoUrl: string) => {
    setUrl(demoUrl);
    triggerInspection(demoUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerInspection(url);
  };

  const triggerInspection = async (targetUrl: string) => {
    if (!targetUrl.trim()) {
      setError("Please enter a valid website URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/inspect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to inspect URL. Please check the website and retry.");
      }

      setResult(data);
      // Auto-populate URL with the normalized resolved URL
      if (data.general?.url) {
        setUrl(data.general.url);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please verify the URL and network connection.");
    } finally {
      setLoading(false);
    }
  };

  // Export 1: Copy raw JSON response
  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  // Export 2: Download JSON file
  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const fileUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `linkscope-${result.general.domain}-metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileUrl);
  };

  // Export 3: Download Markdown report
  const handleDownloadMarkdown = () => {
    if (!result) return;
    const { general, seo, openGraph, twitterCard, branding, seoScore } = result;
    
    const md = `# LinkScope SEO & Web Metadata Audit Report
    
Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Target Hostname: **${general.domain}**
Inspected URL: ${general.url}
HTTPS Protection: ${general.isHttps ? "Secure (HTTPS)" : "Insecure (HTTP)"}

---

## 📈 Quality Score Summary
- **Overall Score:** **${seoScore.score}/100**
- **Rating:** **${seoScore.rating}**
- Based on 10 structural audits targeting title lengths, description, social OpenGraph protocols, viewport scales, branding, and TLS/SSL configurations.

---

## 🔍 Metadata Directives Deep-Dive

### 1. General & Document Parameters
- **Domain:** \`${general.domain}\`
- **Protocol:** \`${general.isHttps ? "https://" : "http://"}\`
- **Language Code:** \`${general.language || "Not Specified"}\`
- **Encoding/Charset:** \`${general.charset || "Not Specified"}\`
- **CMS/Generator:** \`${general.generator || "N/A"}\`
- **Author:** \`${general.author || "N/A"}\`

### 2. Search Engine Optimization (SEO)
- **Title Tag:** "${seo.title || "Missing"}"
- **Title Character Length:** ${seo.titleLength} characters (Recommended: 30-60)
- **Meta Description:** "${seo.description || "Missing"}"
- **Description Character Length:** ${seo.descriptionLength} characters (Recommended: 110-160)
- **Canonical Address Link:** \`${seo.canonical || "Not Configured"}\`
- **Robots directives:** \`${seo.robots || "Not Configured (Default behavior)"}\`
- **Legacy Keywords:** \`${seo.keywords || "None present"}\`

### 3. Open Graph (og:) Schema
- **og:title:** "${openGraph.title || "Missing"}"
- **og:description:** "${openGraph.description || "Missing"}"
- **og:image Link:** \`${openGraph.image || "Missing"}\`
- **og:site_name:** "${openGraph.siteName || "Missing"}"
- **og:type:** "${openGraph.type || "Missing"}"
- **Locale:** "${openGraph.locale || "N/A"}"

### 4. Twitter Cards Schema
- **twitter:card:** "${twitterCard.card || "Missing"}"
- **twitter:title:** "${twitterCard.title || "Missing"}"
- **twitter:description:** "${twitterCard.description || "Missing"}"
- **twitter:image Link:** \`${twitterCard.image || "Missing"}\`
- **twitter:creator Handle:** "${twitterCard.creator || "N/A"}"

---

*Report compiled dynamically by LinkScope - The Premium Developer Web Inspector.*`;

    const blob = new Blob([md], { type: "text/markdown" });
    const fileUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `linkscope-${general.domain}-seo-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileUrl);
  };

  // Export 4: Download TXT Report
  const handleDownloadTxt = () => {
    if (!result) return;
    const { general, seo, openGraph, seoScore } = result;
    
    const txt = `LINKSCOPE WEBSITE INSPECTOR - METADATA REPORT
======================================================
Target Hostname: ${general.domain}
Inspected URL: ${general.url}
Overall Quality Score: ${seoScore.score}/100 (${seoScore.rating})
Generated on: ${new Date().toISOString()}

1. SEO REPORT CARD
------------------
* Title: "${seo.title || "Missing"}"
  Length: ${seo.titleLength} characters
* Description: "${seo.description || "Missing"}"
  Length: ${seo.descriptionLength} characters
* Canonical Link: ${seo.canonical || "Missing"}
* Robots Meta: ${seo.robots || "Missing"}

2. OPEN GRAPH DATA
------------------
* og:title: ${openGraph.title || "Missing"}
* og:description: ${openGraph.description || "Missing"}
* og:image: ${openGraph.image || "Missing"}
* og:url: ${openGraph.url || "Missing"}

3. TECHNICAL DIRECTIVES
-----------------------
* Viewport: ${general.viewport || "Missing"}
* Charset: ${general.charset || "Missing"}
* Language: ${general.language || "Missing"}
* TLS/SSL Security: ${general.isHttps ? "HTTPS Enabled" : "HTTP Unsecure"}

Report generated by LinkScope App.`;

    const blob = new Blob([txt], { type: "text/plain" });
    const fileUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = `linkscope-${general.domain}-audit.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 relative">
      
      {/* Dynamic Sticky Top Header Input on Scroll */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 py-3.5 px-6 shadow-xs transform transition-transform duration-300 flex items-center justify-between gap-6 ${
          showSticky ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Globe className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-slate-900 font-display text-sm tracking-tight">LinkScope</span>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-xl flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Inspect another website (e.g. vercel.com)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-hidden transition-all text-slate-800 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Analyze"}
          </button>
        </form>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          {result && (
            <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200/50 text-[11px] font-mono font-semibold text-slate-600 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${result.seoScore.score >= 80 ? "bg-emerald-500" : "bg-amber-400"}`} />
              Score: {result.seoScore.score}/100
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-12">
        
        {/* Header Branding */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/10">
              <Globe className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-1.5">
                LinkScope
                <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-mono font-medium px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Inspector
                </span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>v1.2.0</span>
            <span>·</span>
            <span>Local Time UTC-7</span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3.5 font-display">
            Inspect any website in seconds.
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            LinkScope is a premium developer tool that analyzes any public website URL to instantly compile SEO directives, OpenGraph protocols, Twitter schemas, and authentic social preview cards.
          </p>
        </section>

        {/* Search Input Bar Card */}
        <section className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2 relative">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Paste public web link (e.g. https://github.com)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-500 outline-none border border-transparent transition-all font-mono text-slate-800"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white font-semibold text-sm px-6 py-3.5 sm:py-0 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 shrink-0 select-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inspecting...</span>
                </>
              ) : (
                <>
                  <span>Analyze URL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick seeded demo links */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Try quick test targets:</span>
            {[
              { label: "github.com", url: "https://github.com" },
              { label: "wikipedia.org", url: "https://wikipedia.org" },
              { label: "vercel.com", url: "https://vercel.com" },
              { label: "stripe.com", url: "https://stripe.com" }
            ].map((demo) => (
              <button
                key={demo.label}
                type="button"
                onClick={() => handleQuickInspect(demo.url)}
                disabled={loading}
                className="px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:text-blue-600 transition-colors text-slate-500 font-medium font-mono text-[11px] cursor-pointer disabled:opacity-50"
              >
                {demo.label}
              </button>
            ))}
          </div>
        </section>

        {/* Loading Visualizer State */}
        {loading && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center flex flex-col items-center justify-center mb-12">
            <div className="relative mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>

            <h3 className="text-sm font-semibold text-slate-800 font-display mb-1">
              {loadingSteps[loadingStep]}
            </h3>
            <p className="text-xs text-slate-400 font-mono tracking-wide mb-5">
              Target: <span className="text-slate-500 underline">{url}</span>
            </p>

            {/* Horizontal progress bar */}
            <div className="w-full max-w-sm h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
            
            <span className="text-[10px] uppercase font-bold text-blue-500 mt-3 tracking-widest animate-pulse">
              Request Timeout: 8000ms guard active
            </span>
          </div>
        )}

        {/* Error Handling Cards */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50/50 border border-red-200 rounded-2xl p-6 shadow-2xs mb-12 flex flex-col sm:flex-row gap-4 items-start">
            <div className="p-2 bg-red-100 text-red-700 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-900 font-display mb-1.5">
                Inspection Analysis Interrupted
              </h3>
              <p className="text-xs text-red-700/80 leading-relaxed mb-4">
                {error}
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => triggerInspection(url)}
                  className="bg-red-100 hover:bg-red-200 text-red-900 border border-red-200 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Inspection
                </button>
                <button
                  onClick={() => setError(null)}
                  className="text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Clear Error
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loaded Inspection Results Dashboard */}
        {result && (
          <div className="space-y-10 animate-fade-in">
            
            {/* 1. Score Card Circular Row */}
            <CircularScore result={result} />

            {/* 2. Realistic Social Media Mockups */}
            <SocialPreviews result={result} />

            {/* 3. Detailed Parameter Tables/Grids */}
            <DetailsDashboard result={result} />

            {/* 4. Export Suite Block */}
            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-semibold font-display flex items-center gap-1.5 text-slate-100">
                  <FileJson className="w-4 h-4 text-blue-500" />
                  Developer Export Suite
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Export complete web audits as JSON payloads, text layouts, or standard Markdown files.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
                {/* Copy JSON */}
                <button
                  onClick={handleCopyJson}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    jsonCopied 
                      ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40" 
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {jsonCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>

                {/* Download JSON */}
                <button
                  onClick={handleDownloadJson}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>

                {/* Download Markdown */}
                <button
                  onClick={handleDownloadMarkdown}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Markdown Report</span>
                </button>

                {/* Download Text */}
                <button
                  onClick={handleDownloadTxt}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>TXT Audit</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Footer Credits */}
        <footer className="mt-20 pt-8 border-t border-slate-200/60 text-center text-xs text-slate-400 font-mono">
          <p>© {new Date().getFullYear()} LinkScope. All rights reserved.</p>
          <p className="mt-1.5 flex items-center justify-center gap-1">
            <span>Engineered with absolute precision by</span>
            <span className="font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded-md transition-all cursor-pointer">
              Vilas K R
            </span>
          </p>
        </footer>

      </div>
    </div>
  );
}
