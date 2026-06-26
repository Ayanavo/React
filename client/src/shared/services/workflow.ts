import { apiUrl, axiosInstance } from "@/shared/interceptors/auth-interceptor";
import type { Edge, Node } from "@xyflow/react";

export type WorkflowSummary = {
  _id: string;
  name: string;
  description: string;
  updatedAt: string;
  createdAt: string;
  lastRunAt: string | null;
};

export type WorkflowRecord = WorkflowSummary & {
  nodes: Node[];
  edges: Edge[];
};

export type WorkflowPayload = {
  name: string;
  description?: string;
  nodes?: Node[];
  edges?: Edge[];
  lastRunAt?: string | null;
};

const workflowURL = `${apiUrl}workflows`;

export const getWorkflows = async () => {
  const response = await axiosInstance.get<{ workflows: WorkflowSummary[] }>(workflowURL);
  return response.data.workflows;
};

export const getWorkflowById = async (id: string) => {
  const response = await axiosInstance.get<{ workflow: WorkflowRecord }>(`${workflowURL}/${id}`);
  return response.data.workflow;
};

export const createWorkflow = async (payload: WorkflowPayload) => {
  const response = await axiosInstance.post<{ message: string; workflow: WorkflowRecord }>(
    `${workflowURL}/create`,
    payload
  );
  return response.data;
};

export const updateWorkflow = async (id: string, payload: WorkflowPayload) => {
  const response = await axiosInstance.put<{ message: string; workflow: WorkflowRecord }>(
    `${workflowURL}/update/${id}`,
    payload
  );
  return response.data;
};

export const deleteWorkflow = async (id: string) => {
  const response = await axiosInstance.delete<{ message: string }>(`${workflowURL}/delete/${id}`);
  return response.data;
};
