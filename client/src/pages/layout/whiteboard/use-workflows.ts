import {
  createWorkflow,
  deleteWorkflow,
  getWorkflowById,
  getWorkflows,
  updateWorkflow,
  type WorkflowPayload,
  type WorkflowRecord,
} from "@/shared/services/workflow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const WORKFLOWS_QUERY_KEY = ["workflows"] as const;

export function workflowDetailKey(id: string | null) {
  return ["workflows", id] as const;
}

export function useWorkflows() {
  return useQuery({
    queryKey: WORKFLOWS_QUERY_KEY,
    queryFn: getWorkflows,
  });
}

export function useWorkflow(id: string | null) {
  return useQuery({
    queryKey: workflowDetailKey(id),
    queryFn: () => getWorkflowById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkflowPayload) => createWorkflow(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: WorkflowPayload }) => updateWorkflow(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY });
      void queryClient.setQueryData(workflowDetailKey(data.workflow._id), data.workflow);
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkflow(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WORKFLOWS_QUERY_KEY });
    },
  });
}

export type { WorkflowRecord, WorkflowPayload };
