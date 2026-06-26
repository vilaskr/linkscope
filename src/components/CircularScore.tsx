import { useEffect, useState } from "react";
import { Check, X, Award, AlertCircle, Sparkles } from "lucide-react";
import { InspectionResult } from "../types";

interface CircularScoreProps {
  result: InspectionResult;
}

export default function CircularScore({ result }: CircularScoreProps) {
  const { score, rating } = result.seoScore;
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animates score number counting up
  useEffect(() => {
    setAnimatedScore(0);
    const duration = 1000; // 1s
    const startTime = performance.now();

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const easedProgress = progress * (2 - progress);
      setAnimatedScore(Math.round(easedProgress * score));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);

  // Determine colors based on rating
  let strokeColor = "stroke-emerald-500";
  let textColor = "text-emerald-600";
  let bgColor = "bg-emerald-50/50 border-emerald-100";
  let badgeColor = "bg-emerald-500 text-white";
  let ratingIcon = <Award className="w-5 h-5 text-emerald-500" />;

  if (rating === "Good") {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-600";
    bgColor = "bg-amber-50/50 border-amber-100";
    badgeColor = "bg-amber-500 text-white";
    ratingIcon = <Award className="w-5 h-5 text-amber-500" />;
  } else if (rating === "Needs Improvement") {
    strokeColor = "stroke-orange-500";
    textColor = "text-orange-600";
    bgColor = "bg-orange-50/50 border-orange-100";
    badgeColor = "bg-orange-500 text-white";
    ratingIcon = <AlertCircle className="w-5 h-5 text-orange-500" />;
  } else if (rating === "Poor") {
    strokeColor = "stroke-red-500";
    textColor = "text-red-600";
    bgColor = "bg-red-50/50 border-red-100";
    badgeColor = "bg-red-500 text-white";
    ratingIcon = <AlertCircle className="w-5 h-5 text-red-500" />;
  }

  // Calculate circumference of circular path (r = 54)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Rules Audit data
  const audits = [
    {
      name: "Title Tag",
      points: 15,
      passed: result.seo.title.length > 0,
      description: result.seo.title.length > 0 
        ? `"${result.seo.title.substring(0, 40)}${result.seo.title.length > 40 ? "..." : ""}"`
        : "Missing meta title tag",
    },
    {
      name: "Meta Description",
      points: 15,
      passed: result.seo.description.length > 0,
      description: result.seo.description.length > 0 
        ? `"${result.seo.description.substring(0, 40)}${result.seo.description.length > 40 ? "..." : ""}"`
        : "Missing description for search results",
    },
    {
      name: "Open Graph Tags",
      points: 15,
      passed: !!(result.openGraph.title || result.openGraph.image || result.openGraph.description),
      description: (result.openGraph.title || result.openGraph.image || result.openGraph.description)
        ? "Facebook / LinkedIn meta tags configured"
        : "Missing Facebook OpenGraph protocol",
    },
    {
      name: "Twitter Card Info",
      points: 10,
      passed: !!(result.twitterCard.card || result.twitterCard.title || result.twitterCard.image),
      description: (result.twitterCard.card || result.twitterCard.title || result.twitterCard.image)
        ? "Twitter / X card metadata configured"
        : "Missing Twitter Cards protocol",
    },
    {
      name: "Canonical Link",
      points: 10,
      passed: result.seo.canonical.length > 0,
      description: result.seo.canonical.length > 0 
        ? "Canonical URL defined to avoid duplication"
        : "No canonical link found",
    },
    {
      name: "Robots Directive",
      points: 10,
      passed: result.seo.robots.length > 0,
      description: result.seo.robots.length > 0 
        ? `Crawling rules configured: "${result.seo.robots}"`
        : "No robots meta tag specified",
    },
    {
      name: "Favicon Setup",
      points: 10,
      passed: result.branding.favicon.length > 0,
      description: result.branding.favicon ? "Favicon icon present" : "No favicon configured",
    },
    {
      name: "Viewport Optimization",
      points: 10,
      passed: result.technical.viewport.length > 0,
      description: result.technical.viewport ? "Responsive layout enabled" : "Missing viewport tag",
    },
    {
      name: "HTTPS Protection",
      points: 5,
      passed: result.general.isHttps,
      description: result.general.isHttps ? "Secure connection active" : "Unsecure HTTP connection",
    },
    {
      name: "Theme Color Accent",
      points: 5,
      passed: result.branding.themeColor.length > 0,
      description: result.branding.themeColor ? `Color: ${result.branding.themeColor}` : "No meta theme-color configured",
    },
  ];

  return (
    <div id="score-card" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row gap-8 items-center md:items-stretch">
      {/* Circle Panel */}
      <div className="flex flex-col items-center justify-center text-center md:border-r md:border-slate-100 md:pr-8 min-w-[200px]">
        <div className="relative w-36 h-36 flex items-center justify-center mb-4">
          {/* Background Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="fill-transparent stroke-slate-100"
              strokeWidth="10"
            />
            {/* Animated Score Ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className={`fill-transparent ${strokeColor} transition-all duration-1000 ease-out`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Inner Score Label */}
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold font-display text-slate-900 tracking-tight">{animatedScore}</span>
            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-0.5">SCORE</span>
          </div>
        </div>

        {/* Badge and Rating */}
        <div className={`px-4 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 mb-2 ${bgColor}`}>
          {ratingIcon}
          <span className={textColor}>{rating}</span>
        </div>
        <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
          Based on 10 SEO, social media, and markup directives audits.
        </p>
      </div>

      {/* Audit Checklist Panel */}
      <div className="flex-1 w-full flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3.5 flex items-center gap-1.5 font-display">
            <Sparkles className="w-4 h-4 text-blue-500" />
            SEO & Technical Quality Audit
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {audits.map((audit) => (
              <div 
                key={audit.name} 
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs transition-all ${
                  audit.passed 
                    ? "bg-slate-50/30 border-slate-100" 
                    : "bg-red-50/10 border-red-100/50"
                }`}
              >
                <div className={`mt-0.5 p-0.5 rounded-full ${
                  audit.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                }`}>
                  {audit.passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-slate-800 truncate pr-1">{audit.name}</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                      audit.passed ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
                    }`}>
                      {audit.passed ? `+${audit.points}` : "0"} pts
                    </span>
                  </div>
                  <p className="text-slate-500 truncate text-[11px]" title={audit.description}>
                    {audit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
