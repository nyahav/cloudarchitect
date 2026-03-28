import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Network } from "lucide-react";

// AppShell is now minimal — only wraps the home/projects page
// Project pages have their own layout via ProjectLayout
export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {children}
    </div>
  );
}