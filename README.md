# AppFolio MCP Server (MVP)

## Setup
1. Copy `.env.example` to `.env` and fill in your AppFolio credentials and vhost.
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Run: `npm start`

## Usage
Send JSON requests to STDIN, receive JSON responses on STDOUT.

### Example Request
```
{
  "function": "get_cashflow_report",
  "args": {
    "property_visibility": "active",
    ...
  }
}
```
