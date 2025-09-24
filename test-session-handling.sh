#!/bin/bash

# Test script for robust MCP session handling
# This script tests various client behaviors that might cause issues

SERVER_URL="http://localhost:3000"
MCP_ENDPOINT="$SERVER_URL/mcp"

echo "🧪 Testing MCP Session Handling Robustness"
echo "=========================================="

# Test 1: Normal initialization flow
echo -e "\n1️⃣ Testing normal initialization flow..."
RESPONSE=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' \
  -D /tmp/headers1.txt)

if echo "$RESPONSE" | grep -q '"result"'; then
  SESSION_ID=$(grep -i "mcp-session-id" /tmp/headers1.txt | cut -d' ' -f2 | tr -d '\r\n' | sed 's/Mcp-Session-Id//')
  echo "✅ Initialize successful, session: $SESSION_ID"
else
  echo "❌ Initialize failed: $RESPONSE"
  exit 1
fi

# Test 2: Use session to list tools
echo -e "\n2️⃣ Testing tools list with session..."
TOOLS_RESPONSE=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}')

TOOL_COUNT=$(echo "$TOOLS_RESPONSE" | jq -r '.result.tools | length' 2>/dev/null || echo "0")
if [ "$TOOL_COUNT" -gt 0 ]; then
  echo "✅ Tools list successful: $TOOL_COUNT tools found"
else
  echo "❌ Tools list failed: $TOOLS_RESPONSE"
fi

# Test 3: Request without session (should auto-create or handle gracefully)
echo -e "\n3️⃣ Testing request without session (auto-recovery)..."
NO_SESSION_RESPONSE=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/list","params":{}}')

if echo "$NO_SESSION_RESPONSE" | grep -q '"result"'; then
  echo "✅ Auto-session creation successful"
elif echo "$NO_SESSION_RESPONSE" | grep -q '"error"'; then
  ERROR_CODE=$(echo "$NO_SESSION_RESPONSE" | jq -r '.error.code' 2>/dev/null || echo "unknown")
  echo "⚠️ Graceful error handling (code: $ERROR_CODE)"
else
  echo "❌ Unexpected response: $NO_SESSION_RESPONSE"
fi

# Test 4: Request with invalid session ID
echo -e "\n4️⃣ Testing request with invalid session ID..."
INVALID_SESSION_RESPONSE=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: invalid-session-12345" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/list","params":{}}')

if echo "$INVALID_SESSION_RESPONSE" | grep -q '"error"'; then
  ERROR_CODE=$(echo "$INVALID_SESSION_RESPONSE" | jq -r '.error.code' 2>/dev/null || echo "unknown")
  echo "✅ Invalid session handled gracefully (code: $ERROR_CODE)"
else
  echo "❌ Invalid session not handled properly: $INVALID_SESSION_RESPONSE"
fi

# Test 5: Multiple rapid requests (stress test)
echo -e "\n5️⃣ Testing multiple rapid requests..."
for i in {1..5}; do
  RAPID_RESPONSE=$(curl -s -X POST "$MCP_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "Mcp-Session-Id: $SESSION_ID" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":$((10+i)),\"method\":\"tools/list\",\"params\":{}}")
  
  if echo "$RAPID_RESPONSE" | grep -q '"result"'; then
    echo "  ✅ Request $i successful"
  else
    echo "  ❌ Request $i failed"
  fi
done

# Test 6: Check session status endpoint
echo -e "\n6️⃣ Testing session status endpoint..."
SESSION_STATUS=$(curl -s "$SERVER_URL/sessions" 2>/dev/null)
if echo "$SESSION_STATUS" | grep -q "totalSessions"; then
  TOTAL_SESSIONS=$(echo "$SESSION_STATUS" | jq -r '.totalSessions' 2>/dev/null || echo "unknown")
  echo "✅ Session status endpoint working: $TOTAL_SESSIONS active sessions"
else
  echo "⚠️ Session status endpoint not accessible (may require auth)"
fi

# Test 7: ChatGPT-style behavior simulation
echo -e "\n7️⃣ Testing ChatGPT-style client behavior..."

# ChatGPT might send initialize then immediately send tool requests
CHATGPT_INIT=$(curl -s -X POST "$MCP_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":100,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"clientInfo":{"name":"ChatGPT","version":"1.0.0"}}}' \
  -D /tmp/chatgpt_headers.txt)

if echo "$CHATGPT_INIT" | grep -q '"result"'; then
  CHATGPT_SESSION=$(grep -i "mcp-session-id" /tmp/chatgpt_headers.txt | cut -d' ' -f2 | tr -d '\r\n' | sed 's/Mcp-Session-Id//')
  echo "  ✅ ChatGPT-style init successful: $CHATGPT_SESSION"
  
  # Immediate tool call after init
  CHATGPT_TOOLS=$(curl -s -X POST "$MCP_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "Mcp-Session-Id: $CHATGPT_SESSION" \
    -d '{"jsonrpc":"2.0","id":101,"method":"tools/list","params":{}}')
    
  if echo "$CHATGPT_TOOLS" | grep -q '"result"'; then
    echo "  ✅ ChatGPT-style tool list successful"
  else
    echo "  ❌ ChatGPT-style tool list failed"
  fi
else
  echo "  ❌ ChatGPT-style init failed: $CHATGPT_INIT"
fi

echo -e "\n🏁 Test Complete!"
echo "Check server logs for detailed session handling information."
