import { useState, useEffect } from "react";
import { Search, Grid3x3, List, Heart, Eye, ExternalLink, Github, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const tags = [
  "All", "AI/ML", "Web", "Mobile", "Cloud", "Automation", 
  "Data/Analytics", "DevTools", "HealthTech", "FinTech", 
  "Sustainability", "Open Source"
];

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "liked", label: "Most Liked" },
  { value: "judges", label: "Judges' Picks" },
  { value: "alpha", label: "Alphabetical (A–Z)" },
];

export const ProjectGalleryTab = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>(["All"]);
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data, error } = await ((supabase as any)
        .from("projects"))
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error("Failed to load projects");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Set up realtime subscription
    const channel = supabase
      .channel("projects_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleTag = (tag: string) => {
    if (tag === "All") {
      setActiveTags(["All"]);
    } else {
      const newTags = activeTags.includes(tag)
        ? activeTags.filter((t) => t !== tag)
        : [...activeTags.filter((t) => t !== "All"), tag];
      setActiveTags(newTags.length === 0 ? ["All"] : newTags);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTags =
      activeTags.includes("All") || p.tags?.some((t: string) => activeTags.includes(t));

    return matchesSearch && matchesTags;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "liked":
        return b.likes - a.likes;
      case "judges":
        return b.judgesPick ? 1 : -1;
      case "alpha":
        return a.title.localeCompare(b.title);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Project Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Explore innovative submissions from Hacktoberfest 2025
        </p>
      </div>

      {/* Controls */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm py-4 mb-8 space-y-4 border-b border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-input rounded-md bg-background"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={activeTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No projects match your filters. Clear filters to see all projects.</p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {sortedProjects.map((project) => (
            <Card
              key={project.id}
              className="shadow-soft hover:shadow-medium transition-all hover:scale-[1.02] cursor-pointer overflow-hidden group"
              onClick={() => setSelectedProject(project)}
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={project.cover_image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary">
                    View Project
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{project.team_name}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags?.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {project.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {project.views}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Project Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
                <p className="text-muted-foreground">by {selectedProject.team_name}</p>
              </DialogHeader>

              <div className="space-y-6">
                {/* Media Gallery */}
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={selectedProject.cover_image || "/placeholder.svg"}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-3">
                  {selectedProject.demo_url && (
                    <Button size="sm" variant="default" asChild>
                      <a href={selectedProject.demo_url} target="_blank" rel="noopener noreferrer">
                        <Play className="w-4 h-4 mr-2" />
                        Demo
                      </a>
                    </Button>
                  )}
                  {selectedProject.github_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={selectedProject.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {selectedProject.presentation_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={selectedProject.presentation_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Presentation
                      </a>
                    </Button>
                  )}
                </div>

                {/* Details Tabs */}
                <Tabs defaultValue="problem" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="problem">Problem</TabsTrigger>
                    <TabsTrigger value="solution">Solution</TabsTrigger>
                    <TabsTrigger value="tech">Tech Stack</TabsTrigger>
                    <TabsTrigger value="learnings">Learnings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="problem" className="mt-4">
                    <p className="text-muted-foreground">{selectedProject.problem || "No problem statement provided."}</p>
                  </TabsContent>
                  <TabsContent value="solution" className="mt-4">
                    <p className="text-muted-foreground">{selectedProject.solution || "No solution details provided."}</p>
                  </TabsContent>
                  <TabsContent value="tech" className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech_stack?.map((tech: string) => (
                        <Badge key={tech}>{tech}</Badge>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="learnings" className="mt-4">
                    <p className="text-muted-foreground">
                      {selectedProject.learnings || "Key insights and future improvements planned."}
                    </p>
                  </TabsContent>
                </Tabs>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex gap-6">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="w-5 h-5" />
                      {selectedProject.likes} likes
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="w-5 h-5" />
                      {selectedProject.views} views
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Share
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
