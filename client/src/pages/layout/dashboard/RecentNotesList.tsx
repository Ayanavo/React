import React from "react";
import { Star, Bookmark } from "lucide-react";

const notes = [
  { id: 1, title: "Design system notes", preview: "Ideas for colors, spacing, tokens...", tags: ["design", "ui"], time: "2h ago", fav: true },
  { id: 2, title: "Weekly plan", preview: "Tasks to ship the editor MVP.", tags: ["planning"], time: "Yesterday", fav: false },
  { id: 3, title: "AI prompt experiments", preview: "Testing summarization prompts...", tags: ["ai", "research"], time: "Mon", fav: false },
];

const NoteCard: React.FC<{ n: any }> = ({ n }) => {
  return (
    <div className="p-4 rounded-2xl bg-card/75 border border-border shadow-sm transition hover:bg-card/95">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-foreground">{n.title}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{n.preview}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {n.tags.map((t: string) => (
              <span key={t} className="text-xs bg-accent/10 px-2 py-1 rounded-full text-accent-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-xs text-right">
          <div>{n.time}</div>
          <div className="mt-2">
            {n.fav ?
              <Star className="w-4 h-4 text-accent-foreground" />
            : <Bookmark className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentNotesList: React.FC = () => {
  return (
    <div>
      <h4 className="text-md font-medium text-foreground mb-3">Recent Notes</h4>
      <div className="space-y-3">
        {notes.map((n) => (
          <NoteCard key={n.id} n={n} />
        ))}
      </div>
    </div>
  );
};

export default RecentNotesList;
