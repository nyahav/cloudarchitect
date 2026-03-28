import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Database, Mail, Package, Shield, Server, Zap, TestTube, ChevronRight, BookOpen, Code2, Lightbulb, BarChart2, CheckCircle } from "lucide-react";
import CodeBlock from "./CodeBlock";
import TradeoffTable from "./TradeoffTable";
import ConceptCards from "./ConceptCards";

const iconMap = { Network, Database, Mail, Package, Shield, Server, Zap, TestTube };

const TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "code", label: "Commands", icon: Code2 },
  { id: "concepts", label: "Concepts", icon: Lightbulb },
  { id: "tradeoffs", label: "Trade-offs", icon: BarChart2 },
];

export default function StepContent({ step, onComplete, isCompleted }) {
  const [tab, setTab] = useState("overview");
  const Icon = iconMap[step.icon] || Server;

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* Step header */}
      <div
        className="rounded-xl p-5 mb-5 border relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${step.color}12, ${step.color}06)`,
          borderColor: `${step.color}25`,
          boxShadow: `0 0 30px ${step.color}10`,
        }}
      >
        {/* Background glow blob */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 blur-2xl"
          style={{ background: step.color }}
        />

        <div className="flex items-start gap-4 relative">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${step.color}20`, boxShadow: `0 0 20px ${step.color}30` }}
          >
            <Icon size={24} style={{ color: step.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ background: `${step.color}20`, color: step.color }}>
                STEP {step.id}
              </span>
              {isCompleted && (
                <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                  <CheckCircle size={11} /> Done
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">{step.title}</h2>
            <p className="text-sm mt-1" style={{ color: "rgba(180,195,220,0.75)" }}>{step.summary}</p>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
        {TABS.map((t) => {
          const TIcon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: isActive ? `${step.color}20` : "transparent",
                color: isActive ? step.color : "rgba(180,195,220,0.45)",
                boxShadow: isActive ? `0 0 12px ${step.color}20` : "none",
              }}
            >
              <TIcon size={12} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {tab === "overview" && (
              <>
                <div
                  className="rounded-xl p-4 border text-sm leading-relaxed"
                  style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "rgba(210,225,245,0.9)" }}
                >
                  {step.content.intro}
                </div>
                {step.content.whyThis && (
                  <div
                    className="rounded-xl p-4 border text-sm leading-relaxed"
                    style={{ borderColor: `${step.color}25`, background: `${step.color}08` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={13} style={{ color: step.color }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: step.color }}>Why this choice?</span>
                    </div>
                    <p style={{ color: "rgba(210,225,245,0.85)" }}>{step.content.whyThis}</p>
                  </div>
                )}
                {step.content.diagram && (
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.07)", background: "hsl(222 47% 5%)" }}>
                    <div className="px-4 py-2 border-b text-xs font-mono text-muted-foreground" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      Architecture flow
                    </div>
                    <pre className="p-4 text-xs font-mono leading-relaxed" style={{ color: "rgba(180,215,180,0.8)" }}>
                      {step.content.diagram}
                    </pre>
                  </div>
                )}
              </>
            )}

            {tab === "code" && (
              <>
                <CodeBlock code={step.content.code} label="AWS CLI" />
                {step.content.verify && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={12} style={{ color: step.color }} />
                      <span className="text-xs font-bold" style={{ color: step.color }}>Verify it worked</span>
                    </div>
                    <CodeBlock code={step.content.verify} label="verify" />
                  </div>
                )}
              </>
            )}

            {tab === "concepts" && (
              <ConceptCards concepts={step.content.concepts} color={step.color} />
            )}

            {tab === "tradeoffs" && (
              <TradeoffTable tradeoffs={step.content.tradeoffs} color={step.color} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mark complete button */}
      <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <button
          onClick={onComplete}
          className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
          style={{
            background: isCompleted ? "rgba(34,197,94,0.15)" : `${step.color}20`,
            color: isCompleted ? "#22c55e" : step.color,
            border: `1px solid ${isCompleted ? "rgba(34,197,94,0.3)" : `${step.color}30`}`,
            boxShadow: isCompleted ? "0 0 12px rgba(34,197,94,0.2)" : "none",
          }}
        >
          {isCompleted ? (
            <><CheckCircle size={15} /> Step Completed</>
          ) : (
            <><ChevronRight size={15} /> Mark as Done</>
          )}
        </button>
      </div>
    </motion.div>
  );
}