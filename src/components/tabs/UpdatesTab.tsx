import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const UpdatesTab = () => {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('updates-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'updates' }, () => {
        fetchUpdates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await ((supabase as any)
        .from('updates'))
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading updates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading updates...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Updates</h1>
          <p className="text-lg text-muted-foreground">
            Stay informed with the latest news and announcements
          </p>
        </div>

        <div className="space-y-6">
          {updates.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="p-12 text-center text-muted-foreground">
                No updates yet. Check back soon for announcements!
              </CardContent>
            </Card>
          ) : (
            updates.map((update) => (
              <Card key={update.id} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <CardTitle className="text-xl">{update.title}</CardTitle>
                    <Badge variant={update.type === "announcement" ? "default" : "secondary"}>
                      {update.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(update.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{update.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-12 shadow-medium bg-muted">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Want to receive updates via email?{" "}
              <a href="mailto:zapminds@zapcomgroup.com" className="text-primary hover:underline font-medium">
                Subscribe to our newsletter
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
