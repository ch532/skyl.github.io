import { WindowFrame } from "@/components/WindowFrame";
import { Sidebar } from "@/components/Sidebar";
import { Toolbar } from "@/components/Toolbar";
import { WebsiteEmbed } from "@/components/WebsiteEmbed";
import { RightAdColumn } from "@/components/RightAdColumn";
import { StatusBar } from "@/components/StatusBar";
import { NotificationToast } from "@/components/NotificationToast";
import { TopBanner } from "@/components/TopBanner";
import { useAppState } from "@/hooks/use-app-state";
import { addToHistory, addBookmark, showDesktopNotification } from "@/lib/desktop-utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { 
    state, 
    updateUrl, 
    setLoading, 
    setOffline, 
    setError, 
    addNotification, 
    removeNotification 
  } = useAppState();

  const [currentSection, setCurrentSection] = useState("home");
  const { toast } = useToast();

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    let url = "https://skyl.name.ng";
    
    switch (section) {
      case "services":
        url = "https://skyl.name.ng/services";
        break;
      case "portfolio":
        url = "https://skyl.name.ng/portfolio";
        break;
      case "contact":
        url = "https://skyl.name.ng/contact";
        break;
      case "settings":
        url = "https://skyl.name.ng/settings";
        break;
      case "history":
        url = "https://skyl.name.ng/history";
        break;
      default:
        url = "https://skyl.name.ng";
    }
    
    updateUrl(url);
    addToHistory(url, section.charAt(0).toUpperCase() + section.slice(1));
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
    addNotification({
      title: "Page Refreshed",
      message: "Content has been updated successfully.",
      type: "success"
    });
  };

  const handleToggleOffline = () => {
    const newOfflineState = !state.isOffline;
    setOffline(newOfflineState);
    addNotification({
      title: newOfflineState ? "Offline Mode" : "Online Mode",
      message: newOfflineState 
        ? "You're now browsing in offline mode." 
        : "You're back online.",
      type: "info"
    });
  };

  const handleBack = () => {
    addNotification({
      title: "Navigation",
      message: "Going back in history.",
      type: "info"
    });
  };

  const handleForward = () => {
    addNotification({
      title: "Navigation", 
      message: "Going forward in history.",
      type: "info"
    });
  };

  const handleReload = () => {
    handleRefresh();
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const handleBookmark = () => {
    addBookmark(state.currentUrl, currentSection);
    toast({
      title: "Bookmarked",
      description: "Page has been added to your bookmarks.",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Skyl - " + currentSection,
        url: state.currentUrl,
      });
    } else {
      navigator.clipboard.writeText(state.currentUrl);
      toast({
        title: "Link Copied",
        description: "URL has been copied to clipboard.",
      });
    }
  };

  const handleDownload = () => {
    addNotification({
      title: "Offline Content",
      message: "Page is being saved for offline viewing.",
      type: "success"
    });
  };

  const handleNotificationToggle = () => {
    addNotification({
      title: "New Content Available",
      message: "The website has been updated with new content.",
      type: "info"
    });
    showDesktopNotification("Skyl Desktop", "New content available!");
  };

  const handleMenuOpen = () => {
    toast({
      title: "Menu",
      description: "Desktop menu options would appear here.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <WindowFrame />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          onRefresh={handleRefresh}
          onToggleOffline={handleToggleOffline}
          isOffline={state.isOffline}
        />
        
        <div className="flex-1 flex flex-col">
          <Toolbar
            currentUrl={state.currentUrl}
            onBack={handleBack}
            onForward={handleForward}
            onReload={handleReload}
            onNotificationToggle={handleNotificationToggle}
            onMenuOpen={handleMenuOpen}
          />
          
          <TopBanner />
          
          <div className="flex-1 flex overflow-hidden">
            <WebsiteEmbed
              url={state.currentUrl}
              isLoading={state.isLoading}
              hasError={state.hasError}
              isOffline={state.isOffline}
              onLoadingChange={setLoading}
              onErrorChange={setError}
              onRetry={handleRetry}
            />
            
            <RightAdColumn
              onBookmark={handleBookmark}
              onShare={handleShare}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </div>
      
      <StatusBar
        connectionStatus={state.connectionStatus}
        lastSync={state.lastSync}
        cacheSize={state.cacheSize}
        isOffline={state.isOffline}
      />

      <div className="fixed bottom-4 right-4">
        <button 
          onClick={() => window.location.href = '/mobile'}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          View Mobile App
        </button>
      </div>

      {/* Render notifications */}
      {state.notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
}
