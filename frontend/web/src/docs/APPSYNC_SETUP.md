# AWS AppSync Real-time Messaging Setup Guide

This guide walks you through setting up AWS AppSync for 2-way real-time messaging in the Timely Mate application.

## Overview

AWS AppSync provides real-time GraphQL subscriptions for instant messaging, enabling:
- Real-time message delivery
- Message status tracking (sent, delivered, read)
- Typing indicators
- Message reactions
- File attachments
- Group and direct messaging
- Meeting-specific chat rooms

## Prerequisites

1. AWS Account with AppSync, Cognito, and DynamoDB access
2. AWS CLI configured
3. Node.js 18+ installed

## 1. AWS AppSync Setup

### Create AppSync API

```bash
# Using AWS CLI
aws appsync create-graphql-api \
  --name "timely-mate-chat" \
  --authentication-type AMAZON_COGNITO_USER_POOLS \
  --user-pool-config userPoolId=us-east-1_xxxxxxxxx,awsRegion=us-east-1,defaultAction=ALLOW
```

### Upload GraphQL Schema

Use the schema from `src/graphql/schema.graphql` in the AppSync console or via CLI:

```bash
aws appsync start-schema-creation \
  --api-id your-api-id \
  --definition fileb://src/graphql/schema.graphql
```

## 2. DynamoDB Tables Setup

### Messages Table
- **Table Name**: `TimelyMate-Messages`
- **Partition Key**: `id` (String)
- **Sort Key**: `timestamp` (String)
- **GSI**: `roomId-timestamp-index`
  - Partition Key: `roomId` (String)
  - Sort Key: `timestamp` (String)

### ChatRooms Table
- **Table Name**: `TimelyMate-ChatRooms`
- **Partition Key**: `id` (String)
- **GSI**: `participants-index`
  - Partition Key: `participants` (String Set)

### UserRooms Table
- **Table Name**: `TimelyMate-UserRooms`
- **Partition Key**: `userId` (String)
- **Sort Key**: `roomId` (String)

```bash
# Create Messages table
aws dynamodb create-table \
  --table-name TimelyMate-Messages \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=roomId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=roomId-timestamp-index,KeySchema=[{AttributeName=roomId,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

## 3. Data Sources and Resolvers

### Create DynamoDB Data Sources

In AppSync console, create data sources for each DynamoDB table:

1. **MessagesDataSource**: Points to `TimelyMate-Messages` table
2. **ChatRoomsDataSource**: Points to `TimelyMate-ChatRooms` table
3. **UserRoomsDataSource**: Points to `TimelyMate-UserRooms` table

### Resolver Examples

#### Send Message Resolver (Mutation.sendMessage)

**Request Mapping Template:**
```vtl
{
  "version": "2018-05-29",
  "operation": "PutItem",
  "key": {
    "id": $util.dynamodb.toDynamoDBJson($util.autoId()),
    "timestamp": $util.dynamodb.toDynamoDBJson($util.time.nowISO8601())
  },
  "attributeValues": {
    "content": $util.dynamodb.toDynamoDBJson($ctx.args.input.content),
    "senderId": $util.dynamodb.toDynamoDBJson($ctx.args.input.senderId),
    "senderName": $util.dynamodb.toDynamoDBJson($ctx.args.input.senderName),
    "roomId": $util.dynamodb.toDynamoDBJson($ctx.args.input.roomId),
    "roomType": $util.dynamodb.toDynamoDBJson($ctx.args.input.roomType),
    "messageType": $util.dynamodb.toDynamoDBJson($ctx.args.input.messageType),
    "status": $util.dynamodb.toDynamoDBJson("SENT"),
    "isEdited": $util.dynamodb.toDynamoDBJson(false),
    "reactions": $util.dynamodb.toDynamoDBJson([])
    #if($ctx.args.input.senderAvatar)
    ,"senderAvatar": $util.dynamodb.toDynamoDBJson($ctx.args.input.senderAvatar)
    #end
    #if($ctx.args.input.fileUrl)
    ,"fileUrl": $util.dynamodb.toDynamoDBJson($ctx.args.input.fileUrl)
    #end
    #if($ctx.args.input.fileName)
    ,"fileName": $util.dynamodb.toDynamoDBJson($ctx.args.input.fileName)
    #end
    #if($ctx.args.input.replyTo)
    ,"replyTo": $util.dynamodb.toDynamoDBJson($ctx.args.input.replyTo)
    #end
  }
}
```

**Response Mapping Template:**
```vtl
$util.toJson($ctx.result)
```

#### Get Messages Resolver (Query.getMessages)

**Request Mapping Template:**
```vtl
{
  "version": "2018-05-29",
  "operation": "Query",
  "index": "roomId-timestamp-index",
  "query": {
    "expression": "roomId = :roomId",
    "expressionValues": {
      ":roomId": $util.dynamodb.toDynamoDBJson($ctx.args.roomId)
    }
  },
  "scanIndexForward": false,
  "limit": #if($ctx.args.limit) $ctx.args.limit #else 50 #end
  #if($ctx.args.nextToken)
  ,"nextToken": "$ctx.args.nextToken"
  #end
}
```

**Response Mapping Template:**
```vtl
{
  "items": $util.toJson($ctx.result.items),
  "nextToken": #if($ctx.result.nextToken) "$ctx.result.nextToken" #else null #end
}
```

## 4. Environment Configuration

Create `.env.local` file in `frontend/web/`:

```env
VITE_AWS_REGION=us-east-1
VITE_APPSYNC_GRAPHQL_ENDPOINT=https://your-api-id.appsync-api.us-east-1.amazonaws.com/graphql
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 5. Authentication Integration

