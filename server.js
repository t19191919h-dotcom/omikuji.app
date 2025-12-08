const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// JSONデータの受け取りと静的ファイルの配信
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// 利用者向けページ
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 管理者ページ
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// コメント投稿（利用者が送信）
app.post("/comment", (req, res) => {
  const { text } = req.body;
  const comment = { text, date: new Date().toISOString() };

  try {
    const comments = JSON.parse(fs.readFileSync("comment.json", "utf8") || "[]");
    comments.push(comment);
    fs.writeFileSync("comment.json", JSON.stringify(comments, null, 2));
    res.sendStatus(200);
  } catch (err) {
    console.error("コメント保存エラー:", err);
    res.sendStatus(500);
  }
});

// コメント一覧取得（管理者のみ）
app.post("/comments", (req, res) => {
  const { password } = req.body;
  const correctPassword = "taichi123"; // 製作者だけが知っているパスワード

  if (password === correctPassword) {
    try {
      const comments = JSON.parse(fs.readFileSync("comment.json", "utf8") || "[]");
      res.json(comments);
    } catch (err) {
      console.error("コメント読み込みエラー:", err);
      res.sendStatus(500);
    }
  } else {
    res.status(403).send("Forbidden");
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});