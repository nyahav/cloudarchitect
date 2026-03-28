// Centralized service data for the architecture diagram

export const SERVICES = {
  client: {
    id: "client",
    label: "Client",
    icon: "Monitor",
    color: "#94a3b8",
    glowColor: "rgba(148, 163, 184, 0.3)",
    x: 80,
    y: 250,
    why: {
      title: "Why a Client?",
      text: "The client is anyone sending a request to the API — a website, mobile app, or a curl command in the terminal. It sends an HTTP request and receives a response containing a Job ID."
    }
  },
  api: {
    id: "api",
    label: "API Server (EC2)",
    icon: "Server",
    color: "#0ea5e9",
    glowColor: "rgba(14, 165, 233, 0.3)",
    x: 300,
    y: 250,
    why: {
      title: "Why EC2 for the API?",
      text: "EC2 gives us a virtual server with full control over the OS. The API runs as a Docker Container on EC2, accepting HTTP requests on port 8080. It saves the Job to DynamoDB and publishes a message to SQS."
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
    icon: "Database",
    color: "#8b5cf6",
    glowColor: "rgba(139, 92, 246, 0.3)",
    x: 300,
    y: 80,
    why: {
      title: "Why DynamoDB?",
      text: "DynamoDB is a fully managed NoSQL database — AWS handles all maintenance, scaling, and backups. It offers millisecond latency and a generous free tier (25 read/write capacity units). We store all Jobs here with their current status."
    }
  },
  sqs: {
    id: "sqs",
    label: "SQS Queue",
    icon: "Mail",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.3)",
    x: 540,
    y: 250,
    why: {
      title: "Why SQS?",
      text: "SQS is a message queue — think of it as a post office box. The API drops messages in, and the Worker picks them up. This is called Decoupling: the API doesn't wait for the Worker to finish. If the Worker crashes, messages safely wait in the queue."
    }
  },
  worker: {
    id: "worker",
    label: "Worker (EC2)",
    icon: "Cog",
    color: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.3)",
    x: 780,
    y: 250,
    why: {
      title: "Why a separate Worker?",
      text: "The Worker runs as a separate Docker Container (on the same or different EC2). It polls SQS for messages and processes them. Keeping it separate enables independent scaling — add more Workers without touching the API."
    }
  },
  dlq: {
    id: "dlq",
    label: "Dead Letter Queue",
    icon: "AlertTriangle",
    color: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.3)",
    x: 540,
    y: 430,
    why: {
      title: "Why a Dead Letter Queue?",
      text: "The DLQ holds messages that failed processing 3 times (Redrive Policy). Instead of retrying infinitely, failed messages are moved here for investigation. This keeps the main queue clean and prevents poison-pill messages from blocking other jobs."
    }
  },
  lambda: {
    id: "lambda",
    label: "Lambda (Serverless)",
    icon: "Zap",
    color: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.3)",
    x: 780,
    y: 430,
    why: {
      title: "Why Lambda?",
      text: "Lambda is serverless compute — no server to manage! It runs automatically when a message arrives in the DLQ. It updates DynamoDB to mark the job as FAILED. You pay only for execution time (milliseconds), making it perfect for rare error-handling tasks."
    }
  }
};

export const CONNECTIONS = [
  { from: "client", to: "api", label: "HTTP Request" },
  { from: "api", to: "dynamodb", label: "Store Job" },
  { from: "api", to: "sqs", label: "Send Message" },
  { from: "sqs", to: "worker", label: "Receive Message" },
  { from: "worker", to: "dynamodb", label: "Update Status" },
  { from: "sqs", to: "dlq", label: "After 3 Failures" },
  { from: "dlq", to: "lambda", label: "Trigger" },
  { from: "lambda", to: "dynamodb", label: "Mark Failed" },
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