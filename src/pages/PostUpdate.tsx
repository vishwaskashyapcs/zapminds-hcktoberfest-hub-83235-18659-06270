import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UpdatesForm } from "@/components/UpdatesForm";
import zapcomLogo from "@/assets/zapcom-logo.png";

const PostUpdate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={zapcomLogo} alt="Zapcom" className="h-10 w-auto" />
              <div>
                <div className="font-bold text-lg leading-tight">Zapminds</div>
                <div className="text-xs text-muted-foreground">Innovation by Zapcom</div>
              </div>
            </div>
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Post an Update</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Keep the community informed about important announcements
          </p>
        </div>
        <UpdatesForm />
      </main>
      
      <footer className="py-8 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Zapcom Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PostUpdate;
