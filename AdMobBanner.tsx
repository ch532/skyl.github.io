import { useEffect, useRef } from "react";

interface AdMobBannerProps {
  adUnitId?: string;
  size?: "banner" | "largeBanner" | "mediumRectangle" | "fullBanner" | "leaderboard";
  className?: string;
}

export function AdMobBanner({ 
  adUnitId = "YOUR_BANNER_AD_UNIT_ID", // Replace with your actual banner ad unit ID
  size = "banner",
  className = ""
}: AdMobBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  const adSizes = {
    banner: { width: 320, height: 50 },
    largeBanner: { width: 320, height: 100 },
    mediumRectangle: { width: 300, height: 250 },
    fullBanner: { width: 468, height: 60 },
    leaderboard: { width: 728, height: 90 }
  };

  const adSize = adSizes[size];

  useEffect(() => {
    if (adRef.current) {
      // Load AdSense script if not already loaded
      if (!window.adsbygoogle) {
        const script = document.createElement('script');
        script.async = true;
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_ADMOB_PUBLISHER_ID";
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
        
        script.onload = () => {
          try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          } catch (e) {
            console.log("AdSense error:", e);
          }
        };
      } else {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (e) {
          console.log("AdSense error:", e);
        }
      }
    }
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: adSize.width,
          height: adSize.height,
        }}
        data-ad-client="YOUR_ADMOB_PUBLISHER_ID"
        data-ad-slot={adUnitId.split('/').pop()}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Declare global adsbygoogle for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}