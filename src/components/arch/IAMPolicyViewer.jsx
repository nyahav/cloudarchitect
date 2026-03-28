import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Lock } from "lucide-react";
import { SERVICES } from "./serviceData";

export default function IAMPolicyViewer({ serviceId, onClose }) {
  const service = serviceId ? SERVICES[serviceId] : null;
  const policy = service?.iamPolicy;

  if (!policy) return null;

  const policyJson = JSON.stringify(policy, null, 2);

  // Color-code the JSON
  const colorize = (json) => {
    return json
      .replace(/"([^"]+)":/g, '<span style="color: #0ea5e9">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span style="color: #22c55e">"$1"</span>')
      .replace(/: (\[)/g, ': <span style="color: #f59e0b">$1</span>')
      .replace(/(\])/g, '<span style="color: #f59e0b">$1</span>')
      .replace(/"Allow"/g, '<span style="color: #22c55e; font-weight: 600">"Allow"</span>')
      .replace(/"Deny"/g, '<span style="color: #ef4444; font-weight: 600">"Deny"</span>');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="absolute bottom-4 left-4 right-4 max-w-xl z-50"
        dir="rtl"
      >
        <div className="rounded-xl border border-primary/20 backdrop-blur-xl shadow-2xl overflow-hidden"
          style={{ background: "hsl(222 47% 8% / 0.97)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              <span className="font-semibold text-sm text-primary">IAM Policy — {service.labelHe}</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10">
                <Lock size={10} className="text-primary" />
                <span className="text-xs text-primary font-medium">Least Privilege</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 transition-colors">
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>

          {/* Policy JSON */}
          <div className="p-4 max-h-64 overflow-auto">
            <pre
              className="text-xs leading-relaxed font-mono"
              dir="ltr"
              dangerouslySetInnerHTML={{ __html: colorize(policyJson) }}
            />
          </div>

          {/* Explanation */}
          <div className="px-5 py-3 border-t border-primary/10 bg-primary/5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              💡 <strong className="text-foreground">Least Privilege:</strong> ה-Policy נותן רק את ההרשאות המינימליות שהשירות צריך. 
              ה-API יכול לכתוב ל-DynamoDB ולשלוח ל-SQS, אבל לא יכול למחוק טבלאות או ליצור Queues חדשים.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}