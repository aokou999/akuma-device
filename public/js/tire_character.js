const characters = [
  {
    name: "孫悟空",
    icon: "images/Goku.png",
    class: "draggable",
  },
  {
    name: "ベジータ",
    icon: "images/Vegeta.png",
    class: "draggable",
  },
  {
    name: "クリリン",
    icon: "images/Krillin.png",
    class: "draggable",
  },
  {
    name: "トランクス",
    icon: "images/Trunks.png",
    class: "draggable",
  },
  {
    name: "ピッコロ",
    icon: "images/Piccolo.png",
    class: "draggable",
  },
  {
    name: "人造人間18号",
    icon: "images/Android-18.png",
    class: "draggable",
  },
  {
    name: "魔人ブウ",
    icon: "images/Majin-Boo.png",
    class: "draggable",
  },
  {
    name: "ザマス",
    icon: "images/Zamasu.png",
    class: "draggable",
  },
  {
    name: "孫悟飯",
    icon: "images/Gohan.png",
    class: "draggable",
  },
  {
    name: "ベビー",
    icon: "images/Baby-boy.png",
    class: "draggable",
  },
  {
    name: "フリーザ",
    icon: "images/Frieza-first.png",
    class: "draggable",
  },
  {
    name: "ダーブラ",
    icon: "images/Dabura.png",
    class: "draggable",
  },
  {
    name: "クウラ",
    icon: "images/Cooler-final.png",
    class: "draggable",
  },
  {
    name: "ウーブ",
    icon: "images/Super-Uub.png",
    class: "draggable",
  },
  {
    name: "ボージャック",
    icon: "images/BoJack-full.png",
    class: "draggable",
  },
  {
    name: "カリフラ",
    icon: "images/Caulifla-s2.png",
    class: "draggable",
  },
  {
    name: "孫悟空GT",
    icon: "images/Goku-mini.png",
    class: "draggable",
  },
  {
    name: "セル",
    icon: "images/Cell-perfect.png",
    class: "draggable",
  },
  {
    name: "人造人間17号",
    icon: "images/Android-17.png",
    class: "draggable",
  },
  {
    name: "ヒット",
    icon: "images/Hit.png",
    class: "draggable",
  },
  {
    name: "ダメージ",
    icon: "images/Goku.png",
    class: "draggable",
  },
  {
    name: "ダメージ",
    icon: "images/Goku.png",
    class: "draggable",
  },
];
const characterListContainer = document.getElementById("character-pool");

characters.forEach((character) => {
  const icon = document.createElement("img");
  icon.src = character.icon;
  icon.className = character.class;
  icon.alt = character.name;

  characterListContainer.appendChild(icon);
});
