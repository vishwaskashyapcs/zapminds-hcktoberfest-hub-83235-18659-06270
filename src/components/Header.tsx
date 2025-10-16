import { useState } from "react";
import { Menu, X, Upload, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import zapcomLogo from "@/assets/zapcom-logo.png";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "participants", label: "Participants" },
  { id: "rules", label: "Rules" },
  { id: "gallery", label: "Project Gallery" },
  { id: "updates", label: "Updates" },
  { id: "discussions", label: "Discussions" },
];

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={zapcomLogo} alt="Zapcom" className="h-10 w-auto" />
            <div>
              <div className="font-bold text-lg leading-tight">Zapminds</div>
              <div className="text-xs text-muted-foreground">Innovation by Zapcom</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className="relative"
                  onClick={() => onTabChange(tab.id)}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Button>
              ))}
            </nav>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/submit-project')}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Submit Project
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/post-update')}
                className="gap-2"
              >
                <Megaphone className="w-4 h-4" />
                Post Update
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  {tab.label}
                </Button>
              ))}
              
              {/* Mobile Action Buttons */}
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/submit-project');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Submit Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/post-update');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Megaphone className="w-4 h-4" />
                  Post Update
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
