import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, MonitorPlay, Mic, Youtube, FileVideo } from "lucide-react";

interface PresetProps {
  onSelect: (preset: string) => void;
  selected?: string;
}

export function Presets({ onSelect, selected }: PresetProps) {
  const presets = [
    {
      id: "whatsapp",
      title: "WhatsApp Video",
      description: "Small size, good for mobile sharing and low bandwidth.",
      badge: "Good for low bandwidth",
      icon: Smartphone,
    },
    {
      id: "classroom",
      title: "Classroom Projector",
      description: "Clear 1080p MP4 for large screens and presentations.",
      badge: "Works well for LMS upload",
      icon: MonitorPlay,
    },
    {
      id: "submission",
      title: "Student Submission",
      description: "Balanced size and quality (720p).",
      badge: "Fast upload",
      icon: FileVideo,
    },
    {
      id: "podcast",
      title: "Podcast MP3",
      description: "High quality audio only.",
      icon: Mic,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {presets.map((p) => {
        const Icon = p.icon;
        const isSelected = selected === p.id;
        return (
          <Card
            key={p.id}
            className={`p-4 cursor-pointer transition-all ${
              isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
            onClick={() => onSelect(p.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{p.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                {p.badge && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-secondary/20 text-secondary-foreground text-[10px] rounded-full font-medium">
                    {p.badge}
                  </span>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
