import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Clock, Eye, EyeOff, Package } from "lucide-react";

export default function SQSPostBox({ messages, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 max-w-lg z-50"
      dir="rtl"
    >
      <div
        className="rounded-xl border backdrop-blur-xl shadow-2xl overflow-hidden"
        style={{
          background: "hsl(222 47% 8% / 0.97)",
          borderColor: "#f59e0b30",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#f59e0b20" }}>
          <div className="flex items-center gap-2">
            <Mail size={16} style={{ color: "#f59e0b" }} />
            <span className="font-semibold text-sm" style={{ color: "#f59e0b" }}>
              SQS Post Box — תור הודעות
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium" style={{ background: "#f59e0b15", color: "#f59e0b" }}>
              {messages.length} הודעות
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 transition-colors">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="p-3 max-h-60 overflow-auto space-y-2">
          <AnimatePresence>
            {messages.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Package size={24} className="mx-auto mb-2 opacity-40" />
                התור ריק — שלח Job כדי לראות הודעות
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={msg.messageId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border p-3"
                  style={{
                    borderColor: msg.status === "processing" ? "#22c55e30" : msg.status === "failed" ? "#ef444430" : "#f59e0b20",
                    background: msg.status === "processing" ? "#22c55e08" : msg.status === "failed" ? "#ef444408" : "#f59e0b08",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-medium text-foreground truncate">
                          {msg.body.jobId}
                        </span>
                        <StatusBadge status={msg.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>סוג: {msg.body.type}</span>
                        <span>עדיפות: {msg.body.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      {msg.status === "processing" ? (
                        <><EyeOff size={10} /> <span>נסתר</span></>
                      ) : (
                        <><Eye size={10} /> <span>גלוי</span></>
                      )}
                    </div>
                  </div>

                  {/* Visibility timeout bar */}
                  {msg.status === "processing" && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> Visibility Timeout
                        </span>
                        <span>300s</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "#22c55e" }}
                          initial={{ width: "100%" }}
                          animate={{ width: "0%" }}
                          transition={{ duration: 8, ease: "linear" }}
                        />
                      </div>
                    </div>
                  )}

                  {msg.receiveCount > 0 && (
                    <div className="mt-1.5 text-xs" style={{ color: msg.receiveCount >= 3 ? "#ef4444" : "#f59e0b" }}>
                      ניסיונות עיבוד: {msg.receiveCount}/3
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Explanation */}
        <div className="px-5 py-3 border-t" style={{ borderColor: "#f59e0b10", background: "#f59e0b05" }}>
          <p className="text-xs text-muted-foreground leading-relaxed">
            💡 <strong className="text-foreground">Visibility Timeout:</strong> כשהודעה נקראת ע&quot;י Worker, היא נעלמת מהתור ל-300 שניות. 
            אם ה-Worker לא מוחק אותה (כשל), היא חוזרת להיות גלויה לניסיון נוסף.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const config = {
    waiting: { label: "ממתינה", color: "#f59e0b" },
    processing: { label: "בעיבוד", color: "#22c55e" },
    completed: { label: "הושלמה", color: "#0ea5e9" },
    failed: { label: "נכשלה", color: "#ef4444" },
  };
  const c = config[status] || config.waiting;

  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{ background: `${c.color}15`, color: c.color }}
    >
      {c.label}
    </span>
  );
}