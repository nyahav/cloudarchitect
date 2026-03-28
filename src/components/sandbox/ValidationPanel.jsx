import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, PlayCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

function validate(nodes, edges, requiredConnections, requiredServices) {
  const results = [];

  // Check all services are placed
  const placedIds = new Set(nodes.map(n => n.id));
  for (const svcId of requiredServices) {
    results.push({
      id: `place-${svcId}`,
      type: placedIds.has(svcId) ? "pass" : "fail",
      label: `${svcId} is placed on the canvas`,
    });
  }

  // Check all required connections exist
  for (const conn of requiredConnections) {
    const exists = edges.some(
      ed => ed.from === conn.from && ed.to === conn.to
    );
    results.push({
      id: `conn-${conn.from}-${conn.to}`,
      type: exists ? "pass" : "fail",
      label: `${conn.from} → ${conn.to} (${conn.label})`,
    });
  }

  // Check no invalid connections (connections not in the spec)
  for (const ed of edges) {
    const isValid = requiredConnections.some(
      rc => rc.from === ed.from && rc.to === ed.to
    );
    if (!isValid) {
      results.push({
        id: `invalid-${ed.from}-${ed.to}`,
        type: "warn",
        label: `Unexpected connection: ${ed.from} → ${ed.to}`,
      });
    }
  }

  return results;
}

export default function ValidationPanel({ nodes, edges, project }) {
  const [results, setResults] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const requiredConnections = project.connections || [];
  const requiredServices = Object.keys(project.services || {});

  const runValidation = () => {
    setResults(validate(nodes, edges, requiredConnections, requiredServices));
  };

  const passes = results?.filter(r => r.type === "pass").length ?? 0;
  const fails = results?.filter(r => r.type === "fail").length ?? 0;
  const warns = results?.filter(r => r.type === "warn").length ?? 0;
  const total = results?.length ?? 0;
  const allGood = results && fails === 0 && warns === 0;

  return (
    <div
      className="flex flex-col gap-2 rounded-xl overflow-hidden"
      style={{ background: "hsl(222 47% 9%)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          {results && allGood && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {results && !allGood && <AlertCircle className="w-4 h-4 text-yellow-500" />}
          {!results && <PlayCircle className="w-4 h-4 text-primary" />}
          <span className="text-sm font-bold text-foreground">Validation</span>
          {results && (
            <span className="text-xs text-muted-foreground">
              {passes}/{total} passed
            </span>
          )}
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-2 px-3 pb-3 overflow-hidden"
          >
            <Button
              onClick={runValidation}
              className="w-full gap-2 text-xs py-2"
              style={{ background: "hsl(var(--primary))", color: "#fff" }}
            >
              <PlayCircle className="w-4 h-4" />
              Run Validation
            </Button>

            {results && (
              <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
                {allGood && (
                  <div className="text-center py-2 text-green-400 text-xs font-bold">
                    🎉 Architecture is correct!
                  </div>
                )}
                {results.map(r => (
                  <div
                    key={r.id}
                    className="flex items-start gap-2 text-xs px-2 py-1.5 rounded-lg"
                    style={{
                      background: r.type === "pass" ? "rgba(34,197,94,0.07)" : r.type === "fail" ? "rgba(239,68,68,0.07)" : "rgba(245,158,11,0.07)",
                    }}
                  >
                    {r.type === "pass" && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />}
                    {r.type === "fail" && <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                    {r.type === "warn" && <AlertCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />}
                    <span
                      style={{
                        color: r.type === "pass" ? "#86efac" : r.type === "fail" ? "#fca5a5" : "#fcd34d",
                      }}
                    >
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}