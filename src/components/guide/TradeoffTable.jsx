import React from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function TradeoffTable({ tradeoffs, color }) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: `${color}20` }}>
      <div className="grid grid-cols-2">
        {/* Header */}
        <div className="px-4 py-2 flex items-center gap-2 border-b border-r" style={{ borderColor: `${color}15`, background: "rgba(34,197,94,0.06)" }}>
          <ThumbsUp size={13} className="text-green-400" />
          <span className="text-xs font-bold text-green-400">Advantages</span>
        </div>
        <div className="px-4 py-2 flex items-center gap-2 border-b" style={{ borderColor: `${color}15`, background: "rgba(239,68,68,0.06)" }}>
          <ThumbsDown size={13} className="text-red-400" />
          <span className="text-xs font-bold text-red-400">Trade-offs</span>
        </div>

        {/* Rows */}
        {tradeoffs.map((row, i) => (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="px-4 py-2.5 text-xs leading-relaxed border-r"
              style={{
                borderColor: `${color}10`,
                borderBottom: i < tradeoffs.length - 1 ? `1px solid ${color}10` : "none",
                color: "rgba(180,220,180,0.85)",
                background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              }}
            >
              <span className="text-green-500 mr-1.5">✓</span>{row.pro}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="px-4 py-2.5 text-xs leading-relaxed"
              style={{
                borderColor: `${color}10`,
                borderBottom: i < tradeoffs.length - 1 ? `1px solid ${color}10` : "none",
                color: "rgba(220,180,180,0.85)",
                background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              }}
            >
              <span className="text-red-400 mr-1.5">✗</span>{row.con}
            </motion.div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}