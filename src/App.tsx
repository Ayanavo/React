import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import "./App.scss";
import { Router } from "./routes/route";
import { ThemeProvider } from "./pages/settings/theme";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" colorTheme="zinc">
        <Router />;
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
