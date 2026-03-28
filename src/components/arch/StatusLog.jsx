import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

export default function StatusLog({ logs }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-4 rounded-xl border border-border/50 overflow-hidden"
      style={{ background: "hsl(222 47% 6% / 0.8)" }}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30">
        <Terminal size={12} className="text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">Event Log</span>
      </div>
      <div ref={scrollRef} className="p-3 max-h-32 overflow-auto font-mono text-xs space-y-1" dir="ltr">
        <AnimatePresence>
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <span className="text-muted-foreground shrink-0">{log.time}</span>
              <span style={{ color: log.color }}>{log.icon}</span>
              <span className="text-foreground/80">{log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {logs.length === 0 && (
          <span className="text-muted-foreground">Waiting for events...</span>
        )}
      </div>
    </motion.div>
  );
}