// Centralized service data for the architecture diagram

export const SERVICES = {
  client: {
    id: "client",
    label: "Client",
    labelHe: "לקוח (Client)",
    icon: "Monitor",
    color: "#94a3b8",
    glowColor: "rgba(148, 163, 184, 0.3)",
    x: 80,
    y: 250,
    why: {
      title: "למה Client?",
      text: "הלקוח הוא כל מי ששולח בקשה ל-API — זה יכול להיות אתר, אפליקציה, או פקודת curl בטרמינל. הוא שולח בקשת HTTP ומקבל תשובה עם מזהה Job."
    }
  },
  api: {
    id: "api",
    label: "API Server",
    labelHe: "API (EC2)",
    icon: "Server",
    color: "#0ea5e9",
    glowColor: "rgba(14, 165, 233, 0.3)",
    x: 300,
    y: 250,
    why: {
      title: "למה EC2 ל-API?",
      text: "EC2 נותן לנו שרת וירטואלי עם שליטה מלאה. ה-API רץ כ-Docker Container על EC2 ומקבל בקשות HTTP בפורט 8080. הוא שומר את ה-Job ב-DynamoDB ושולח הודעה ל-SQS."
    },
    iamPolicy: {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "DynamoDBAccess",
          Effect: "Allow",
          Action: ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem", "dynamodb:Query"],
          Resource: ["arn:aws:dynamodb:*:*:table/Jobs", "arn:aws:dynamodb:*:*:table/Jobs/index/*"]
        },
        {
          Sid: "SQSAccess",
          Effect: "Allow",
          Action: ["sqs:SendMessage"],
          Resource: "arn:aws:sqs:*:*:jobs-queue"
        },
        {
          Sid: "ParameterStoreAccess",
          Effect: "Allow",
          Action: ["ssm:GetParameter", "ssm:GetParameters"],
          Resource: "arn:aws:ssm:*:*:parameter/jobsys/*"
        }
      ]
    }
  },
  dynamodb: {
    id: "dynamodb",
    label: "DynamoDB",
    labelHe: "DynamoDB",
    icon: "Database",
    color: "#8b5cf6",
    glowColor: "rgba(139, 92, 246, 0.3)",
    x: 300,
    y: 80,
    why: {
      title: "למה DynamoDB?",
      text: "DynamoDB הוא מסד נתונים NoSQL מנוהל — אמזון מטפלת בכל התחזוקה. הוא מהיר (מילישניות), סקיילבילי, ובחינם עד 25 פעולות קריאה/כתיבה בשנייה. אנחנו שומרים פה את כל ה-Jobs עם הסטטוס שלהם."
    }
  },
  sqs: {
    id: "sqs",
    label: "SQS Queue",
    labelHe: "SQS (תור הודעות)",
    icon: "Mail",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.3)",
    x: 540,
    y: 250,
    why: {
      title: "למה SQS?",
      text: "SQS הוא תור הודעות — כמו תיבת דואר. ה-API שם הודעות (Jobs) בתור, וה-Worker שולף אותן. זה נקרא Decoupling — ה-API לא צריך לחכות שה-Worker יסיים. אם ה-Worker נפל, ההודעות ממתינות בתור."
    }
  },
  worker: {
    id: "worker",
    label: "Worker",
    labelHe: "Worker (EC2)",
    icon: "Cog",
    color: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.3)",
    x: 780,
    y: 250,
    why: {
      title: "למה Worker נפרד?",
      text: "ה-Worker רץ על EC2 נפרד (או אותו EC2 כ-Container נפרד). הוא שולף הודעות מ-SQS ומעבד אותן. ההפרדה מאפשרת סקיילינג — אפשר להוסיף Workers בלי לשנות את ה-API."
    }
  },
  dlq: {
    id: "dlq",
    label: "Dead Letter Queue",
    labelHe: "DLQ (תור שגיאות)",
    icon: "AlertTriangle",
    color: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.3)",
    x: 540,
    y: 430,
    why: {
      title: "למה Dead Letter Queue?",
      text: "DLQ מחזיק הודעות שנכשלו 3 פעמים (Redrive Policy). במקום לנסות אינסוף פעמים, ההודעה עוברת לתור שגיאות. זה מונע חסימה של התור הראשי ומאפשר חקירה של כשלונות."
    }
  },
  lambda: {
    id: "lambda",
    label: "Lambda",
    labelHe: "Lambda (Serverless)",
    icon: "Zap",
    color: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.3)",
    x: 780,
    y: 430,
    why: {
      title: "למה Lambda?",
      text: "Lambda היא פונקציה serverless — אין שרת לנהל! היא רצה רק כשמגיעה הודעה ל-DLQ. היא מעדכנת את הסטטוס ב-DynamoDB ל-FAILED. אתה משלם רק על זמן הריצה (מילישניות)."
    }
  }
};

export const CONNECTIONS = [
  { from: "client", to: "api", label: "HTTP Request", labelHe: "בקשת HTTP" },
  { from: "api", to: "dynamodb", label: "Store Job", labelHe: "שמירת Job" },
  { from: "api", to: "sqs", label: "Send Message", labelHe: "שליחת הודעה" },
  { from: "sqs", to: "worker", label: "Receive Message", labelHe: "קבלת הודעה" },
  { from: "worker", to: "dynamodb", label: "Update Status", labelHe: "עדכון סטטוס" },
  { from: "sqs", to: "dlq", label: "After 3 Failures", labelHe: "אחרי 3 כשלונות" },
  { from: "dlq", to: "lambda", label: "Trigger", labelHe: "הפעלה" },
  { from: "lambda", to: "dynamodb", label: "Mark Failed", labelHe: "סימון כנכשל" },
];

// SQS messages for the "Post Box" view
export const generateSQSMessage = (id, jobType) => ({
  messageId: `msg-${id}-${Date.now()}`,
  body: {
    jobId: `job-${Math.random().toString(36).substr(2, 8)}`,
    type: jobType || "process_document",
    priority: ["normal", "high", "low"][Math.floor(Math.random() * 3)],
    params: { source: `s3://bucket/file-${id}.pdf` }
  },
  sentTimestamp: Date.now(),
  visibilityTimeout: 300,
  receiveCount: 0,
  status: "waiting" // waiting | processing | completed | failed
});