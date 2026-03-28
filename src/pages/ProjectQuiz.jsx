import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Brain, RotateCcw, ChevronRight,
  CheckCircle2, XCircle, Trophy, Sparkles, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_LABELS = {
  service_roles: "Service Roles",
  iam_policy: "IAM & Security",
  best_practices: "Best Practices",
};
const CATEGORY_COLORS = {
  service_roles: "#0ea5e9",
  iam_policy: "#a855f7",
  best_practices: "#22c55e",
};

export default function ProjectQuiz() {
  const { project } = useOutletContext();
  const color = project.color || "#0ea5e9";

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    base44.entities.QuizQuestion.filter({ project_id: project.id })
      .then(qs => setQuestions(qs || []))
      .finally(() => setLoading(false));
  }, [project.id]);

  const resetQuiz = () => {
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setAnswers([]);
    setDone(false);
    setStarted(true);
  };

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
  };

  const handleReveal = () => {
    if (selected === null) return;
    const q = questions[current];
    const isCorrect = selected === q.correct;
    setRevealed(true);
    if (isCorrect) setScore(s => s + 1);
    setAnswers(prev => [...prev, { selected, correct: q.correct, isCorrect }]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color }} />
        <p className="text-muted-foreground text-sm">Loading questions…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
        <Brain className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-lg font-bold text-foreground">No Questions Yet</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Add quiz questions for this project via the admin panel to enable this mode.
        </p>
      </div>
    );
  }

  // Intro / Start screen
  if (!started) {
    const byCategory = questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 gap-8 max-w-lg mx-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: `${color}20`, border: `2px solid ${color}40` }}>
            <Brain className="w-9 h-9" style={{ color }} />
          </div>
        </motion.div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Test Your Knowledge</h2>
          <p className="text-muted-foreground text-sm">{project.name}</p>
        </div>

        <div className="w-full grid grid-cols-3 gap-3">
          {Object.entries(byCategory).map(([cat, count]) => (
            <div
              key={cat}
              className="rounded-xl p-3 text-center"
              style={{ background: `${CATEGORY_COLORS[cat] || color}10`, border: `1px solid ${CATEGORY_COLORS[cat] || color}30` }}
            >
              <p className="text-lg font-black" style={{ color: CATEGORY_COLORS[cat] || color }}>{count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{CATEGORY_LABELS[cat] || cat}</p>
            </div>
          ))}
        </div>

        <div
          className="w-full rounded-xl p-4 flex items-start gap-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <BookOpen className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {questions.length} questions covering service roles, IAM policies, and AWS best practices. Select an answer then check it before moving on.
          </p>
        </div>

        <Button onClick={resetQuiz} className="w-full gap-2 py-6 text-base font-bold" style={{ background: color, color: "#fff" }}>
          Start Quiz <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  // Results screen
  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const medal = pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚";

    return (
      <div className="flex flex-col items-center py-12 px-6 gap-6 max-w-lg mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl" style={{ background: `${color}15`, border: `2px solid ${color}40` }}>
            {medal}
          </div>
        </motion.div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">Quiz Complete!</h2>
          <p className="text-5xl font-black mt-3" style={{ color }}>{score}<span className="text-2xl text-muted-foreground">/{questions.length}</span></p>
          <p className="text-muted-foreground text-sm mt-1">{pct}% correct</p>
        </div>

        <div className="w-full flex flex-col gap-2">
          {questions.map((qu, i) => {
            const ans = answers[i];
            const catColor = CATEGORY_COLORS[qu.category] || color;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {ans?.isCorrect
                  ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                  : <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-relaxed">{qu.question}</p>
                  {!ans?.isCorrect && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ✓ {qu.options[qu.correct]}
                    </p>
                  )}
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ background: `${catColor}15`, color: catColor }}>
                  {CATEGORY_LABELS[qu.category] || qu.category}
                </span>
              </div>
            );
          })}
        </div>

        <Button onClick={resetQuiz} className="gap-2" style={{ background: color, color: "#fff" }}>
          <RotateCcw className="w-4 h-4" /> Retry Quiz
        </Button>
      </div>
    );
  }

  const q = questions[current];
  const catColor = CATEGORY_COLORS[q.category] || color;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: `${catColor}15`, color: catColor }}>
            {CATEGORY_LABELS[q.category] || q.category}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{current + 1} / {questions.length}</span>
          <span className="font-bold" style={{ color }}>Score: {score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-6" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${(current / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.22 }}
        >
          {/* Question */}
          <div className="rounded-2xl p-6 mb-5" style={{ background: "hsl(222 47% 8%)", border: `1px solid ${catColor}25` }}>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-black" style={{ background: `${catColor}20`, color: catColor }}>
                Q{current + 1}
              </div>
              <p className="text-foreground font-semibold text-sm leading-relaxed">{q.question}</p>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3 mb-5">
            {q.options.map((opt, i) => {
              let bgColor = "rgba(255,255,255,0.03)";
              let borderColor = "rgba(255,255,255,0.08)";
              let textColor = "rgba(210,220,240,0.8)";

              if (revealed) {
                if (i === q.correct) { bgColor = "rgba(34,197,94,0.12)"; borderColor = "#22c55e"; textColor = "#22c55e"; }
                else if (i === selected) { bgColor = "rgba(239,68,68,0.1)"; borderColor = "#ef4444"; textColor = "#ef4444"; }
              } else if (selected === i) {
                bgColor = `${catColor}18`; borderColor = catColor; textColor = catColor;
              }

              return (
                <motion.button
                  key={i}
                  whileHover={!revealed ? { scale: 1.01 } : {}}
                  whileTap={!revealed ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(i)}
                  className="w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all text-sm cursor-pointer"
                  style={{ background: bgColor, border: `1px solid ${borderColor}`, color: textColor }}
                >
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${borderColor}25` }}>
                    {["A","B","C","D"][i]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {revealed && i === q.correct && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                  {revealed && i === selected && i !== q.correct && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl mb-5 flex items-start gap-3"
                style={{ background: "rgba(255,153,0,0.07)", border: "1px solid rgba(255,153,0,0.2)" }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {!revealed ? (
              <Button disabled={selected === null} onClick={handleReveal} className="gap-2" style={selected !== null ? { background: catColor, color: "#fff" } : {}}>
                Check Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2" style={{ background: color, color: "#fff" }}>
                {current + 1 >= questions.length ? "See Results" : "Next Question"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}