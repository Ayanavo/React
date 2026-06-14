import { NoteRecord } from "@/shared/services/note";
import { TagRecord } from "@/shared/services/tag";
import { NoteSortOption, State } from "./state";

export function mapNoteRecordToState(note: NoteRecord, tags: TagRecord[] = []): NonNullable<State> {
  const tagId = note.tag ? String(note.tag) : undefined;
  const tagRecord = tagId ? tags.find((tag) => tag._id === tagId) : undefined;

  return {
    _id: note._id,
    title: note.title,
    description: note.body,
    backgroundColor: note.color || undefined,
    image: note.image ?? [],
    tag: tagId,
    tagName: tagRecord?.name,
    tagColor: tagRecord?.color,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export function mapStateToNotePayload(
  note: { title: string; description: string; backgroundColor?: string; tag?: string },
  image?: string | null
): {
  title: string;
  body: string;
  color: string;
  image: string[];
  tag?: string;
} {
  return {
    title: note.title,
    body: note.description,
    color: note.backgroundColor ?? "",
    image: image ? [image] : [],
    tag: note.tag ?? "",
  };
}

export function filterNotesByTag(notes: NonNullable<State>[], selectedTagId: string) {
  if (selectedTagId === "all") return notes;
  if (selectedTagId === "none") return notes.filter((note) => !note.tag);
  return notes.filter((note) => note.tag === selectedTagId);
}

export function sortNotes(notes: NonNullable<State>[], sortBy: NoteSortOption) {
  const sorted = [...notes];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "updated-asc":
        return new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime();
      case "title-asc":
        return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      case "title-desc":
        return b.title.localeCompare(a.title, undefined, { sensitivity: "base" });
      case "tag-asc": {
        const tagA = a.tagName ?? "";
        const tagB = b.tagName ?? "";
        if (!tagA && tagB) return 1;
        if (tagA && !tagB) return -1;
        return tagA.localeCompare(tagB, undefined, { sensitivity: "base" });
      }
      case "tag-desc": {
        const tagA = a.tagName ?? "";
        const tagB = b.tagName ?? "";
        if (!tagA && tagB) return 1;
        if (tagA && !tagB) return -1;
        return tagB.localeCompare(tagA, undefined, { sensitivity: "base" });
      }
      case "updated-desc":
      default:
        return new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime();
    }
  });

  return sorted;
}
