import { NoteRecord } from "@/shared/services/note";
import { State } from "./state";

export function mapNoteRecordToState(note: NoteRecord): NonNullable<State> {
  return {
    _id: note._id,
    title: note.title,
    description: note.body,
    backgroundColor: note.color || undefined,
    image: note.image ?? [],
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export function mapStateToNotePayload(
  note: { title: string; description: string; backgroundColor?: string },
  image?: string | null
): {
  title: string;
  body: string;
  color: string;
  image: string[];
} {
  return {
    title: note.title,
    body: note.description,
    color: note.backgroundColor ?? "",
    image: image ? [image] : [],
  };
}
