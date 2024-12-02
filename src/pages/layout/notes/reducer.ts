// import { ReducerAction } from "react";
import { Action, State } from "./state";
export const InitialState = {
  title: "",
  description: "",
};
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "CREATE NOTE":
      return { ...InitialState, ...state };
    case "UPDATE NOTE":
      return { ...state } as State;
    case "DELETE NOTE":
      return { ...state } as State;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
