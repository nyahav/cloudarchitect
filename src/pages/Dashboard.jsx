import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { SERVICES, generateSQSMessage } from "../components/arch/serviceData";
import ArchitectureMap from "../components/arch/ArchitectureMap";
import WhyPanel from "../components/arch/WhyPanel";
import IAMPolicyViewer from "../components/arch/IAMPolicyViewer";
import SQSPostBox from "../components/arch/SQSPostBox";
import ControlPanel from "../components/arch/ControlPanel";
import StatusLog from "../components/arch/StatusLog";

let packetIdCounter = 0;
let msgIdCounter = 0;

function getTimeStr() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Dashboard() {
  const [activeNodes, setActiveNodes] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);
  const [packets, setPackets] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [whyNode, setWhyNode] = useState(null);
  const [showIAM, setShowIAM] = useState(null);
  const [showSQS, setShowSQS] = useState(false);
  const [sqsMessages, setSqsMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutsRef = useRef([]);

  const addLog = useCallback((text, color, icon) => {
    setLogs(prev => [...prev, { time: getTimeStr(), text, color, icon }]);
  }, []);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const scheduleTimeout = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
    return t;
  };

  const addPacket = useCallback((from, to, color, label) => {
    const id = `pkt-${++packetIdCounter}`;
    setPackets(prev => [...prev, { id, from, to, color, label }]);
    return id;
  }, []);

  const removePacket = useCallback((id) => {
    setPackets(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleSendJob = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const msgId = ++msgIdCounter;
    const msg = generateSQSMessage(msgId, "process_document");

    // Step 1: Client → API
    addLog("Client sends POST /api/v1/jobs", "#94a3b8", "→");
    setActiveNodes(["client", "api"]);
    setActiveConnection("client-api");
    addPacket("client", "api", "#0ea5e9", "POST");

    // Step 2: API → DynamoDB (store job)
    scheduleTimeout(() => {
      addLog(`API stores job ${msg.body.jobId} in DynamoDB (status: PENDING)`, "#8b5cf6", "💾");
      setActiveNodes(["api", "dynamodb"]);
      setActiveConnection("api-dynamodb");
      addPacket("api", "dynamodb", "#8b5cf6", "PutItem");
    }, 1400);

    // Step 3: API → SQS (send message)
    scheduleTimeout(() => {
      addLog(`API sends message to SQS queue`, "#f59e0b", "📨");
      setActiveNodes(["api", "sqs"]);
      setActiveConnection("api-sqs");
      addPacket("api", "sqs", "#f59e0b", "SendMessage");
      setSqsMessages(prev => [...prev, { ...msg, status: "waiting" }]);
    }, 2800);

    // Step 4: SQS → Worker (receive message)
    scheduleTimeout(() => {
      addLog(`Worker receives message from SQS`, "#22c55e", "📬");
      setActiveNodes(["sqs", "worker"]);
      setActiveConnection("sqs-worker");
      addPacket("sqs", "worker", "#22c55e", "ReceiveMessage");
      setSqsMessages(prev =>
        prev.map(m => m.messageId === msg.messageId ? { ...m, status: "processing" } : m)
      );
    }, 4200);

    // Step 5: Worker → DynamoDB (update status)
    scheduleTimeout(() => {
      addLog(`Worker processes job — updating DynamoDB (status: SUCCEEDED)`, "#22c55e", "✅");
      setActiveNodes(["worker", "dynamodb"]);
      setActiveConnection("worker-dynamodb");
      addPacket("worker", "dynamodb", "#22c55e", "UpdateItem");
      setSqsMessages(prev =>
        prev.map(m => m.messageId === msg.messageId ? { ...m, status: "completed" } : m)
      );
    }, 5600);

    // Cleanup
    scheduleTimeout(() => {
      addLog("Job completed successfully!", "#22c55e", "🎉");
      setActiveNodes([]);
      setActiveConnection(null);
      setIsAnimating(false);
      // Remove completed message after a moment
      scheduleTimeout(() => {
        setSqsMessages(prev => prev.filter(m => m.messageId !== msg.messageId));
      }, 2000);
    }, 7000);
  }, [isAnimating, addLog, addPacket]);

  const handleForceFailure = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const msgId = ++msgIdCounter;
    const msg = generateSQSMessage(msgId, "failing_task");
    msg.body.priority = "high";

    // Initial send
    addLog("Client sends a job that will FAIL", "#ef4444", "⚠️");
    setActiveNodes(["client", "api"]);
    setActiveConnection("client-api");
    addPacket("client", "api", "#0ea5e9", "POST");

    scheduleTimeout(() => {
      addLog(`API stores job ${msg.body.jobId} in DynamoDB`, "#8b5cf6", "💾");
      setActiveConnection("api-dynamodb");
      addPacket("api", "dynamodb", "#8b5cf6", "PutItem");
    }, 1200);

    scheduleTimeout(() => {
      addLog("API sends message to SQS", "#f59e0b", "📨");
      setActiveConnection("api-sqs");
      addPacket("api", "sqs", "#f59e0b", "SendMessage");
      setSqsMessages(prev => [...prev, { ...msg, status: "waiting", receiveCount: 0 }]);
    }, 2400);

    // 3 failure attempts
    const failAttempt = (attempt, baseDelay) => {
      scheduleTimeout(() => {
        addLog(`Attempt ${attempt}/3 — Worker receives message`, "#f59e0b", "📬");
        setActiveNodes(["sqs", "worker"]);
        setActiveConnection("sqs-worker");
        addPacket("sqs", "worker", "#22c55e", "Receive");
        setSqsMessages(prev =>
          prev.map(m => m.messageId === msg.messageId
            ? { ...m, status: "processing", receiveCount: attempt }
            : m)
        );
      }, baseDelay);

      scheduleTimeout(() => {
        addLog(`Attempt ${attempt}/3 — Worker FAILED! Error processing job`, "#ef4444", "❌");
        setActiveNodes(["worker"]);
        setSqsMessages(prev =>
          prev.map(m => m.messageId === msg.messageId
            ? { ...m, status: attempt < 3 ? "waiting" : "failed", receiveCount: attempt }
            : m)
        );
      }, baseDelay + 1200);
    };

    failAttempt(1, 3600);
    failAttempt(2, 6000);
    failAttempt(3, 8400);

    // Message moves to DLQ
    scheduleTimeout(() => {
      addLog("maxReceiveCount reached! Message moves to DLQ (Redrive Policy)", "#ef4444", "💀");
      setActiveNodes(["sqs", "dlq"]);
      setActiveConnection("sqs-dlq");
      addPacket("sqs", "dlq", "#ef4444", "Redrive");
      setSqsMessages(prev => prev.filter(m => m.messageId !== msg.messageId));
    }, 10800);

    // DLQ triggers Lambda
    scheduleTimeout(() => {
      addLog("DLQ triggers Lambda function", "#f97316", "⚡");
      setActiveNodes(["dlq", "lambda"]);
      setActiveConnection("dlq-lambda");
      addPacket("dlq", "lambda", "#f97316", "Trigger");
    }, 12200);

    // Lambda updates DynamoDB
    scheduleTimeout(() => {
      addLog("Lambda marks job as FAILED in DynamoDB", "#f97316", "💾");
      setActiveNodes(["lambda", "dynamodb"]);
      setActiveConnection("lambda-dynamodb");
      addPacket("lambda", "dynamodb", "#f97316", "UpdateItem");
    }, 13600);

    // Cleanup
    scheduleTimeout(() => {
      addLog("Failure flow complete — job marked as FAILED", "#ef4444", "🔴");
      setActiveNodes([]);
      setActiveConnection(null);
      setIsAnimating(false);
    }, 15000);
  }, [isAnimating, addLog, addPacket]);

  const handleNodeClick = useCallback((nodeId) => {
    setSelectedNode(prev => prev === nodeId ? null : nodeId);
    setWhyNode(null);
    if (SERVICES[nodeId]?.iamPolicy) {
      setShowIAM(prev => prev === nodeId ? null : nodeId);
    } else {
      setShowIAM(null);
    }
  }, []);

  const handleWhyClick = useCallback((nodeId) => {
    setWhyNode(prev => prev === nodeId ? null : nodeId);
    setShowIAM(null);
  }, []);

  const handleReset = useCallback(() => {
    clearTimeouts();
    setActiveNodes([]);
    setActiveConnection(null);
    setPackets([]);
    setSqsMessages([]);
    setLogs([]);
    setIsAnimating(false);
    setSelectedNode(null);
    setWhyNode(null);
    setShowIAM(null);
    setShowSQS(false);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            <span className="text-primary">AWS</span> Architecture Explorer
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl mx-auto">
            מפה אינטראקטיבית של ארכיטקטורת ענן — לחץ על כל שירות ללמוד, שלח Job כדי לראות את הזרימה בפעולה
          </p>
        </motion.div>

        {/* Architecture Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <ArchitectureMap
            activeNodes={activeNodes}
            activeConnection={activeConnection}
            packets={packets}
            onPacketComplete={removePacket}
            onNodeClick={handleNodeClick}
            onWhyClick={handleWhyClick}
            selectedNode={selectedNode}
          />

          {/* Overlay panels */}
          <WhyPanel serviceId={whyNode} onClose={() => setWhyNode(null)} />
          {showIAM && <IAMPolicyViewer serviceId={showIAM} onClose={() => setShowIAM(null)} />}
          {showSQS && <SQSPostBox messages={sqsMessages} onClose={() => setShowSQS(false)} />}
        </motion.div>

        {/* Controls */}
        <ControlPanel
          onSendJob={handleSendJob}
          onForceFailure={handleForceFailure}
          onToggleSQS={() => setShowSQS(prev => !prev)}
          onReset={handleReset}
          isAnimating={isAnimating}
          sqsOpen={showSQS}
        />

        {/* Status Log */}
        <StatusLog logs={logs} />
      </div>
    </div>
  );
}