const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Collections API
app.get('/api/collections', (req, res) => {
  res.json({
    collections: [
      { id: 1, name: 'Test Collection 1', description: 'Test collection for E2E tests' },
      { id: 2, name: 'Test Collection 2', description: 'Another test collection' }
    ]
  });
});

app.post('/api/collections', (req, res) => {
  const { name, description } = req.body;
  res.status(201).json({
    id: Date.now(),
    name,
    description,
    created_at: new Date().toISOString()
  });
});

// Documents API
app.get('/api/documents', (req, res) => {
  res.json({
    documents: [
      { id: 1, title: 'Test Document 1', content: 'Test content for E2E tests' },
      { id: 2, title: 'Test Document 2', content: 'Another test document' }
    ]
  });
});

// Search API
app.post('/api/search', (req, res) => {
  const { query, type = 'semantic' } = req.body;
  res.json({
    results: [
      {
        id: 1,
        title: 'Search Result 1',
        content: `Result for query: ${query}`,
        similarity: 0.95,
        source: 'test-document-1.pdf'
      },
      {
        id: 2,
        title: 'Search Result 2', 
        content: `Another result for: ${query}`,
        similarity: 0.87,
        source: 'test-document-2.pdf'
      }
    ],
    query,
    type,
    total: 2
  });
});

// Admin API
app.get('/api/admin/users', (req, res) => {
  res.status(403).json({ error: 'Forbidden' });
});

app.get('/api/admin/settings', (req, res) => {
  res.status(403).json({ error: 'Forbidden' });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});

module.exports = app;