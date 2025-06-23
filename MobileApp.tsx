import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Home, Search, Plus, Bell, User, Heart, MessageCircle, Share, Bookmark as BookmarkIcon, Menu, X, Camera, Upload, Edit3, Gift, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { type Post, type Category, type UserProfile } from "@shared/schema";
import { AdMobBanner } from "@/components/AdMobBanner";
import { useInterstitialAd } from "@/components/AdMobInterstitial";
import { useRewardedAd } from "@/components/AdMobRewarded";
import { InstallPrompt, UpdatePrompt } from "@/components/InstallPrompt";
import { NotificationManager } from "@/components/NotificationManager";
import { usePWA } from "@/hooks/usePWA";

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "", imageUrl: "" });
  const [userCoins, setUserCoins] = useState(100);
  const [postCount, setPostCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // AdMob Integration
  const { showAd: showInterstitial } = useInterstitialAd();
  const { showAd: showRewardedAd } = useRewardedAd((reward) => {
    setUserCoins(prev => prev + reward.amount);
    toast({ 
      title: "Reward Earned!", 
      description: `You earned ${reward.amount} ${reward.type}!` 
    });
  });

  // PWA Integration
  const { isOnline, sendNotification } = usePWA();

  // Queries
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["/api/profile", 1],
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: (postData: any) => apiRequest("/api/posts", "POST", postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setShowCreatePost(false);
      setNewPost({ title: "", content: "", tags: "", imageUrl: "" });
      toast({ title: "Post created successfully!" });
      
      // Send notification for new post
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        sendNotification("Post Published!", {
          body: `Your post "${newPost.title}" has been published successfully`,
          tag: "post-created"
        });
      }
    },
  });

  const likePostMutation = useMutation({
    mutationFn: (postId: number) => apiRequest(`/api/posts/${postId}/like`, "POST", { userId: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) {
      toast({ title: "Please fill in all required fields" });
      return;
    }

    // Show interstitial ad every 3rd post
    setPostCount(prev => {
      const newCount = prev + 1;
      if (newCount % 3 === 0) {
        showInterstitial();
      }
      return newCount;
    });

    createPostMutation.mutate({
      ...newPost,
      userId: 1,
      tags: newPost.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      isPublished: true
    });
  };

  const handleLike = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="mb-4 shadow-sm border-0 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userProfile?.avatar} />
            <AvatarFallback className="bg-blue-500 text-white">
              {userProfile?.displayName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{userProfile?.displayName || "User"}</h4>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h3 className="font-bold text-lg mb-2">{post.title}</h3>
        <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
        
        {post.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img src={post.imageUrl} alt="Post image" className="w-full h-48 object-cover" />
          </div>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(post.id)}
              className="text-gray-600 hover:text-red-500 p-1"
            >
              <Heart className="w-5 h-5 mr-1" />
              {post.likes || 0}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 p-1">
              <MessageCircle className="w-5 h-5 mr-1" />
              0
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-600 p-1">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 p-1">
              <BookmarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CreatePostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-lg sm:max-h-[80vh] max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Create Post</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreatePost(false)}
            className="p-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <Input
            placeholder="Post title..."
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <Textarea
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
            rows={4}
          />
          
          <Input
            placeholder="Image URL (optional)"
            value={newPost.imageUrl}
            onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
          />
          
          <Input
            placeholder="Tags (comma-separated)"
            value={newPost.tags}
            onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
          />
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCreatePost(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              onClick={handleCreatePost}
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="pb-20">
            {/* Stories Section */}
            <div className="bg-white mb-2 p-4">
              <div className="flex space-x-3 overflow-x-auto">
                <div className="flex flex-col items-center space-y-1 min-w-[60px]">
                  <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-blue-500">
                      <AvatarImage src={userProfile?.avatar} />
                      <AvatarFallback className="bg-blue-500 text-white">You</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <span className="text-xs">Your Story</span>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center space-y-1 min-w-[60px]">
                    <Avatar className="w-14 h-14 border-2 border-gray-300">
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">User {i}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-0">
              {posts.map((post, index) => (
                <div key={post.id}>
                  <PostCard post={post} />
                  {/* Show ad every 3rd post */}
                  {(index + 1) % 3 === 0 && (
                    <div className="bg-gray-50 py-4 border-b">
                      <div className="text-center text-xs text-gray-500 mb-2">Sponsored</div>
                      <AdMobBanner size="mediumRectangle" className="mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case "search":
        return (
          <div className="p-4 pb-20">
            <div className="mb-4">
              <Input placeholder="Search posts, users, tags..." className="w-full" />
            </div>
            
            {/* Native Ad */}
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-xs text-blue-600 mb-2 font-medium">SPONSORED</div>
              <AdMobBanner size="largeBanner" className="mx-auto" />
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Card key={category.id} className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["#technology", "#design", "#photography", "#travel", "#food", "#lifestyle"].map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "profile":
        return (
          <div className="pb-20">
            {/* Profile Header */}
            <div className="bg-white p-6 text-center border-b">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={userProfile?.avatar} />
                <AvatarFallback className="bg-blue-500 text-white text-2xl">
                  {userProfile?.displayName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-bold text-xl">{userProfile?.displayName || "Your Name"}</h2>
              <p className="text-gray-600 mb-2">@{userProfile?.userId || "username"}</p>
              <p className="text-sm text-gray-700 mb-4">{userProfile?.bio || "Tell us about yourself..."}</p>
              
              <div className="flex justify-center space-x-8 mb-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{posts.length}</div>
                  <div className="text-xs text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{userProfile?.followers || 0}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{userProfile?.following || 0}</div>
                  <div className="text-xs text-gray-500">Following</div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mb-2">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {/* User Posts */}
            <div className="space-y-0">
              {posts.filter(post => post.userId === 1).map((post, index) => (
                <div key={post.id}>
                  <PostCard post={post} />
                  {index === 2 && (
                    <div className="bg-yellow-50 p-4 border-b">
                      <div className="text-center">
                        <div className="text-xs text-yellow-700 mb-2">EARN REWARDS</div>
                        <Button 
                          onClick={showRewardedAd}
                          className="bg-green-500 hover:bg-green-600 text-white"
                          size="sm"
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Watch Ad for Coins
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-4 pb-20 text-center">
            <h3 className="font-semibold">Coming Soon</h3>
            <p className="text-gray-600">This feature is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-bold text-xl text-blue-600">SkylWorld</h1>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">{userCoins}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={showRewardedAd}
          >
            <Gift className="w-5 h-5 text-green-600" />
          </Button>
          <NotificationManager />
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Top Banner Ad */}
      <div className="bg-gray-50 py-2">
        <AdMobBanner size="banner" className="mx-auto" />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg z-30"
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex justify-around py-2">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "search", icon: Search, label: "Search" },
            { id: "notifications", icon: Bell, label: "Notifications" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 ${
                activeTab === tab.id ? "text-blue-500" : "text-gray-600"
              }`}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-xs z-50">
          You're offline. Some features may not work properly.
        </div>
      )}

      {/* PWA Prompts */}
      <InstallPrompt />
      <UpdatePrompt />

      {/* Create Post Modal */}
      {showCreatePost && <CreatePostModal />}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Menu</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowMobileMenu(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                <User className="w-5 h-5 mr-3" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <BookmarkIcon className="w-5 h-5 mr-3" />
                Saved Posts
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Camera className="w-5 h-5 mr-3" />
                Camera
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}