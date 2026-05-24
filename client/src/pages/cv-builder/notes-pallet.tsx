import React, { useEffect, useState } from "react";
import { getNotes, NoteRecord } from "@/shared/services/note";
import { useCV } from "@/lib/useCV";
import showToast from "@/hooks/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotesPallet = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedElementId, selectedElement, updateElement } = useCV();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getNotes()
      .then((res) => {
        if (mounted) setNotes(res);
      })
      .catch(() => showToast({ title: "Failed to load notes", variant: "error" }))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const insertNote = (note: NoteRecord) => {
    if (!selectedElementId) {
      showToast({ title: "Select a text box first", variant: "warning" });
      return;
    }

    // Insert into text
    if (selectedElement?.type === "text") {
      updateElement(selectedElementId, { content: note.body });
      showToast({ title: "Note inserted", variant: "success" });
      return;
    }

    // Insert into list: find first empty item or append
    if (selectedElement?.type === "list") {
      const items = Array.isArray(selectedElement.content) ? (selectedElement.content as string[]) : [""];
      const next = [...items];
      const emptyIndex = next.findIndex((i) => !i || i.trim() === "");
      if (emptyIndex >= 0) {
        next[emptyIndex] = note.body;
      } else {
        next.push(note.body);
      }
      updateElement(selectedElementId, { content: next });
      showToast({ title: "Note inserted into list", variant: "success" });
      return;
    }

    // Insert into tokens/tags: insert as a token (truncate to 100 chars)
    if (selectedElement?.type === "token") {
      const tokens = Array.isArray(selectedElement.content) ? (selectedElement.content as string[]) : [""];
      const next = [...tokens];
      const text = (note.body || "").slice(0, 100);
      const emptyIndex = next.findIndex((t) => !t || t.trim() === "");
      if (emptyIndex >= 0) {
        next[emptyIndex] = text;
      } else {
        next.push(text);
      }
      updateElement(selectedElementId, { content: next });
      showToast({ title: "Note inserted as tag", variant: "success" });
      return;
    }

    showToast({ title: "Selected element is not editable for notes", variant: "warning" });
  };

  if (loading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-md border p-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="space-y-2">
      {notes.length === 0 ?
        <div
          className="
      flex flex-col items-center justify-center
      rounded-lg border border-dashed
      bg-muted/20 px-4 py-8 text-center
    ">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border bg-background">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>

          <h3 className="text-sm font-medium">No notes available</h3>

          <p className="mt-1 text-xs text-muted-foreground">Create notes and quickly insert them into your CV.</p>

          <button onClick={() => navigate("/notes")} className=" mt-4 inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-muted">
            <Plus className="h-4 w-4" />
            Add Note
          </button>
        </div>
      : notes.map((note) => {
          const bg = note.color || "#ffffff";

          return (
            <button
              key={note._id}
              onClick={() => insertNote(note)}
              className="
                group relative w-full overflow-hidden rounded-md border border-dashed border-border bg-background p-3 text-left
                transition-all hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm
              ">
              <span className="absolute inset-y-2 left-0 w-1 rounded-r-full" style={{ backgroundColor: bg }} />
              <div className="flex min-w-0 items-start gap-3 pl-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/60 text-muted-foreground transition-colors group-hover:text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-xs font-medium leading-5 text-foreground">{note.title || "Untitled"}</p>
                    <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground">{note.body || "No description"}</p>
                </div>
              </div>
            </button>
          );
        })
      }
    </div>
  );
};

export default NotesPallet;
