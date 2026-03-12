const mapContainer = document.getElementById("map-container");
const mapLayer = document.getElementById("map-layer");

// ★修正ポイント2: 拡大縮小の基準点を左上(0, 0)に固定（ズーム時のズレや座標バグを解消）
mapLayer.style.transformOrigin = "0 0";

// ==========================================
// 0. キャラクターリストの定義と生成
// ==========================================

// 画像ファイル名のリスト (拡張子を含む)
const charFiles = [
  "Goku.png",
  "Vegeta.png",
  "Krillin.png",
  "Trunks.png",
  "Piccolo.png",
  "Android-18.png",
  "Majin-Boo.png",
  "Zamasu.png",
  "Gohan.png",
  "Baby-boy.png",
  "Frieza-first.png",
  "Dabura.png",
  "Cooler-final.png",
  "Super-Uub.png",
  "BoJack-full.png",
  "Caulifla-s2.png",
  "Goku-mini.png",
  "Cell-perfect.png",
  "Android-17.png",
  "Hit.png",
  "Ganma.png",
  "Keru.png",
  "Goku-s3.png",
  "Gotenkusu.png",
  "Toppo.png",
  "Vegeta4.png",
  "UltimateGohan.png",
  "Burori.png",
  "Bezitto.png",
  "Badaku.png",
  "Kefura.png",
];

const RcharListContainer = document.getElementById("Rcharacter-list");
const LcharListContainer = document.getElementById("Lcharacter-list");

// リストをもとに画像を生成して配置
charFiles.forEach((fileName, index) => {
  const Rimg = document.createElement("img");
  const Limg = document.createElement("img");

  Rimg.src = `/images/${fileName}`;
  Limg.src = `/images/${fileName}`;

  Rimg.className = "Rsidebar-item sidebar-item";
  Limg.className = "Lsidebar-item sidebar-item";

  Rimg.dataset.src = `/images/${fileName}`;
  Limg.dataset.src = `/images/${fileName}`;

  Rimg.alt = `RChar ${index + 1}`;
  Limg.alt = `LChar ${index + 1}`;

  if (RcharListContainer) RcharListContainer.appendChild(Rimg);
  if (LcharListContainer) LcharListContainer.appendChild(Limg);
});

// サイドバー関連の要素
const sidebar = document.getElementById("sidebar-right");
const sidebarToggle = document.getElementById("sidebar-right-toggle");
const sidebarLeft = document.getElementById("sidebar-left");
const sidebarLeftToggle = document.getElementById("sidebar-left-toggle");
const sidebarBottom = document.getElementById("sidebar-bottom");
const sidebarBottomToggle = document.getElementById("sidebar-bottom-toggle");

// ==========================================
// 1. マップの状態管理変数
// ==========================================

// 状態管理変数
let scale = 1.0;
let translateX = 0;
let translateY = 0;

// 設定値
const MIN_SCALE = 0.5;
const MAX_SCALE = 4.0;
const ZOOM_SPEED = 0.1;

// ドラッグ状態管理
let activeIcon = null;
let isNewIcon = false; // ★修正ポイント1: 変数の宣言を追加（エラー防止）
let startX = 0;
let startY = 0;
let initialIconLeft = 0;
let initialIconTop = 0;

// マップパンニング管理
let isMapPanning = false;
let mapPanStartX = 0;
let mapPanStartY = 0;
let initialMapTransX = 0;
let initialMapTransY = 0;

// ==========================================
// 2. サイドバーの開閉処理
// ==========================================
function setupSidebar(sidebarId, toggleId, closedText, openedText) {
  const sidebar = document.getElementById(sidebarId);
  const toggle = document.getElementById(toggleId);

  if (sidebar && toggle) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("closed");
      toggle.textContent = sidebar.classList.contains("closed")
        ? closedText
        : openedText;
    });

    sidebar.addEventListener("mousedown", (e) => e.stopPropagation());
    sidebar.addEventListener("wheel", (e) => e.stopPropagation());
  }
}

setupSidebar("sidebar-right", "sidebar-right-toggle", "◀", "▶");
setupSidebar("sidebar-left", "sidebar-left-toggle", "▶", "◀");
setupSidebar("sidebar-bottom", "sidebar-bottom-toggle", "▲", "▼");

// ==========================================
// 3. アイコン操作 (ドラッグ＆ドロップ)
// ==========================================

