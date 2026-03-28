import React, { useState, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { generateSQSMessage } from "../components/arch/serviceData";
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

export default function ProjectDashboard() {
  const { project } = useOutletContext();
  const services = project?.services || {};

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

  // Build dynamic flow based on connections
  const connections = project?.connections || [];

  const handleSendJob = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const msgId = ++msgIdCounter;
    const msg = generateSQSMessage(msgId, "process_document");

    // Animate through connections in order
    connections.forEach((conn, i) => {
      const fromSvc = services[conn.from];
      const toSvc = services[conn.to];
      const color = fromSvc?.color || "#0ea5e9";

      scheduleTimeout(() => {
        addLog(`${conn.label}: ${conn.from} → ${conn.to}`, color, "→");
        setActiveNodes([conn.from, conn.to]);
        setActiveConnection(`${conn.from}-${conn.to}`);
        addPacket(conn.from, conn.to, color, conn.label);

        if (conn.from === "api" && conn.to === "sqs") {
          setSqsMessages(prev => [...prev, { ...msg, status: "waiting" }]);
        }
        if (conn.from === "sqs" && conn.to === "worker") {
          setSqsMessages(prev =>
            prev.map(m => m.messageId === msg.messageId ? { ...m, status: "processing" } : m)
          );
        }
        if (conn.from === "worker" && conn.to === "dynamodb") {
          setSqsMessages(prev =>
            prev.map(m => m.messageId === msg.messageId ? { ...m, status: "completed" } : m)
          );
        }
      }, (i + 1) * 1400);
    });

    scheduleTimeout(() => {
      addLog("Flow complete!", "#22c55e", "🎉");
      setActiveNodes([]);
      setActiveConnection(null);
      setIsAnimating(false);
      scheduleTimeout(() => setSqsMessages([]), 2000);
    }, (connections.length + 1) * 1400 + 600);
  }, [isAnimating, addLog, addPacket, connections, services]);

  const handleForceFailure = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const msgId = ++msgIdCounter;
    const msg = generateSQSMessage(msgId, "failing_task");

    addLog("Simulating failure flow...", "#ef4444", "⚠️");
    setActiveNodes(["client", "api"]);
    addPacket("client", "api", "#0ea5e9", "POST");

    scheduleTimeout(() => {
      addLog("Message enters SQS queue", "#f59e0b", "📨");
      setActiveConnection("api-sqs");
      addPacket("api", "sqs", "#f59e0b", "SendMessage");
      setSqsMessages(prev => [...prev, { ...msg, status: "waiting", receiveCount: 0 }]);
    }, 1200);

    [1, 2, 3].forEach((attempt, i) => {
      scheduleTimeout(() => {
        addLog(`Attempt ${attempt}/3 — Processing failed`, "#ef4444", "❌");
        setSqsMessages(prev =>
          prev.map(m => m.messageId === msg.messageId
            ? { ...m, status: attempt < 3 ? "waiting" : "failed", receiveCount: attempt }
            : m)
        );
      }, 2400 + i * 2400);
    });

    scheduleTimeout(() => {
      addLog("Message moves to DLQ after 3 failures", "#ef4444", "💀");
      setActiveConnection("sqs-dlq");
      addPacket("sqs", "dlq", "#ef4444", "Redrive");
      setSqsMessages([]);
    }, 9600);

    scheduleTimeout(() => {
      addLog("Lambda triggered by DLQ — marking job as FAILED", "#f97316", "⚡");
      setActiveConnection("dlq-lambda");
      addPacket("dlq", "lambda", "#f97316", "Trigger");
    }, 11000);

    scheduleTimeout(() => {
      addLog("Failure flow complete", "#ef4444", "🔴");
      setActiveNodes([]);
      setActiveConnection(null);
      setIsAnimating(false);
    }, 13000);
  }, [isAnimating, addLog, addPacket]);

  const handleNodeClick = useCallback((nodeId) => {
    setSelectedNode(prev => prev === nodeId ? null : nodeId);
    setWhyNode(null);
    if (services[nodeId]?.iamPolicy) {
      setShowIAM(prev => prev === nodeId ? null : nodeId);
    } else {
      setShowIAM(null);
    }
  }, [services]);

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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {project?.name}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl mx-auto">
            {project?.description}
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
            services={services}
            connections={connections}
            activeNodes={activeNodes}
            activeConnection={activeConnection}
            packets={packets}
            onPacketComplete={removePacket}
            onNodeClick={handleNodeClick}
            onWhyClick={handleWhyClick}
            selectedNode={selectedNode}
          />

          <WhyPanel serviceId={whyNode} services={services} onClose={() => setWhyNode(null)} />
          {showIAM && <IAMPolicyViewer serviceId={showIAM} services={services} onClose={() => setShowIAM(null)} />}
          {showSQS && <SQSPostBox messages={sqsMessages} onClose={() => setShowSQS(false)} />}
        </motion.div>

        <ControlPanel
          onSendJob={handleSendJob}
          onForceFailure={handleForceFailure}
          onToggleSQS={() => setShowSQS(prev => !prev)}
          onReset={handleReset}
          isAnimating={isAnimating}
          sqsOpen={showSQS}
        />

        <StatusLog logs={logs} />
      </div>
    </div>
  );
}