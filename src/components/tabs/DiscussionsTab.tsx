import { useState, useEffect } from "react";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const categories = ["All", "Team Formation", "Tech Q&A", "Rules", "Logistics"];

export const DiscussionsTab = () => {
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showNewThread, setShowNewThread] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    authorName: "",
    authorEmail: "",
    category: "Tech Q&A",
  });

  useEffect(() => {
    fetchDiscussions();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('discussions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'discussions' }, () => {
        fetchDiscussions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await ((supabase as any)
        .from('discussions'))
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading discussions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await ((supabase as any).from('discussions')).insert({
        title: formData.title,
        content: formData.content,
        author_name: formData.authorName,
        author_email: formData.authorEmail,
        category: formData.category,
      });

      if (error) throw error;

      toast({
        title: "Discussion Created!",
        description: "Your thread has been posted.",
      });
      
      setFormData({ title: "", content: "", authorName: "", authorEmail: "", category: "Tech Q&A" });
      setShowNewThread(false);
    } catch (error: any) {
      toast({
        title: "Failed to Create Discussion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredDiscussions = activeCategory === "All" 
    ? discussions 
    : discussions.filter(d => d.category === activeCategory);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading discussions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Discussions</h1>
            <p className="text-lg text-muted-foreground">
              Connect with participants and get your questions answered
            </p>
          </div>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => setShowNewThread(true)}>
            <MessageCircle className="w-5 h-5 mr-2" />
            New Thread
          </Button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button 
              key={cat} 
              variant={cat === activeCategory ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Thread List */}
        <div className="space-y-4">
          {filteredDiscussions.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="p-12 text-center text-muted-foreground">
                No discussions yet. Start the conversation!
              </CardContent>
            </Card>
          ) : (
            filteredDiscussions.map((thread) => (
              <Card key={thread.id} className="shadow-soft hover:shadow-medium transition-all hover:scale-[1.01] cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{thread.title}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>by {thread.author_name}</span>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          {thread.category}
                        </Badge>
                        <span>•</span>
                        <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{thread.content}</p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {thread.replies || 0} replies
                    </span>
                    <span className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      {thread.likes || 0} likes
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Popular Topics */}
        <Card className="mt-12 shadow-medium">
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Team Building", "React", "AI/ML", "AWS", "Docker", "UI/UX", "API Integration", "Testing"].map(
                (topic) => (
                  <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-muted">
                    {topic}
                  </Badge>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Thread Dialog */}
      <Dialog open={showNewThread} onOpenChange={setShowNewThread}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Start a New Discussion</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What's your question or topic?"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== "All").map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Provide details about your discussion..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Your Name</Label>
                <Input
                  id="authorName"
                  placeholder="John Doe"
                  value={formData.authorName}
                  onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorEmail">Your Email</Label>
                <Input
                  id="authorEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData({...formData, authorEmail: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowNewThread(false)}>
                Cancel
              </Button>
              <Button type="submit">Post Discussion</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