// --- A. サイドバーからのドラッグ開始 ---
document.querySelectorAll(".sidebar-item").forEach((item) => {
  item.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // 左クリックのみ
    e.preventDefault();
    e.stopPropagation();

    const imgSrc = item.dataset.src;

    const newIcon = document.createElement("div");
    newIcon.classList.add("draggable-icon");
    if (item.closest("#sidebar-right")) {
      newIcon.classList.add("from-right");
    } else if (item.closest("#sidebar-left")) {
      newIcon.classList.add("from-left");
    } else if (item.closest("#sidebar-bottom")) {
      newIcon.classList.add("from-bottom");
    }
    newIcon.style.backgroundImage = `url(${imgSrc})`;
    newIcon.style.position = "fixed";
    newIcon.style.zIndex = "9999";
    newIcon.style.width = "50px";
    newIcon.style.height = "50px";
    newIcon.style.pointerEvents = "none";

    document.body.appendChild(newIcon);

    // 中心合わせ
    newIcon.style.left = `${e.clientX - 25}px`;
    newIcon.style.top = `${e.clientY - 25}px`;

    // 状態セット
    activeIcon = newIcon;
    isNewIcon = true;
    startX = e.clientX;
    startY = e.clientY;

    // 初期位置 (画面座標)
    initialIconLeft = e.clientX - 25;
    initialIconTop = e.clientY - 25;
  });
});

// --- B. マップ上のアイコンにイベント付与 ---
function attachMapIconEvents(icon) {
  icon.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      e.stopPropagation();
      activeIcon = icon;
      isNewIcon = false; // 既存アイコン
      activeIcon.style.cursor = "grabbing";
      activeIcon.style.zIndex = "1000";

      startX = e.clientX;
      startY = e.clientY;

      initialIconLeft = parseFloat(icon.style.left);
      initialIconTop = parseFloat(icon.style.top);
    }
  });

  icon.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("削除しますか？")) {
      icon.remove();
    }
  });
}

// ==========================================
// 4. マウス移動処理 (共通)
// ==========================================
document.addEventListener("mousemove", (e) => {
  // --- アイコンのドラッグ ---
  if (activeIcon) {
    e.preventDefault();
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // ★修正ポイント3: 新規アイコンと既存アイコンで移動量の計算を分ける
    if (isNewIcon) {
      // サイドバーから出したばかりのアイコンは画面基準なのでスケールを無視する
      activeIcon.style.left = `${initialIconLeft + deltaX}px`;
      activeIcon.style.top = `${initialIconTop + deltaY}px`;
    } else {
      // マップ上のアイコンはマップ基準なのでスケールで割って移動量を調整する
      activeIcon.style.left = `${initialIconLeft + deltaX / scale}px`;
      activeIcon.style.top = `${initialIconTop + deltaY / scale}px`;
    }
    return;
  }

  // --- マップのパンニング (右クリックドラッグ) ---
  if (isMapPanning) {
    e.preventDefault();
    const deltaX = e.clientX - mapPanStartX;
    const deltaY = e.clientY - mapPanStartY;

    translateX = initialMapTransX + deltaX;
    translateY = initialMapTransY + deltaY;

    updateTransform();
  }
});

// ==========================================
// 5. マウスアップ (ドロップ処理)
// ==========================================
document.addEventListener("mouseup", (e) => {
  if (activeIcon) {
    // --- 新規アイコンのドロップ処理 ---
    if (isNewIcon) {
      const containerRect = mapContainer.getBoundingClientRect();
      const isInMap =
        e.clientX >= containerRect.left &&
        e.clientX <= containerRect.right &&
        e.clientY >= containerRect.top &&
        e.clientY <= containerRect.bottom;

      if (isInMap) {
        // 画面座標 → マップ内座標 への変換
        const mapX = (e.clientX - containerRect.left - translateX) / scale;
        const mapY = (e.clientY - containerRect.top - translateY) / scale;

        activeIcon.style.position = "absolute";
        activeIcon.style.zIndex = "";
        activeIcon.style.pointerEvents = "auto";
        activeIcon.style.left = `${mapX - 25}px`;
        activeIcon.style.top = `${mapY - 25}px`;

        mapLayer.appendChild(activeIcon);
        attachMapIconEvents(activeIcon);
      } else {
        activeIcon.remove();
      }
    } else {
      // --- 既存アイコンのドラッグ終了 ---
      activeIcon.style.cursor = "grab";
      activeIcon.style.zIndex = "";
    }
    activeIcon = null;
    isNewIcon = false;
  }

  if (isMapPanning) {
    isMapPanning = false;
    mapContainer.style.cursor = "default";
  }
});

// ==========================================
// 6. ズーム & パン機能
// ==========================================
function updateTransform() {
  mapLayer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// ズーム処理
mapContainer.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();

    const rect = mapContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const targetX = (mouseX - translateX) / scale;
    const targetY = (mouseY - translateY) / scale;

    let newScale = scale + (e.deltaY < 0 ? ZOOM_SPEED : -ZOOM_SPEED);
    newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

    translateX = mouseX - targetX * newScale;
    translateY = mouseY - targetY * newScale;

    scale = newScale;
    updateTransform();
  },
  { passive: false },
);

// パンニング開始 (右クリック)
mapContainer.addEventListener("mousedown", (e) => {
  if (e.button === 2) {
    isMapPanning = true;
    mapPanStartX = e.clientX;
    mapPanStartY = e.clientY;
    initialMapTransX = translateX;
    initialMapTransY = translateY;
    mapContainer.style.cursor = "grabbing";
  }
});

// コンテキストメニュー無効化
mapContainer.addEventListener("contextmenu", (e) => e.preventDefault());
