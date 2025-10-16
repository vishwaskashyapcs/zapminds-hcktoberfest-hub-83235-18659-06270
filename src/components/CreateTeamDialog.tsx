import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTeamDialog = ({ open, onClose, onSuccess }: CreateTeamDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    creatorEmail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, get or create participant
      const { data: participant, error: participantError } = await ((supabase as any)
        .from('participants'))
        .select('id')
        .eq('email', formData.creatorEmail)
        .single();

      if (participantError) {
        toast({
          title: "Error",
          description: "Please register as a participant first before creating a team.",
          variant: "destructive",
        });
        return;
      }

      // Create team
      const { data: teamData, error: teamError } = await ((supabase as any).from('teams')).insert({
        name: formData.name,
        description: formData.description,
        created_by: participant?.id,
        looking_for_members: true,
      }).select().single();

      if (teamError) throw teamError;

      // Add creator as team member
      if (teamData && participant) {
        await ((supabase as any).from('team_members')).insert({
          team_id: teamData.id,
          participant_id: participant.id,
        });
      }

      toast({
        title: "Team Created! 🎉",
        description: `${formData.name} is now ready to recruit members.`,
      });
      
      setFormData({ name: "", description: "", creatorEmail: "" });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to Create Team",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Your Team</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              placeholder="Enter team name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's your team about?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your Email (from registration)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.creatorEmail}
              onChange={(e) => setFormData({...formData, creatorEmail: e.target.value})}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Team</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
