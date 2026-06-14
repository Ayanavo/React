export type State = {
  _id?: string;
  title: string;
  description: string;
  backgroundColor?: string;
  image?: string[];
  tag?: string;
  tagName?: string;
  tagColor?: string;
  createdAt?: string;
  updatedAt?: string;
} | null;

export type Action = {
  type: ActionKind;
  payload: number;
};

enum ActionKind {
  CREATE = "CREATE NOTE",
  UPDATE = "UPDATE NOTE",
  DELETE = "DELETE NOTE",
}

export type NoteSortOption = "updated-desc" | "updated-asc" | "title-asc" | "title-desc" | "tag-asc" | "tag-desc";
