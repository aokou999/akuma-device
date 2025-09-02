const cards = [
  {
    name: "電光石火",
    icon: "images/cards/card_s1_r1.png",
    level: 1,
    url: "/denkou",
  },
  {
    name: "超スノーボール",
    icon: "images/cards/card_s1_r2.png",
    level: 1,
    url: "/suno",
  },
  {
    name: "ビルドアップ",
    icon: "images/cards/card_s1_g1.png",
    level: 1,
    url: "/birudo",
  },
  {
    name: "へっちゃら！",
    icon: "images/cards/card_s1_g2.png",
    level: 1,
    url: "/hettya",
  },
  {
    name: "戦略的逃走",
    icon: "images/cards/card_s1_b1.png",
    level: 1,
    url: "/senryaku",
  },
  {
    name: "ゲキシンズハイ",
    icon: "images/cards/card_s1_b2.png",
    level: 1,
    url: "/gekishin",
  },
  {
    name: "ジャイアントキリング",
    icon: "images/cards/card_s2_r1.png",
    level: 2,
    url: "/jaian",
  },
  {
    name: "今楽にしてやる",
    icon: "images/cards/card_s2_r2.png",
    level: 2,
    url: "/imaraku",
  },
  {
    name: "鋼の皮膚",
    icon: "images/cards/card_s2_g1.png",
    level: 2,
    url: "/hagane",
  },
  {
    name: "カッチンバリア",
    icon: "images/cards/card_s2_g2.png",
    level: 2,
    url: "/kattin",
  },
  {
    name: "空蝉の術",
    icon: "images/cards/card_s2_b1.png",
    level: 2,
    url: "/utusemi",
  },
  {
    name: "エピックハンター",
    icon: "images/cards/card_s2_b2.png",
    level: 2,
    url: "/epikku",
  },
  {
    name: "凶戦士",
    icon: "images/cards/card_s3_r1.png",
    level: 3,
    url: "/kyousen",
  },
  {
    name: "追撃者",
    icon: "images/cards/card_s3_r2.png",
    level: 3,
    url: "/tsuigeki",
  },
  {
    name: "守護天使",
    icon: "images/cards/card_s3_g1.png",
    level: 3,
    url: "/syugoten",
  },
  {
    name: "ディフェンスステップ",
    icon: "images/cards/card_s3_g2.png",
    level: 3,
    url: "/dhifensu",
  },
  {
    name: "スニークアタック",
    icon: "images/cards/card_s3_b1.png",
    level: 3,
    url: "/suniku",
  },
  {
    name: "限界を超えた跳躍",
    icon: "images/cards/card_s3_b2.png",
    level: 3,
    url: "/genkai",
  },
];

const cardListContainer1 = document.getElementById("card-list1");
const cardListContainer2 = document.getElementById("card-list2");
const cardListContainer3 = document.getElementById("card-list3");

cards.forEach((card) => {
  const link = document.createElement("a");
  link.href = `/card${card.url}`;
  link.className = "card-link";

  const icon = document.createElement("img");
  icon.src = card.icon;
  icon.alt = card.name;

  const name = document.createElement("span");
  name.textContent = card.name;
  name.className = "card-name";

  link.appendChild(icon);
  link.appendChild(name);

  if (card.level === 1) {
    cardListContainer1.appendChild(link);
  } else if (card.level === 2) {
    cardListContainer2.appendChild(link);
  } else if (card.level === 3) {
    cardListContainer3.appendChild(link);
  }
});
