import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gamifier MCP Server is running' });
});

// MCP endpoints
app.post('/mcp/execute', (req, res) => {
  // Handle MCP execution requests
  const { command, parameters } = req.body;
  
  // TODO: Implement command handling logic
  res.json({
    success: true,
    message: 'Command received',
    command,
    parameters
  });
});

// Start server
app.listen(port, () => {
  console.log(`Gamifier MCP Server running on port ${port}`);
}); 