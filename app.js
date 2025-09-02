const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/tire", (req, res) => {
  res.render("tire.ejs");
});

app.get("/map", (req, res) => {
  res.render("map.ejs");
});

app.get("/character", (req, res) => {
  res.render("character.ejs");
});

app.get("/card", (req, res) => {
  res.render("card.ejs");
});

// JSONファイルやデータベースから全キャラクターのデータを読み込んでおく
const characters = require("./data/characters.json");
const cards = require("./data/cards.json");

// '/character/:id' というルートを1つだけ定義する
// :id の部分には、gokuやchar2など、どんな文字列も入る
app.get("/character/:id", (req, res) => {
  // URLの :id の部分に入力された値を取得する
  const characterId = req.params.id;

  // 全キャラクターのデータの中から、IDが一致するものを探す
  const characterData = characters.find((char) => char.id === characterId);

  // もしキャラクターが見つかったら
  if (characterData) {
    // character.ejs という一つのテンプレートを使い、
    // 見つけたキャラクターのデータ (characterData) を渡してページを生成する
    res.render("character-detail.ejs", { character: characterData });
  } else {
    // 見つからなかった場合は404ページなどを表示
    res.status(404).send("キャラクターが見つかりません");
  }
});

app.get("/card/:id", (req, res) => {
  const cardId = req.params.id;

  const cardData = cards.find((ca) => ca.id === cardId);

  if (cardData) {
    res.render("card-detail.ejs", { card: cardData });
  } else {
    res.status(404).send("キャラクターが見つかりません");
  }
});

// サーバーを起動するコードを貼り付けてください
app.listen(3000);
