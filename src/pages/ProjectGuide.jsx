import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import StepSidebar from "../components/guide/StepSidebar";
import StepContent from "../components/guide/StepContent";
import { Trophy, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

export default function ProjectGuide() {
  const { project } = useOutletContext();
  const steps = project?.guide_steps || [];

  const [activeStep, setActiveStep] = useState(steps[0]?.id ?? 1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const step = steps.find(s => s.id === activeStep);
  const progress = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;
  const isCompleted = completedSteps.includes(activeStep);
  const allDone = steps.length > 0 && completedSteps.length === steps.length;

  const handleComplete = () => {
    if (!completedSteps.includes(activeStep)) {
      setCompletedSteps(prev => [...prev, activeStep]);
    }
    const currentIndex = steps.findIndex(s => s.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setTimeout(() => setActiveStep(steps[currentIndex + 1].id), 300);
    }
  };

  const handlePrev = () => {
    const currentIndex = steps.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) setActiveStep(steps[currentIndex - 1].id);
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === activeStep);
    if (currentIndex < steps.length - 1) setActiveStep(steps[currentIndex + 1].id);
  };

  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <p className="text-muted-foreground">No guide steps available for this project.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div
        className="flex items-center gap-3 px-4 md:px-6 py-2.5 border-b shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "hsl(222 47% 7% / 0.8)" }}
      >
        <button
          className="md:hidden p-1.5 rounded-lg shrink-0"
          style={{ background: "rgba(255,255,255,0.05)" }}
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          {sidebarOpen ? <X size={14} className="text-muted-foreground" /> : <Menu size={14} className="text-muted-foreground" />}
        </button>

        <span className="text-xs text-muted-foreground shrink-0">Progress</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(to right, #0ea5e9, #8b5cf6)" }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground shrink-0">
          {completedSteps.length}/{steps.length} steps
        </span>
        {allDone && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-yellow-400 shrink-0">
            <Trophy size={14} />
          </motion.div>
        )}
        <div className="flex gap-1 shrink-0">
          <button onClick={handlePrev} disabled={steps.findIndex(s => s.id === activeStep) === 0}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-20"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <ChevronLeft size={13} className="text-muted-foreground" />
          </button>
          <button onClick={handleNext} disabled={steps.findIndex(s => s.id === activeStep) === steps.length - 1}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-20"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <ChevronRight size={13} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Desktop sidebar */}
        <aside
          className="hidden md:block w-52 shrink-0 overflow-y-auto border-r"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "hsl(222 47% 7%)" }}
        >
          <div className="px-2 py-3">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">Steps</div>
            <StepSidebar
              steps={steps}
              activeStep={activeStep}
              completedSteps={completedSteps}
              onSelect={(id) => setActiveStep(id)}
            />
          </div>
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <>
            <div className="md:hidden fixed inset-0 z-20 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <aside
              className="md:hidden fixed left-0 top-0 bottom-0 z-30 w-52 overflow-y-auto border-r"
              style={{ borderColor: "rgba(255,255,255,0.07)", background: "hsl(222 47% 7%)" }}
            >
              <div className="px-2 py-16">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">Steps</div>
                <StepSidebar
                  steps={steps}
                  activeStep={activeStep}
                  completedSteps={completedSteps}
                  onSelect={(id) => { setActiveStep(id); setSidebarOpen(false); }}
                />
              </div>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-2xl mx-auto h-full flex flex-col">
            {allDone ? (
              <CompletionScreen steps={steps} />
            ) : (
              step && (
                <StepContent
                  step={step}
                  onComplete={handleComplete}
                  isCompleted={isCompleted}
                />
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function CompletionScreen({ steps }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center py-16"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6 }}
        className="text-6xl mb-6"
      >
        🎉
      </motion.div>
      <h2 className="text-2xl font-extrabold text-foreground mb-3">
        Guide Complete!
      </h2>
      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-8">
        You've completed all {steps.length} steps of this architecture guide.
      </p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {[
          { label: "Steps completed", value: steps.length.toString() },
          { label: "Services deployed", value: "✓" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3 border text-center"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
          >
            <div className="text-2xl font-extrabold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}