export type State = {
  _id?: string;
  title: string;
  description: string;
  backgroundColor?: string;
  image?: string[];
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
