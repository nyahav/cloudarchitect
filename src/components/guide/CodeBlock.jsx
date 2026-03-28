import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlight bash
  const highlight = (text) => {
    if (!text) return "";
    return text
      .replace(/^(#.*)$/gm, '<span style="color:#6b7280;font-style:italic">$1</span>')
      .replace(/\b(aws|docker|curl|cat|chmod|echo|mkdir|cd|zip)\b/g, '<span style="color:#f97316;font-weight:600">$1</span>')
      .replace(/\b(dynamodb|sqs|iam|ec2|ecr|lambda|ssm|logs)\b/g, '<span style="color:#0ea5e9;font-weight:600">$1</span>')
      .replace(/--[\w-]+/g, '<span style="color:#8b5cf6">$&</span>')
      .replace(/\$\{?[\w_]+\}?/g, '<span style="color:#22c55e">$&</span>')
      .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span style="color:#f59e0b">"$1"</span>')
      .replace(/\b(create-table|create-queue|create-role|create-function|run-instances|create-repository)\b/g, '<span style="color:#a78bfa">$&</span>');
  };

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.07)", background: "hsl(222 47% 5%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "hsl(222 47% 7%)" }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <Terminal size={11} className="text-muted-foreground ml-2" />
          <span className="text-xs text-muted-foreground font-mono">{label || "bash"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
          style={{
            background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
            color: copied ? "#22c55e" : "rgba(210,220,240,0.6)",
          }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                <Check size={11} /> Copied!
              </motion.span>
            ) : (
              <motion.span key="copy" className="flex items-center gap-1">
                <Copy size={11} /> Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Code */}
      <div className="p-4 overflow-x-auto">
        <pre
          className="text-xs leading-relaxed font-mono"
          dangerouslySetInnerHTML={{ __html: highlight(code) }}
        />
      </div>
    </div>
  );
}