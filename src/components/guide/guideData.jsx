export const GUIDE_STEPS = [
  {
    id: 1,
    title: "Architecture Overview",
    icon: "Network",
    color: "#0ea5e9",
    summary: "Understand the full data flow before building anything.",
    content: {
      intro: "Before writing a single CLI command, understand what we're building and why each service exists.",
      diagram: `Client → API (EC2) → DynamoDB (store job) → SQS (send message)
                   
Worker (EC2) ← SQS (receive message) → DynamoDB (update job status)
           
DLQ (SQS) → Lambda → DynamoDB (mark as failed)`,
      concepts: [
        {
          title: "Loosely Coupled Architecture",
          icon: "Link",
          color: "#0ea5e9",
          text: "Services communicate through AWS APIs, not direct connections. The API doesn't call the Worker directly — it drops a message in SQS and moves on. This is called async/event-driven architecture."
        },
        {
          title: "Managed Services",
          icon: "Cloud",
          color: "#8b5cf6",
          text: "DynamoDB, SQS, and Lambda are fully managed — AWS handles servers, updates, backups, and scaling. You configure and use them. Compare: DynamoDB vs. MySQL on EC2 (you'd manage the DB server yourself)."
        },
        {
          title: "The Cloud Mental Model",
          icon: "Lightbulb",
          color: "#f59e0b",
          text: "Old way: Buy a car, maintain it, insure it. Cloud way: Use Uber — pay per ride, zero maintenance. AWS lets you rent compute, storage, and queuing instead of owning the hardware."
        }
      ],
      tradeoffs: [
        { pro: "API responds instantly — doesn't wait for job processing", con: "More complex architecture to debug" },
        { pro: "Worker failures don't affect the API or user experience", con: "Eventual consistency — job status updates are not immediate" },
        { pro: "Each component scales independently", con: "More AWS services to learn and manage" },
      ]
    }
  },
  {
    id: 2,
    title: "DynamoDB Table",
    icon: "Database",
    color: "#8b5cf6",
    summary: "Create the NoSQL database that stores all job records.",
    content: {
      intro: "DynamoDB is a fully managed NoSQL database. Think of it as a giant key-value store where each row can have different attributes.",
      whyThis: "We chose DynamoDB over running MySQL on EC2 because we don't want to manage a database server. AWS handles replication, backups, and scaling automatically.",
      code: `aws dynamodb create-table \\
    --table-name Jobs \\
    --attribute-definitions \\
        AttributeName=jobId,AttributeType=S \\
        AttributeName=idempotencyKey,AttributeType=S \\
    --key-schema \\
        AttributeName=jobId,KeyType=HASH \\
    --global-secondary-indexes \\
        'IndexName=idempotencyKey-index,\\
        KeySchema=[{AttributeName=idempotencyKey,KeyType=HASH}],\\
        Projection={ProjectionType=ALL},\\
        ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}' \\
    --billing-mode PROVISIONED \\
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \\
    --region $AWS_REGION`,
      verify: `aws dynamodb describe-table --table-name Jobs --region $AWS_REGION`,
      concepts: [
        { title: "Primary Key (jobId)", text: "Every item in DynamoDB needs a unique primary key. jobId is our HASH key — like a row ID in SQL." },
        { title: "Global Secondary Index", text: "Allows querying by idempotencyKey. Without this index, you'd have to scan the entire table — expensive and slow." },
        { title: "Provisioned vs On-Demand", text: "PROVISIONED mode: you specify capacity upfront (free tier: 25 RCU/WCU). ON_DEMAND: pay per request, auto-scales. We use PROVISIONED to stay in free tier." },
      ],
      tradeoffs: [
        { pro: "No server management — AWS handles everything", con: "NoSQL means no JOINs — data model must be designed carefully" },
        { pro: "Millisecond latency at any scale", con: "Querying non-primary-key fields requires a GSI (extra cost/complexity)" },
        { pro: "Serverless billing — pay per request with On-Demand", con: "Provisioned capacity can be wasted if traffic is unpredictable" },
      ]
    }
  },
  {
    id: 3,
    title: "SQS Queues",
    icon: "Mail",
    color: "#f59e0b",
    summary: "Set up the message queue and dead letter queue for async job processing.",
    content: {
      intro: "SQS is a message queue — like a post office. The API puts messages in, the Worker takes them out. Messages wait safely even if the Worker is down.",
      whyThis: "We chose SQS over running RabbitMQ on EC2 because SQS is serverless — no broker to manage, patch, or scale. It stores messages durably until processed.",
      code: `# Create main queue
aws sqs create-queue \\
    --queue-name jobs-queue \\
    --attributes VisibilityTimeout=300,MessageRetentionPeriod=1209600 \\
    --region $AWS_REGION

# Create Dead Letter Queue
aws sqs create-queue \\
    --queue-name jobs-dlq \\
    --attributes MessageRetentionPeriod=1209600 \\
    --region $AWS_REGION

# Connect DLQ to main queue (after 3 failed attempts)
aws sqs set-queue-attributes \\
    --queue-url "$QUEUE_URL" \\
    --attributes '{"RedrivePolicy":"{\\"deadLetterTargetArn\\":\\"$DLQ_ARN\\",\\"maxReceiveCount\\":3}"}' \\
    --region $AWS_REGION`,
      verify: `aws sqs list-queues --region $AWS_REGION`,
      concepts: [
        { title: "Visibility Timeout (300s)", text: "When a Worker reads a message, it becomes invisible to other Workers for 5 minutes. If not deleted in time (job failed), it reappears for retry." },
        { title: "Message Retention (14 days)", text: "Messages are kept for 14 days if not processed. Useful if your Worker is down for a while — no messages are lost." },
        { title: "Redrive Policy (maxReceiveCount=3)", text: "After 3 failed processing attempts, the message is automatically moved to the DLQ. This prevents infinite retry loops from blocking your queue." },
      ],
      tradeoffs: [
        { pro: "Messages persist even if Worker crashes", con: "At-least-once delivery — Workers must be idempotent (same message processed twice = same result)" },
        { pro: "Decouples API from Worker — independent scaling", con: "Not real-time — there's a small delay between enqueue and process" },
        { pro: "DLQ catches poison-pill messages automatically", con: "Max message size is 256KB — large payloads need S3 + pointer pattern" },
      ]
    }
  },
  {
    id: 4,
    title: "ECR Repositories",
    icon: "Package",
    color: "#22c55e",
    summary: "Create private Docker image registries for the API and Worker.",
    content: {
      intro: "ECR (Elastic Container Registry) is AWS's private Docker registry. Think of it as Docker Hub, but private and integrated with AWS IAM.",
      whyThis: "We use ECR instead of Docker Hub because ECR integrates natively with IAM — no credentials needed when pulling images from EC2. It's also private by default.",
      code: `# Get your AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create API repository
aws ecr create-repository \\
    --repository-name svc-api \\
    --region $AWS_REGION

# Create Worker repository
aws ecr create-repository \\
    --repository-name svc-worker \\
    --region $AWS_REGION

# Build and push images
aws ecr get-login-password --region $AWS_REGION | \\
    docker login --username AWS --password-stdin \\
    $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

docker build -t svc-api:latest ./services/svc-api
docker tag svc-api:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/svc-api:latest
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/svc-api:latest`,
      verify: `aws ecr list-images --repository-name svc-api --region $AWS_REGION`,
      concepts: [
        { title: "Docker Images as Shipping Containers", text: "A Docker image packages your app + all dependencies. It runs identically on your laptop, CI/CD, and EC2. 'Works on my machine' problem: solved." },
        { title: "IAM-based Pull Auth", text: "EC2 with the right IAM role can pull ECR images without any credentials. AWS handles token rotation automatically via the instance metadata service." },
        { title: "Image Tags", text: "We use :latest for simplicity. In production, use commit SHA tags (e.g., :abc1234) for reproducible deploys and easy rollbacks." },
      ],
      tradeoffs: [
        { pro: "IAM-integrated — no credential management for EC2 pulls", con: "Cross-region pulls are slow and cost egress fees" },
        { pro: "Private by default — no accidental public exposure", con: "Costs $0.10/GB storage (small images are essentially free)" },
        { pro: "Lifecycle policies can auto-delete old images", con: "Requires Docker installed locally to build and push" },
      ]
    }
  },
  {
    id: 5,
    title: "IAM Roles & Policies",
    icon: "Shield",
    color: "#ef4444",
    summary: "Define what each service is allowed to do — the Principle of Least Privilege.",
    content: {
      intro: "IAM (Identity and Access Management) is AWS's permission system. It controls who can do what. This is the most security-critical step.",
      whyThis: "Without IAM, any service could access any resource. A compromised EC2 instance could delete your database. IAM limits blast radius by granting minimum necessary permissions.",
      code: `# Create EC2 trust policy (who can assume this role)
cat > /tmp/ec2-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ec2.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Create role
aws iam create-role \\
    --role-name jobsys-ec2-role \\
    --assume-role-policy-document file:///tmp/ec2-trust-policy.json

# Attach permissions policy (DynamoDB + SQS + SSM + ECR)
aws iam put-role-policy \\
    --role-name jobsys-ec2-role \\
    --policy-name jobsys-ec2-policy \\
    --policy-document file:///tmp/ec2-policy.json

# Create instance profile (so EC2 can use the role)
aws iam create-instance-profile \\
    --instance-profile-name jobsys-ec2-role

aws iam add-role-to-instance-profile \\
    --instance-profile-name jobsys-ec2-role \\
    --role-name jobsys-ec2-role`,
      verify: `aws iam get-role --role-name jobsys-ec2-role`,
      concepts: [
        { title: "Trust Policy vs Permission Policy", text: "Trust policy: WHO can use this role (e.g., EC2 service). Permission policy: WHAT that role can do (e.g., SQS:SendMessage). Both are required." },
        { title: "Instance Profile → IMDS", text: "EC2 gets temporary credentials via the Instance Metadata Service at 169.254.169.254. Your app calls AWS SDKs — they automatically fetch credentials from IMDS. Zero hardcoded keys." },
        { title: "Principle of Least Privilege", text: "Grant only the minimum permissions needed. The API can SendMessage to SQS but cannot DeleteQueue. If the API is compromised, the attacker can't destroy infrastructure." },
      ],
      tradeoffs: [
        { pro: "No hardcoded credentials — temporary tokens auto-rotate every ~6 hours", con: "IAM policies can be complex — easy to make overly permissive mistakes" },
        { pro: "Fine-grained control per service (API vs Worker vs Lambda)", con: "Resource ARNs must be exact — wildcard (*) opens security holes" },
        { pro: "CloudTrail audits every API call made by each role", con: "Debugging IAM denials can be frustrating — use IAM Policy Simulator" },
      ]
    }
  },
  {
    id: 6,
    title: "EC2 Instance",
    icon: "Server",
    color: "#0ea5e9",
    summary: "Launch a virtual server to run the API and Worker containers.",
    content: {
      intro: "EC2 (Elastic Compute Cloud) is a virtual server in the cloud. You choose the OS, instance type, and configuration. Your Docker containers run here.",
      whyThis: "We use EC2 because our API and Worker are long-running processes. Lambda has a 15-minute timeout and cold starts. EC2 gives us full control and predictable performance.",
      code: `# Get default VPC
VPC_ID=$(aws ec2 describe-vpcs \\
    --filters "Name=isDefault,Values=true" \\
    --query 'Vpcs[0].VpcId' --output text)

# Create security group (firewall)
SG_ID=$(aws ec2 create-security-group \\
    --group-name jobsys-ec2-sg \\
    --description "Security group for jobsys" \\
    --vpc-id "$VPC_ID" \\
    --query 'GroupId' --output text)

# Allow SSH from your IP only
MY_IP=$(curl -s https://checkip.amazonaws.com)
aws ec2 authorize-security-group-ingress \\
    --group-id "$SG_ID" --protocol tcp \\
    --port 22 --cidr "$MY_IP/32"

# Allow API traffic from anywhere
aws ec2 authorize-security-group-ingress \\
    --group-id "$SG_ID" --protocol tcp \\
    --port 8080 --cidr 0.0.0.0/0

# Launch instance (t3.micro = free tier)
INSTANCE_ID=$(aws ec2 run-instances \\
    --image-id "$AMI_ID" \\
    --instance-type t3.micro \\
    --security-group-ids "$SG_ID" \\
    --iam-instance-profile Name=jobsys-ec2-role \\
    --user-data file:///tmp/user-data.sh \\
    --query 'Instances[0].InstanceId' --output text)`,
      verify: `aws ec2 describe-instances --instance-ids "$INSTANCE_ID" \\
    --query 'Reservations[0].Instances[0].State.Name'`,
      concepts: [
        { title: "Security Groups as Firewalls", text: "Security groups are stateful firewalls. We only open port 22 (SSH) from our IP and port 8080 for the API. All other traffic is denied by default." },
        { title: "User Data Script", text: "A bash script that runs once on first boot. We use it to install Docker, pull images from ECR, and start our containers automatically." },
        { title: "t3.micro (Free Tier)", text: "750 hours/month free for 12 months. t3.micro = 2 vCPUs + 1GB RAM. Enough for learning. In production, right-size based on load testing." },
      ],
      tradeoffs: [
        { pro: "Full OS control — install anything, any runtime", con: "You manage OS patching, Docker updates, and app restarts" },
        { pro: "Persistent — always running, no cold starts", con: "Costs money even when idle (vs Lambda which is pay-per-invocation)" },
        { pro: "Familiar deployment model for most developers", con: "Horizontal scaling requires Load Balancer + Auto Scaling Group setup" },
      ]
    }
  },
  {
    id: 7,
    title: "Lambda + DLQ Handler",
    icon: "Zap",
    color: "#f97316",
    summary: "Create a serverless function triggered automatically by the Dead Letter Queue.",
    content: {
      intro: "Lambda is serverless compute — write a function, AWS runs it. No server to provision, patch, or manage. Perfect for event-driven tasks like handling failed jobs.",
      whyThis: "We use Lambda for DLQ processing because it only runs when there's a failed message. Running a dedicated EC2 instance 24/7 for rare failure events would be wasteful and expensive.",
      code: `# Create Lambda IAM role
aws iam create-role \\
    --role-name dlq-handler-role \\
    --assume-role-policy-document file:///tmp/lambda-trust-policy.json

# Attach DynamoDB + CloudWatch permissions
aws iam put-role-policy \\
    --role-name dlq-handler-role \\
    --policy-name dlq-handler-policy \\
    --policy-document file:///tmp/lambda-policy.json

# Create Lambda function from zip
aws lambda create-function \\
    --function-name dlq-handler \\
    --runtime python3.11 \\
    --role "$LAMBDA_ROLE_ARN" \\
    --handler lambda_function.lambda_handler \\
    --zip-file fileb://dlq-handler.zip \\
    --timeout 30 \\
    --memory-size 256 \\
    --environment "Variables={DDB_TABLE=Jobs}"

# Connect DLQ → Lambda (event source mapping)
aws lambda create-event-source-mapping \\
    --function-name dlq-handler \\
    --event-source-arn "$DLQ_ARN" \\
    --batch-size 1`,
      verify: `aws lambda get-function --function-name dlq-handler
aws lambda list-event-source-mappings --function-name dlq-handler`,
      concepts: [
        { title: "Event Source Mapping", text: "This is the 'wire' between DLQ and Lambda. When a message arrives in the DLQ, Lambda is triggered automatically. No polling code needed — AWS manages this." },
        { title: "Lambda Cold Starts", text: "First invocation after inactivity takes longer (cold start). For our DLQ handler, this is fine — a few hundred ms delay on rare error events is acceptable." },
        { title: "Concurrency & Scaling", text: "Lambda auto-scales to handle multiple messages simultaneously. Each invocation is isolated. With batch-size=1, each message gets its own Lambda execution." },
      ],
      tradeoffs: [
        { pro: "Zero infrastructure management — just upload code", con: "15-minute max timeout — not suitable for long-running jobs" },
        { pro: "Pay only when invoked — essentially free for rare DLQ events", con: "Cold starts can add latency (mitigate with Provisioned Concurrency)" },
        { pro: "Auto-scales to zero — no idle cost", con: "Local filesystem is ephemeral — use /tmp (512MB) or S3 for files" },
      ]
    }
  },
  {
    id: 8,
    title: "Testing the System",
    icon: "TestTube",
    color: "#22c55e",
    summary: "Verify each component works and trace a job through the full pipeline.",
    content: {
      intro: "Test each layer: create a job, watch it flow through SQS to the Worker, verify DynamoDB updates, and test the DLQ failure path.",
      whyThis: "End-to-end testing confirms all IAM permissions are correct, services can communicate, and your Redrive Policy works as expected.",
      code: `# Replace with your EC2 public IP
API_URL="http://$PUBLIC_IP:8080"

# Test 1: Create a job
curl -X POST "$API_URL/api/v1/jobs" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: test-$(date +%s)" \\
  -d '{
    "type": "process_document",
    "priority": "normal",
    "params": { "source": "s3://bucket/test.pdf" }
  }'

# Test 2: Check job status (use jobId from above)
curl "$API_URL/api/v1/jobs/$JOB_ID"
# Expected: PENDING → PROCESSING → SUCCEEDED

# Test 3: Verify in DynamoDB directly
aws dynamodb get-item \\
    --table-name Jobs \\
    --key "{\\"jobId\\":{\\"S\\":\\"$JOB_ID\\"}}"

# Test 4: Check SQS queue depth
aws sqs get-queue-attributes \\
    --queue-url "$QUEUE_URL" \\
    --attribute-names ApproximateNumberOfMessages`,
      verify: `# Watch Worker logs in real-time
aws logs tail /aws/jobsys/svc-worker --follow --region $AWS_REGION`,
      concepts: [
        { title: "Idempotency Key", text: "The Idempotency-Key header prevents duplicate jobs. If you retry the same request (network timeout), the API returns the existing job instead of creating a new one. DynamoDB's conditional writes enforce this." },
        { title: "Status Transitions", text: "PENDING → PROCESSING → SUCCEEDED (or FAILED). Each transition is a DynamoDB UpdateItem call. The API sets PENDING, Worker sets PROCESSING then SUCCEEDED, Lambda sets FAILED." },
        { title: "CloudWatch Logs", text: "All logs from EC2 containers and Lambda are in CloudWatch. Use 'aws logs tail' for real-time debugging without SSH-ing into instances." },
      ],
      tradeoffs: [
        { pro: "Idempotency prevents duplicate processing on retry", con: "Idempotency keys must be stored — adds DB storage and lookup cost" },
        { pro: "Async polling is simple to implement for clients", con: "Clients must poll for status — consider WebSockets or SNS notifications for real-time UX" },
        { pro: "CloudWatch gives centralized logs for all services", con: "CloudWatch Logs Insights queries cost money — use log levels to filter noise" },
      ]
    }
  }
];