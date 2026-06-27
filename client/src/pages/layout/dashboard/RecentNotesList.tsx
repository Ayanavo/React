import { State } from "@/pages/layout/notes/state";
import { FileText } from "lucide-react";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import { NoteGridSkeleton, NoteListSkeleton } from "./dashboard-skeletons";

type RecentNotesListProps = {
  notes: NonNullable<State>[];
  isLoading?: boolean;
  compact?: boolean;
};

const RecentNotesList: React.FC<RecentNotesListProps> = ({ notes, isLoading, compact }) => {
  if (isLoading) {
    return compact ? <NoteGridSkeleton count={5} /> : <NoteListSkeleton count={3} />;
  }

  if (notes.length === 0) {
    return (
      <div className="dashboard__empty">
        <FileText className="h-5 w-5 opacity-50" />
        <p>No notes yet</p>
        <Link to="/notes" className="text-sm font-medium text-primary hover:underline">
          Create a note
        </Link>
      </div>
    );
  }

  const listClass = compact ?
    "dashboard__list gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
  : "dashboard__list";

  return (
    <div className={listClass}>
      {notes.map((note) => {
        const updatedLabel = note.updatedAt ? moment(note.updatedAt).fromNow() : "";

        return (
          <Link key={note._id} to="/notes" className="dashboard__list-item block min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">{note.title || "Untitled"}</p>
                {updatedLabel ?
                  <span className="shrink-0 text-xs text-muted-foreground">{updatedLabel}</span>
                : null}
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{note.description?.trim() || "No description"}</p>
              {note.tagName ?
                <span
                  className="dashboard__tag mt-1.5"
                  style={
                    note.tagColor ?
                      { borderColor: `${note.tagColor}55`, backgroundColor: `${note.tagColor}22` }
                    : undefined
                  }>
                  {note.tagColor ?
                    <span className="dashboard__tag-dot" style={{ backgroundColor: note.tagColor }} />
                  : null}
                  {note.tagName}
                </span>
              : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default RecentNotesList;
