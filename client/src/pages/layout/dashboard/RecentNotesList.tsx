import { Bookmark, Star } from "lucide-react";
import React from "react";

const notes = [
  { id: 1, title: "Design system notes", preview: "Ideas for colors, spacing, tokens...", tags: ["design", "ui"], time: "2h ago", fav: true },
  { id: 2, title: "Weekly plan", preview: "Tasks to ship the editor MVP.", tags: ["planning"], time: "Yesterday", fav: false },
  { id: 3, title: "AI prompt experiments", preview: "Testing summarization prompts...", tags: ["ai", "research"], time: "Mon", fav: false },
];

const RecentNotesList: React.FC = () => {
  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div key={note.id} className="rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{note.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{note.preview}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">{note.time}</p>
              <div className="mt-2 flex justify-end">
                {note.fav ?
                  <Star className="h-4 w-4 text-primary" />
                : <Bookmark className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentNotesList;
