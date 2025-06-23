import { useState, useEffect } from "react";

interface AdMobRewardedProps {
  adUnitId?: string;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onRewarded?: (reward: { type: string; amount: number }) => void;
}

export function AdMobRewarded({
  adUnitId = "YOUR_REWARDED_AD_UNIT_ID", // Replace with your actual rewarded ad unit ID
  onAdLoaded,
  onAdFailedToLoad,
  onAdOpened,
  onAdClosed,
  onRewarded
}: AdMobRewardedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadRewardedAd = () => {
      console.log("Loading rewarded ad...");
      
      setTimeout(() => {
        const success = Math.random() > 0.15; // 85% success rate
        
        if (success) {
          console.log("Rewarded ad loaded successfully");
          setIsLoaded(true);
          onAdLoaded?.();
        } else {
          console.log("Failed to load rewarded ad");
          setIsLoaded(false);
          onAdFailedToLoad?.("Network error");
        }
      }, 1500);
    };

    loadRewardedAd();
  }, [onAdLoaded, onAdFailedToLoad]);

  return null;
}

export const useRewardedAd = (onRewarded?: (reward: { type: string; amount: number }) => void) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadAd = () => {
    console.log("Loading rewarded ad...");
    setTimeout(() => {
      setIsLoaded(true);
      console.log("Rewarded ad loaded");
    }, 1000);
  };

  const showAd = () => {
    if (!isLoaded) {
      console.log("Rewarded ad not loaded yet");
      return;
    }

    console.log("Showing rewarded ad...");
    
    // Create reward ad overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-family: Arial, sans-serif;
    `;
    
    let countdown = 15;
    
    const updateContent = () => {
      overlay.innerHTML = `
        <div style="text-align: center; padding: 20px; max-width: 400px;">
          <div style="font-size: 28px; margin-bottom: 15px;">🎁 Rewarded Ad</div>
          <div style="margin-bottom: 20px; font-size: 16px;">Watch this ad to earn rewards!</div>
          <div style="margin-bottom: 20px; font-size: 18px; color: #ffd700;">
            ${countdown > 0 ? `Please wait ${countdown} seconds...` : 'Ad completed! Claiming reward...'}
          </div>
          <div style="margin-bottom: 20px;">
            <div style="width: 100%; height: 8px; background: #333; border-radius: 4px; overflow: hidden;">
              <div style="width: ${((15 - countdown) / 15) * 100}%; height: 100%; background: #007bff; transition: width 0.3s;"></div>
            </div>
          </div>
          ${countdown <= 0 ? `
            <button onclick="this.parentElement.parentElement.remove(); window.dispatchEvent(new CustomEvent('rewardEarned'))"
                    style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px;">
              Claim Reward! ✨
            </button>
          ` : `
            <button onclick="this.parentElement.parentElement.remove()"
                    style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
              Skip (No Reward)
            </button>
          `}
        </div>
      `;
    };

    updateContent();
    document.body.appendChild(overlay);

    // Countdown timer
    const timer = setInterval(() => {
      countdown--;
      updateContent();
      
      if (countdown <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    // Listen for reward claim
    const handleReward = () => {
      setIsLoaded(false);
      onRewarded?.({ type: "coins", amount: 50 });
      window.removeEventListener('rewardEarned', handleReward);
    };
    
    window.addEventListener('rewardEarned', handleReward);
  };

  useEffect(() => {
    loadAd();
  }, []);

  return { showAd, isLoaded, loadAd };
};