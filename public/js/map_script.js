const mapContainer = document.getElementById("map-container");
const mapLayer = document.getElementById("map-layer");
// 既存のアイコンがある場合は取得（動的に追加されるため、この変数はあまり使わなくなります）
const existingIcons = document.querySelectorAll(".draggable-icon");

// サイドバー関連の要素
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarItems = document.querySelectorAll(".sidebar-item");

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
// 1. 初期化処理
// ==========================================

// 既存のアイコンがあればイベントを付与
existingIcons.forEach((icon) => attachIconEvents(icon));

// サイドバーの開閉トグル
sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("closed");
  // ボタンの文字を切り替え
  sidebarToggle.textContent = sidebar.classList.contains("closed") ? "◀" : "▶";
});

// サイドバー自体へのクリックがマップに伝播しないようにする
sidebar.addEventListener("mousedown", (e) => e.stopPropagation());
sidebar.addEventListener("wheel", (e) => e.stopPropagation());

// ==========================================
// 2. アイコン生成とイベント付与関数 (重要)
// ==========================================

/**
 * アイコンに左ドラッグ移動・右クリック削除のイベントを付与する
 */
function attachIconEvents(icon) {
  // --- A. 左クリックでドラッグ開始 ---
  icon.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      // 左クリックのみ
      e.stopPropagation(); // マップのパンニングを防ぐ

      activeIcon = icon;
      activeIcon.style.cursor = "grabbing";
      activeIcon.style.zIndex = "1000";

      startX = e.clientX;
      startY = e.clientY;

      // 現在の位置を取得
      initialIconLeft = parseFloat(
        activeIcon.style.left || activeIcon.offsetLeft
      );
      initialIconTop = parseFloat(activeIcon.style.top || activeIcon.offsetTop);
    }
  });

  // --- B. 右クリックで削除 ---
  icon.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // ブラウザのメニューを出さない
    e.stopPropagation(); // マップへの伝播を防ぐ

    // 削除確認（誤操作防止のため入れていますが、不要なら削除してください）
    if (confirm("このアイコンを削除しますか？")) {
      icon.remove();

      // もしドラッグ中のアイコンを消した場合は状態をリセット
      if (activeIcon === icon) activeIcon = null;
    }
  });
}

// ==========================================
// 3. サイドバーからのドラッグ＆ドロップ実装
// ==========================================

sidebarItems.forEach((item) => {
  item.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // 左クリックのみ
    e.preventDefault(); // 画像自体のブラウザドラッグ動作をキャンセル
    e.stopPropagation();

    // 1. 画像ソースを取得
    const imgSrc = item.dataset.src;

    // 2. 新しいアイコン要素を作成
    const newIcon = document.createElement("div");
    newIcon.classList.add("draggable-icon");
    newIcon.style.backgroundImage = `url(${imgSrc})`;

    // マップレイヤーに追加
    mapLayer.appendChild(newIcon);

    // 3. アイコンの初期位置を計算
    // マウスカーソルの位置にアイコンの中心が来るように配置する

    // マップコンテナの現在の位置・スケールを考慮して、マップレイヤー内での座標を計算
    // 式: (画面上のマウス位置 - コンテナの左上 - マップの移動量) / スケール
    const containerRect = mapContainer.getBoundingClientRect();

    // アイコンのサイズ（CSSで定義済みと仮定、あるいは動的取得）
    const iconWidth = 50;
    const iconHeight = 50;

    // マップ内部座標系でのマウス位置
    const mouseXOnMap = (e.clientX - containerRect.left - translateX) / scale;
    const mouseYOnMap = (e.clientY - containerRect.top - translateY) / scale;

    // アイコンの中心をマウス位置に合わせる
    const initLeft = mouseXOnMap - iconWidth / 2;
    const initTop = mouseYOnMap - iconHeight / 2;

    newIcon.style.left = `${initLeft}px`;
    newIcon.style.top = `${initTop}px`;

    // 4. イベントリスナーを付与（移動・削除機能を追加）
    attachIconEvents(newIcon);

    // 5. そのままドラッグ状態に移行させる
    // これにより、クリックして生成した瞬間からスムーズに動かせます
    activeIcon = newIcon;
    activeIcon.style.cursor = "grabbing";
    activeIcon.style.zIndex = "1000";

    startX = e.clientX;
    startY = e.clientY;
    initialIconLeft = initLeft;
    initialIconTop = initTop;
  });
});

// ==========================================
// 4. マウス移動処理 (共通)
// ==========================================
document.addEventListener("mousemove", (e) => {
  // --- アイコンのドラッグ ---
  if (activeIcon) {
    e.preventDefault();
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // スケールを考慮して移動量を計算
    let newLeft = initialIconLeft + deltaX / scale;
    let newTop = initialIconTop + deltaY / scale;

    activeIcon.style.left = `${newLeft}px`;
    activeIcon.style.top = `${newTop}px`;
    return; // アイコン移動中はマップ移動などの処理をしない
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
// 5. マウスアップ処理 (共通)
// ==========================================
document.addEventListener("mouseup", () => {
  if (activeIcon) {
    activeIcon.style.cursor = "grab";
    activeIcon.style.zIndex = "";
    activeIcon = null;
  }

  if (isMapPanning) {
    isMapPanning = false;
    mapContainer.style.cursor = "default";
  }
});

// ==========================================
// 6. その他のマップ機能 (ズーム・パンニング)
// ==========================================

function updateTransform() {
  mapLayer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// ズーム処理
mapContainer.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = mapLayer.getBoundingClientRect();
  const mouseXOnMap = (e.clientX - rect.left) / scale;
  const mouseYOnMap = (e.clientY - rect.top) / scale;

  let newScale = scale + (e.deltaY < 0 ? ZOOM_SPEED : -ZOOM_SPEED);
  newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

  const containerMouseX = e.clientX - mapContainer.getBoundingClientRect().left;
  const containerMouseY = e.clientY - mapContainer.getBoundingClientRect().top;

  translateX = containerMouseX - mouseXOnMap * newScale;
  translateY = containerMouseY - mouseYOnMap * newScale;

  scale = newScale;
  updateTransform();

  // アイコンサイズの逆補正（必要であれば）

  const iconScale = 1 / scale;
  document.querySelectorAll(".draggable-icon").forEach((icon) => {
    icon.style.transform = `scale(${iconScale})`;
  });
});

// マップの右クリックパンニング開始
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

// コンテキストメニュー無効化 (マップ全体)
mapContainer.addEventListener("contextmenu", (e) => e.preventDefault());
