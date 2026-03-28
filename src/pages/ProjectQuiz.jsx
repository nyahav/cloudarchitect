import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2, Brain, RotateCcw, ChevronRight, CheckCircle2, XCircle, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function generatePrompt(project) {
  const serviceNames = Object.values(project.services || {}).map(s => s.label).join(", ");
  const guideTopics = (project.guide_steps || []).map(s => s.title).join(", ");
  return `You are a cloud architecture quiz generator for AWS.

The user is studying this project: "${project.name}"
Services involved: ${serviceNames}
Topics covered: ${guideTopics}

Generate exactly 6 multiple-choice quiz questions covering:
- 2 questions about what each service does / why it was chosen
- 2 questions about IAM policies, least privilege, or security concepts
- 2 questions about AWS best practices (async decoupling, DLQ, scaling, etc.)

For each question, provide 4 answer options (A–D), one correct answer, and a short explanation.

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": 0,
      "explanation": "..."
    }
  ]
}`;
}

export default function ProjectQuiz() {
  const { project } = useOutletContext();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  const loadQuiz = async () => {
    setLoading(true);
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setAnswers([]);
    setDone(false);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: generatePrompt(project),
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct: { type: "number" },
                explanation: { type: "string" },
              },
            },
          },
        },
      },
    });

    setQuestions(result.questions || []);
    setLoading(false);
  };

  useEffect(() => {
    loadQuiz();
  }, [project.id]);

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

  const color = project.color || "#0ea5e9";
  const q = questions[current];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-24">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color }} />
          <Brain className="w-5 h-5 absolute -top-1 -right-1" style={{ color }} />
        </div>
        <p className="text-muted-foreground text-sm">Generating quiz questions with AI…</p>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 gap-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: `${color}20`, border: `2px solid ${color}50` }}>
            <Trophy className="w-10 h-10" style={{ color }} />
          </div>
        </motion.div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">Quiz Complete!</h2>
          <p className="text-muted-foreground text-sm">You scored</p>
          <p className="text-5xl font-black mt-2" style={{ color }}>{score}/{questions.length}</p>
          <p className="text-muted-foreground text-sm mt-1">{pct}% correct</p>
        </div>

        <div className="w-full max-w-md grid grid-cols-1 gap-2">
          {questions.map((qu, i) => {
            const ans = answers[i];
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                {ans?.isCorrect
                  ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                  : <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />}
                <p className="text-xs text-muted-foreground leading-relaxed">{qu.question}</p>
              </div>
            );
          })}
        </div>

        <Button onClick={loadQuiz} className="gap-2" style={{ background: color, color: "#fff" }}>
          <RotateCcw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" style={{ color }} />
          <span className="font-bold text-sm text-foreground">Test Your Knowledge</span>
          <span className="text-xs text-muted-foreground">— {project.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{current + 1} / {questions.length}</span>
          <span className="font-bold" style={{ color }}>Score: {score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-6" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${((current) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="rounded-2xl p-6 mb-5"
            style={{ background: "hsl(222 47% 8%)", border: `1px solid ${color}25` }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-black"
                style={{ background: `${color}20`, color }}
              >
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
                if (i === q.correct) {
                  bgColor = "rgba(34,197,94,0.12)";
                  borderColor = "#22c55e";
                  textColor = "#22c55e";
                } else if (i === selected && i !== q.correct) {
                  bgColor = "rgba(239,68,68,0.1)";
                  borderColor = "#ef4444";
                  textColor = "#ef4444";
                }
              } else if (selected === i) {
                bgColor = `${color}18`;
                borderColor = color;
                textColor = color;
              }

              return (
                <motion.button
                  key={i}
                  whileHover={!revealed ? { scale: 1.01 } : {}}
                  whileTap={!revealed ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(i)}
                  className="w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all text-sm"
                  style={{ background: bgColor, border: `1px solid ${borderColor}`, color: textColor }}
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: `${borderColor}25` }}
                  >
                    {["A","B","C","D"][i]}
                  </span>
                  {opt.replace(/^[A-D]\.\s*/, "")}
                  {revealed && i === q.correct && <CheckCircle2 className="ml-auto w-4 h-4 text-green-500 shrink-0" />}
                  {revealed && i === selected && i !== q.correct && <XCircle className="ml-auto w-4 h-4 text-red-500 shrink-0" />}
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
                <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {!revealed ? (
              <Button
                disabled={selected === null}
                onClick={handleReveal}
                className="gap-2"
                style={selected !== null ? { background: color, color: "#fff" } : {}}
              >
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