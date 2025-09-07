const characters = [
  {
    name: "孫悟空(超サイヤ人)",
    icon: "images/Goku.png",
    url: "/Goku",
  },
  {
    name: "ベジータ(超サイヤ人)",
    icon: "images/Vegeta.png",
    url: "/Vegeta",
  },
  {
    name: "クリリン",
    icon: "images/Krillin.png",
    url: "/Krillin",
  },
  {
    name: "トランクス",
    icon: "images/Trunks.png",
    url: "/Trunks",
  },
  {
    name: "ピッコロ",
    icon: "images/Piccolo.png",
    url: "/Piccolo",
  },
  {
    name: "人造人間18号",
    icon: "images/Android-18.png",
    url: "/Android-18",
  },
  {
    name: "魔人ブウ:善",
    icon: "images/Majin-Boo.png",
    url: "/Majin-Boo",
  },
  {
    name: "ザマス",
    icon: "images/Zamasu.png",
    url: "/Zamasu",
  },
  {
    name: "孫悟飯:幼年期",
    icon: "images/Gohan.png",
    url: "/Gohan",
  },
  {
    name: "ベビー：少年体",
    icon: "images/Baby-boy.png",
    url: "/Baby-boy",
  },
  {
    name: "フリーザ：第一形態",
    icon: "images/Frieza-first.png",
    url: "/Frieza-first",
  },
  {
    name: "ダーブラ",
    icon: "images/Dabura.png",
    url: "/Dabura",
  },
  {
    name: "クウラ：最終形態",
    icon: "images/Cooler-final.png",
    url: "/Cooler-final",
  },
  {
    name: "スーパーウーブ",
    icon: "images/Super-Uub.png",
    url: "/Super-Uub",
  },
  {
    name: "フルパワーボージャック",
    icon: "images/BoJack-full.png",
    url: "/BoJack-full",
  },
  {
    name: "カリフラ(超サイヤ人)",
    icon: "images/Caulifla-s2.png",
    url: "/Caulifla-s2",
  },
  {
    name: "孫悟空（ミニ）",
    icon: "images/Goku-mini.png",
    url: "/Goku-mini",
  },
  {
    name: "セル：完全体",
    icon: "images/Cell-perfect.png",
    url: "/Cell-perfect",
  },
  {
    name: "人造人間17号",
    icon: "images/Android-17.png",
    url: "/Android-17",
  },
  {
    name: "ヒット",
    icon: "images/Hit.png",
    url: "/Hit",
  },
  {
    name: "ガンマ1号&ガンマ2号",
    icon: "images/Ganma.png",
    url: "/Ganma",
  },
  {
    name: "ダメージ",
    icon: "images/.png",
    url: "/Goku",
  },
];

const characterListContainer = document.getElementById("character-list");

characters.forEach((character) => {
  const link = document.createElement("a");
  link.href = `/character${character.url}`;
  link.className = "character-link";

  const icon = document.createElement("img");
  icon.src = character.icon;
  icon.alt = character.name;

  const name = document.createElement("span");
  name.textContent = character.name;
  name.className = "character-Name";

  link.appendChild(icon);
  link.appendChild(name);

  characterListContainer.appendChild(link);
});
