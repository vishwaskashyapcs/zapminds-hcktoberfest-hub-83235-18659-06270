import { useState, useEffect } from "react";
import { Search, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTeamDialog } from "@/components/CreateTeamDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const filters = ["All", "Engineers", "Designers", "PM/BA", "AI/Data"];

export const ParticipantsTab = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  useEffect(() => {
    fetchParticipants();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('participants-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        fetchParticipants();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await ((supabase as any)
        .from('participants'))
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading participants",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.skills && p.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesFilter = activeFilter === "All" || 
                         (activeFilter === "Engineers" && p.role.includes("Engineer")) ||
                         (activeFilter === "Designers" && p.role.includes("Designer")) ||
                         (activeFilter === "PM/BA" && p.role.includes("Product")) ||
                         (activeFilter === "AI/Data" && (p.role.includes("AI") || p.role.includes("Data")));
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading participants...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Participants</h1>
          <p className="text-lg text-muted-foreground">
            Connect with fellow innovators and form your dream team
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by name, role, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Participant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredParticipants.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No participants found. Be the first to register!
            </div>
          ) : (
            filteredParticipants.map((participant) => (
              <Card key={participant.id} className="shadow-soft hover:shadow-medium transition-all hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{participant.avatar_emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{participant.name}</h3>
                      <p className="text-sm text-muted-foreground">{participant.role}</p>
                    </div>
                  </div>

                  {participant.skills && participant.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {participant.skills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {participant.team_name ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Team: {participant.team_name}</span>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Invite to Team
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Team CTA */}
        <Card className="shadow-medium bg-gradient-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Don't have a team yet?</h2>
            <p className="mb-6 text-primary-foreground/90">
              Create your own team and start inviting talented participants!
            </p>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => setShowCreateTeam(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <CreateTeamDialog 
        open={showCreateTeam} 
        onClose={() => setShowCreateTeam(false)}
        onSuccess={fetchParticipants}
      />
    </div>
  );
};
