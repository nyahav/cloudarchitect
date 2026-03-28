import React from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, AlertOctagon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ControlPanel({ onSendJob, onForceFailure, onToggleSQS, onReset, isAnimating, sqsOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-3 mt-6"
      dir="rtl"
    >
      <Button
        onClick={onSendJob}
        disabled={isAnimating}
        className="gap-2 font-semibold text-sm px-5"
        style={{
          background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
          color: "white",
        }}
      >
        <Play size={14} />
        שלח Job
      </Button>

      <Button
        onClick={onForceFailure}
        disabled={isAnimating}
        variant="outline"
        className="gap-2 font-semibold text-sm px-5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <AlertOctagon size={14} />
        Force Failure ×3
      </Button>

      <Button
        onClick={onToggleSQS}
        variant="outline"
        className="gap-2 font-semibold text-sm px-5"
        style={{
          borderColor: sqsOpen ? "#f59e0b40" : undefined,
          color: sqsOpen ? "#f59e0b" : undefined,
          background: sqsOpen ? "#f59e0b10" : undefined,
        }}
      >
        <Inbox size={14} />
        SQS Post Box
      </Button>

      <Button
        onClick={onReset}
        variant="ghost"
        className="gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <RotateCcw size={14} />
        איפוס
      </Button>
    </motion.div>
  );
}