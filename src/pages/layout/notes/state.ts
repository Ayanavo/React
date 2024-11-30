export type State = {
  title: string;
  description: string;
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