Update your Cognito user pool to include the AppSync API:

```typescript
// In your auth service
import { Auth } from 'aws-amplify';

export const getCurrentUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return {
      id: user.username,
      name: user.attributes.name || user.username,
      email: user.attributes.email,
      avatar: user.attributes.picture
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
```

## 6. Usage Examples

### Basic Chat Integration

```typescript
import { useChat } from '../hooks/useChat';

const ChatExample = () => {
  const { messages, sendMessage, loading, error } = useChat({
    roomId: 'meeting-123',
    userId: 'user-456',
    userName: 'John Doe',
    userAvatar: '/avatar.jpg'
  });

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <ChatComponent
      roomId="meeting-123"
      userId="user-456"
      userName="John Doe"
      userAvatar="/avatar.jpg"
      height="400px"
      isVisible={true}
    />
  );
};
```

### Meeting Integration

```typescript
// In your meeting component
const createMeetingChat = async (meetingId: string, participants: string[]) => {
  const room = await chatService.createMeetingChatRoom(
    meetingId,
    'Weekly Standup',
    participants
  );
  return room.id;
};
```

## 7. Security Considerations

### IAM Policies

Ensure your Cognito authenticated role has these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "appsync:GraphQL"
      ],
      "Resource": [
        "arn:aws:appsync:us-east-1:123456789012:apis/your-api-id/*"
      ]
    }
  ]
}
```

### Field-Level Authorization

Use `@aws_auth` directives in your schema:

```graphql
type Message @aws_auth(cognito_groups: ["Users"]) {
  id: ID!
  content: String!
  # Only sender can see private fields
  senderId: ID! @aws_auth(cognito_groups: ["Users"])
}
```

## 8. Performance Optimizations

### Connection Pooling
- Use connection pooling for WebSocket connections
- Implement exponential backoff for reconnections

### Message Pagination
- Implement cursor-based pagination
- Cache messages locally for offline support

### Subscription Management
- Unsubscribe from unused channels
- Batch subscription updates

## 9. Monitoring and Logging

### CloudWatch Metrics
- Monitor AppSync request rates
- Track error rates and latency
- Set up alarms for high error rates

### Custom Logging
```typescript
// Add to your chat service
const logChatEvent = (event: string, data: any) => {
  console.log(`[Chat] ${event}:`, data);
  // Send to your analytics service
};
```

## 10. Testing

### Unit Tests
```typescript
// Test chat service
describe('ChatService', () => {
  it('should send message successfully', async () => {
    const message = await chatService.sendMessage({
      content: 'Hello world',
      senderId: 'user-1',
      senderName: 'Test User',
      roomId: 'room-1',
      roomType: 'MEETING',
      messageType: 'TEXT'
    });
    
    expect(message.content).toBe('Hello world');
  });
});
```

### Integration Tests
- Test real-time subscriptions
- Verify message delivery
- Test offline scenarios

## 11. Deployment

### Infrastructure as Code
Use AWS CDK or CloudFormation to deploy:

```typescript
// CDK example
const api = new appsync.GraphqlApi(this, 'ChatApi', {
  name: 'timely-mate-chat',
  schema: appsync.Schema.fromAsset('schema.graphql'),
  authorizationConfig: {
    defaultAuthorization: {
      authorizationType: appsync.AuthorizationType.USER_POOL,
      userPoolConfig: {
        userPool: userPool,
      },
    },
  },
});
```

### CI/CD Pipeline
1. Build and test the application
2. Deploy AppSync schema changes
3. Update DynamoDB tables if needed
4. Deploy frontend with new environment variables

## Troubleshooting

### Common Issues

1. **Subscription not receiving messages**
   - Check WebSocket connection
   - Verify user permissions
   - Check subscription filters

2. **High latency**
   - Optimize resolver mapping templates
   - Check DynamoDB performance
   - Review network connectivity

3. **Authentication errors**
   - Verify Cognito token validity
   - Check IAM permissions
   - Validate user pool configuration

### Debug Tools

```typescript
// Enable debug logging
import { Amplify } from 'aws-amplify';

Amplify.configure({
  ...config,
  aws_appsync_graphqlEndpoint_debug: true
});
```

This setup provides a production-ready real-time messaging system with AWS AppSync, offering scalability, security, and excellent developer experience. 