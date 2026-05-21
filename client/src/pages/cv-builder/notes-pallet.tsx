import React, { useEffect, useState } from "react";
import { getNotes, NoteRecord } from "@/shared/services/note";
import { useCV } from "@/lib/useCV";
import showToast from "@/hooks/toast";
import { Skeleton } from "@/components/ui/skeleton";

const NotesPallet = () => {
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
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-full">
            <Skeleton className="h-10 w-full rounded" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="space-y-2">
      {notes.length === 0 ?
        <div className="text-sm text-muted-foreground">No notes available</div>
      : notes.map((note) => {
          const bg = note.color || "#ffffff";

          const getTextColor = (hex: string) => {
            try {
              const cleaned = hex.replace("#", "");
              const r = parseInt(cleaned.length === 3 ? cleaned[0] + cleaned[0] : cleaned.substring(0, 2), 16);
              const g = parseInt(cleaned.length === 3 ? cleaned[1] + cleaned[1] : cleaned.substring(2, 4), 16);
              const b = parseInt(cleaned.length === 3 ? cleaned[2] + cleaned[2] : cleaned.substring(4, 6), 16);
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              return luminance > 0.6 ? "#000000" : "#ffffff";
            } catch {
              return "#000000";
            }
          };

          const textColor = getTextColor(bg);

          return (
            <button key={note._id} onClick={() => insertNote(note)} className="w-full text-left p-3 rounded border border-border hover:opacity-90" style={{ backgroundColor: bg, color: textColor }}>
              <div className="font-semibold truncate">{note.title || "Untitled"}</div>
            </button>
          );
        })
      }
    </div>
  );
};

export default NotesPallet;
