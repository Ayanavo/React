export type SocketType =
  | "exec"
  | "string"
  | "date"
  | "tag"
  | "notePayload"
  | "activityPayload"
  | "cvPayload";

export type SocketDefinition = {
  id: string;
  label: string;
  type: SocketType;
};

export const SOCKET_COLORS: Record<SocketType, string> = {
  exec: "#f97316",
  string: "#22c55e",
  date: "#3b82f6",
  tag: "#a855f7",
  notePayload: "#eab308",
  activityPayload: "#06b6d4",
  cvPayload: "#ec4899",
};

export function areSocketTypesCompatible(source: SocketType, target: SocketType) {
  if (source === target) return true;
  return false;
}

export function getSocketType(handleId: string | null | undefined, nodeType: string, direction: "source" | "target") {
  const registry = requireSocketRegistry();
  const definition = registry[nodeType];
  if (!definition || !handleId) return null;

  const sockets = direction === "source" ? definition.outputs : definition.inputs;
  const socket = sockets.find((item: SocketDefinition) => item.id === handleId);
  return socket?.type ?? null;
}

let socketRegistryRef: Record<string, { inputs: SocketDefinition[]; outputs: SocketDefinition[] }> | null = null;

export function registerSocketRegistry(registry: Record<string, { inputs: SocketDefinition[]; outputs: SocketDefinition[] }>) {
  socketRegistryRef = registry;
}

function requireSocketRegistry() {
  if (!socketRegistryRef) {
    throw new Error("Socket registry not initialized");
  }
  return socketRegistryRef;
}
