import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import "./App.scss";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./pages/settings/theme";
import { Router } from "./routes/route";
import IdleTimer from "./components/idleTimeout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" colorTheme="zinc">
        <IdleTimer>
          <Router />
        </IdleTimer>
        <Toaster position="bottom-left" visibleToasts={6} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
