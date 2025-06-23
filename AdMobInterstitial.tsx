import { useEffect } from "react";

interface AdMobInterstitialProps {
  adUnitId?: string;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
}

export function AdMobInterstitial({
  adUnitId = "YOUR_INTERSTITIAL_AD_UNIT_ID", // Replace with your actual interstitial ad unit ID
  onAdLoaded,
  onAdFailedToLoad,
  onAdOpened,
  onAdClosed
}: AdMobInterstitialProps) {

  useEffect(() => {
    // In a real mobile app, this would use the AdMob SDK
    // For web, we'll simulate the interstitial behavior
    const loadInterstitialAd = () => {
      console.log("Loading interstitial ad...");
      
      // Simulate ad loading
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        
        if (success) {
          console.log("Interstitial ad loaded successfully");
          onAdLoaded?.();
        } else {
          console.log("Failed to load interstitial ad");
          onAdFailedToLoad?.("Network error");
        }
      }, 1000);
    };

    loadInterstitialAd();
  }, [onAdLoaded, onAdFailedToLoad]);

  const showInterstitial = () => {
    console.log("Showing interstitial ad...");
    onAdOpened?.();
    
    // Simulate ad display duration
    setTimeout(() => {
      console.log("Interstitial ad closed");
      onAdClosed?.();
    }, 3000);
  };

  // This component doesn't render anything visible
  // In a real app, the interstitial would be shown programmatically
  return null;
}

export const useInterstitialAd = (adUnitId?: string) => {
  const showAd = () => {
    // In a real mobile app, this would show the interstitial
    console.log("Showing interstitial ad with unit ID:", adUnitId);
    
    // Create overlay for web demo
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-family: Arial, sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 24px; margin-bottom: 20px;">📱 Interstitial Ad</div>
        <div style="margin-bottom: 20px;">This would be your AdMob interstitial ad</div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
          Close Ad (×)
        </button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
    }, 5000);
  };

  return { showAd };
};