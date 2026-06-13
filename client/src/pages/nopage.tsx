import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

function nopage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 py-16 text-foreground">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/50">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <Button asChild className="rounded-lg">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default nopage;
