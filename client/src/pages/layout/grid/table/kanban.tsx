import React from "react";
import { Table as TableModel } from "@tanstack/react-table";
import { User } from "./user.model";

function kanban({}: { tableBody: TableModel<User> }) {
  return <div>kanban</div>;
}

export default kanban;
