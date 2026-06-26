import { useState } from "react";
import { Facebook, Twitter, Linkedin, MessageSquare, ExternalLink, Image as ImageIcon } from "lucide-react";
import { InspectionResult } from "../types";

interface SocialPreviewsProps {
  result: InspectionResult;
}

type SocialPlatform = "facebook" | "twitter" | "linkedin" | "discord";

export default function SocialPreviews({ result }: SocialPreviewsProps) {
  const [activeTab, setActiveTab] = useState<SocialPlatform>("facebook");

  const { title, description, image, siteName } = result.openGraph;
  const { title: twTitle, description: twDescription, image: twImage, card: twCard } = result.twitterCard;
  const domain = result.general.domain;

  // Fallbacks
  const previewTitle = title || result.seo.title || "No Title Meta Tag Found";
  const previewDesc = description || result.seo.description || "No description provided for this website. Inspecting metadata helps identify if search engine indexing is optimized.";
  const previewImage = image || twImage || "";
  const previewSiteName = siteName || domain;

  // Twitter Fallbacks
  const twitterTitle = twTitle || previewTitle;
  const twitterDesc = twDescription || previewDesc;
  const twitterImage = twImage || previewImage;
  const isLargeImage = twCard === "summary_large_image" || !twCard;

  // Helper to bypass CORS/hotlinking blocks on social images
  const getProxiedUrl = (originalUrl: string) => {
    if (!originalUrl) return "";
    if (/^https?:\/\//i.test(originalUrl)) {
      return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
    }
    return originalUrl;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900 font-display">Social Media Previews</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize how this webpage will look when shared across social channels.
          </p>
        </div>

        {/* Tab Selection buttons */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("facebook")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "facebook" 
                ? "bg-white text-blue-600 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Facebook className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xs:inline">Facebook</span>
          </button>
          
          <button
            onClick={() => setActiveTab("twitter")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "twitter" 
                ? "bg-white text-slate-950 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Twitter className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xs:inline">Twitter / X</span>
          </button>

          <button
            onClick={() => setActiveTab("linkedin")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "linkedin" 
                ? "bg-white text-sky-700 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Linkedin className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xs:inline">LinkedIn</span>
          </button>

          <button
            onClick={() => setActiveTab("discord")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "discord" 
                ? "bg-white text-indigo-600 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Discord</span>
          </button>
        </div>
      </div>

      {/* Preview Cards Container */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-center items-center min-h-[300px]">
        {/* Facebook Preview Card */}
        {activeTab === "facebook" && (
          <div className="w-full max-w-[520px] bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            {/* Header / Meta */}
            <div className="p-3 pb-2 flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                {domain[0]?.toUpperCase() || "L"}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">LinkScope User</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  Just now · <span className="text-[10px]">🌐</span>
                </div>
              </div>
            </div>

            {/* Post text */}
            <div className="px-3 pb-3 text-xs text-slate-800 leading-relaxed">
              Check out this interesting link! 🔍
            </div>

            {/* Main OG visual */}
            <div className="relative border-y border-[#E5E7EB] bg-slate-100 aspect-[1200/630] flex items-center justify-center overflow-hidden">
              {previewImage ? (
                <img
                  src={getProxiedUrl(previewImage)}
                  alt="Facebook OpenGraph preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback on broken image
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-1.5">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Missing og:image</span>
                </div>
              )}
            </div>

            {/* Text details */}
            <div className="p-3 bg-[#F2F3F5] hover:bg-[#EBECEE] transition-colors cursor-pointer">
              <div className="text-[10px] text-slate-500 uppercase font-medium tracking-wider mb-0.5 truncate">
                {domain}
              </div>
              <h4 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2">
                {previewTitle}
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-1 line-clamp-2">
                {previewDesc}
              </p>
            </div>
          </div>
        )}

        {/* Twitter / X Preview Card */}
        {activeTab === "twitter" && (
          <div className="w-full max-w-[500px] bg-slate-950 text-white rounded-xl border border-slate-800 p-4 shadow-sm font-sans">
            {/* Header meta */}
            <div className="flex gap-2.5 items-start mb-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-sm">
                X
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-bold truncate">LinkScope Agent</span>
                  <span className="text-[12px] text-slate-500 truncate">@LinkScopeApp · 1m</span>
                </div>
                <p className="text-[13px] text-slate-200 mt-1 leading-normal">
                  Inspecting meta cards in dark mode is clean! 👇
                </p>
              </div>
            </div>

            {/* Twitter Card UI */}
            {isLargeImage ? (
              /* Summary Large Image layout */
              <div className="border border-slate-800 rounded-2xl overflow-hidden hover:bg-slate-900/50 transition-colors cursor-pointer ml-11">
                <div className="aspect-[1200/630] bg-slate-900 border-b border-slate-800 flex items-center justify-center relative">
                  {twitterImage ? (
                    <img
                      src={getProxiedUrl(twitterImage)}
                      alt="Twitter Card preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center gap-1.5">
                      <ImageIcon className="w-8 h-8 opacity-30" />
                      <span className="text-[10px] font-medium uppercase tracking-wide">No twitter:image found</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <span className="text-[11px] text-slate-500">{domain.toLowerCase()}</span>
                  <h4 className="text-[13px] font-bold text-slate-100 mt-0.5 line-clamp-1 leading-tight">
                    {twitterTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {twitterDesc}
                  </p>
                </div>
              </div>
            ) : (
              /* Standard summary small card layout */
              <div className="border border-slate-800 rounded-2xl overflow-hidden hover:bg-slate-900/50 transition-colors cursor-pointer ml-11 flex h-[100px]">
                <div className="w-[100px] h-[100px] flex-shrink-0 bg-slate-900 border-r border-slate-800 flex items-center justify-center">
                  {twitterImage ? (
                    <img
                      src={getProxiedUrl(twitterImage)}
                      alt="Twitter Small Card preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-600 opacity-30" />
                  )}
                </div>
                <div className="p-2.5 flex-1 min-w-0 flex flex-col justify-center">
                  <span className="text-[11px] text-slate-500">{domain.toLowerCase()}</span>
                  <h4 className="text-[12px] font-bold text-slate-100 leading-tight truncate mt-0.5">
                    {twitterTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {twitterDesc}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LinkedIn Preview Card */}
        {activeTab === "linkedin" && (
          <div className="w-full max-w-[500px] bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            {/* Poster Header */}
            <div className="p-3 flex items-start gap-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-base font-display">
                L
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-950 flex items-center gap-1.5">
                  Professional Link Analyst
                  <span className="text-[10px] text-slate-400 font-normal">· 1st</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">Web Inspector & SEO Engineer</p>
                <p className="text-[10px] text-slate-400 mt-0.5">1h · 🌐</p>
              </div>
            </div>

            {/* Post text */}
            <div className="p-3 pb-2.5 text-xs text-slate-800 leading-relaxed">
              We just crawled metadata for this amazing page! Recommended read. 👇
            </div>

            {/* Visual Box */}
            <div className="border-t border-slate-200 relative aspect-[1200/630] bg-slate-50 flex items-center justify-center">
              {previewImage ? (
                <img
                  src={getProxiedUrl(previewImage)}
                  alt="LinkedIn OpenGraph preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-1.5">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Missing Image Preview</span>
                </div>
              )}
            </div>

            {/* Information Sub-Card */}
            <div className="p-3 border-t border-[#E5E7EB] hover:bg-slate-50 cursor-pointer">
              <h4 className="text-[13px] font-bold text-slate-900 leading-tight line-clamp-1">
                {previewTitle}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{domain}</p>
            </div>
          </div>
        )}

        {/* Discord Preview Card */}
        {activeTab === "discord" && (
          <div className="w-full max-w-[500px] bg-[#2F3136] rounded-md p-4 text-[#DCDDDE] font-sans text-xs">
            {/* Header info */}
            <div className="flex gap-2 items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-[#5865F2] text-white flex items-center justify-center font-bold text-[10px]">
                D
              </div>
              <span className="font-bold text-[#FFFFFF] hover:underline cursor-pointer">Discord Bot</span>
              <span className="bg-[#5865F2] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase scale-90 origin-left">
                BOT
              </span>
              <span className="text-[10px] text-[#72767D]">Today at 12:00 PM</span>
            </div>

            {/* Embed layout */}
            <div className="border-l-4 border-blue-500 bg-[#202225] p-3.5 rounded-r-md flex flex-col sm:flex-row gap-4 justify-between items-start">
              {/* Left Column Content */}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-[#B9BBBE] hover:underline cursor-pointer" title={previewSiteName}>
                  {previewSiteName}
                </span>
                
                <h4 className="text-[14px] font-bold text-[#00AFF4] hover:underline cursor-pointer mt-1 font-sans leading-snug line-clamp-2">
                  {previewTitle}
                </h4>
                
                <p className="text-[12px] text-[#DCDDDE] leading-relaxed mt-2 line-clamp-3">
                  {previewDesc}
                </p>
              </div>

              {/* Right Column Thumbnail (or below on mobile) */}
              {previewImage && (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-[#2f3136] flex-shrink-0 flex items-center justify-center border border-slate-700">
                  <img
                    src={getProxiedUrl(previewImage)}
                    alt="Discord thumbnail"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Meta tags analysis footer */}
      <div className="mt-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${previewImage ? "bg-emerald-500" : "bg-amber-400"}`} />
          {previewImage ? "Social thumbnail image resolved successfully." : "No explicit social sharing image found. Standard web crawler might fail back."}
        </span>
        <a 
          href={`https://metatags.io/?url=${encodeURIComponent(result.general.url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
        >
          Metatags validator
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
