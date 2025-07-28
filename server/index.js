const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// SQLite 데이터베이스 초기화
const db = new sqlite3.Database('./soccer.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      opponent TEXT NOT NULL,
      score TEXT NOT NULL,
      location TEXT NOT NULL
    )`);
    console.log('Matches table created or already exists.');
  }
});

// API 엔드포인트: 모든 경기 가져오기
app.get('/api/matches', (req, res) => {
  db.all('SELECT * FROM matches', [], (err, rows) => {
    if (err) {
      res.status(400).json({
        "error": err.message
      });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});