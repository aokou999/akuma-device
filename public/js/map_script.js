const mapContainer = document.getElementById("map-container");
const mapLayer = document.getElementById("map-layer"); // 動かす対象
const icons = document.querySelectorAll(".draggable-icon");

// 状態管理変数
let scale = 1.0;
let translateX = 0;
let translateY = 0;

// 設定値
const MIN_SCALE = 0.5;
const MAX_SCALE = 4.0;
const ZOOM_SPEED = 0.1;

// ==========================================
// 1. ズーム機能 (ホイール)
// ==========================================
mapContainer.addEventListener("wheel", (e) => {
  e.preventDefault();

  const rect = mapLayer.getBoundingClientRect();

  // 1. マウス位置が「マップ画像の左上」から見て何pxの位置にあるかを計算（現在のスケールで）
  // (e.clientX - rect.left) は、画面上のマップ左端からマウスまでの距離
  const mouseXOnMap = (e.clientX - rect.left) / scale;
  const mouseYOnMap = (e.clientY - rect.top) / scale;

  // 2. 新しいスケールを計算
  let newScale = scale + (e.deltaY < 0 ? ZOOM_SPEED : -ZOOM_SPEED);
  newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

  // 3. ズーム後の位置調整
  // 「ズームしようが何しようが、マウスの下にあるマップの座標(mouseXOnMap)は変わってはいけない」
  // という式から逆算して translateX/Y を求めます。

  // コンテナの左上(0,0)から見たマウスの位置
  const containerMouseX = e.clientX - mapContainer.getBoundingClientRect().left;
  const containerMouseY = e.clientY - mapContainer.getBoundingClientRect().top;

  // 新しいTranslate = (コンテナ内のマウス位置) - (拡大後のマップ上のマウス位置)
  translateX = containerMouseX - mouseXOnMap * newScale;
  translateY = containerMouseY - mouseYOnMap * newScale;

  // 値を更新
  scale = newScale;
  updateTransform();

  // アイコンのサイズを維持したい場合（逆スケール）
  updateIconsScale();
});

function updateTransform() {
  mapLayer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function updateIconsScale() {
  // アイコンの見た目の大きさを維持したい場合は、逆数を掛ける
  const iconScale = 1 / scale;
  icons.forEach((icon) => {
    icon.style.transform = `scale(${iconScale})`;
  });
}

// ==========================================
// 2. アイコンのドラッグ機能 (スケール対応版)
// ==========================================
let activeIcon = null;
let startX = 0;
let startY = 0;
let initialIconLeft = 0;
let initialIconTop = 0;

icons.forEach((icon) => {
  icon.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      e.stopPropagation(); // マップ自体のドラッグ（実装する場合）と干渉しないように
      activeIcon = icon;
      activeIcon.style.cursor = "grabbing";
      activeIcon.style.zIndex = "100";

      // ドラッグ開始時のマウス位置
      startX = e.clientX;
      startY = e.clientY;

      // アイコンの現在のスタイル位置（mapLayer内での相対座標）を数値で取得
      // style.left が設定されていない場合は offsetLeft を使うなどの初期化が必要
      initialIconLeft = parseFloat(
        activeIcon.style.left || activeIcon.offsetLeft
      );
      initialIconTop = parseFloat(activeIcon.style.top || activeIcon.offsetTop);
    }
  });
});

document.addEventListener("mousemove", (e) => {
  if (!activeIcon) return;
  e.preventDefault();

  // マウスの移動量
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;

  // ★重要: 移動量をスケールで割る！
  // 画面上で 100px 動かしても、マップが 2倍(scale=2) なら、
  // マップ内部座標としては 50px しか動いていないことになるため。
  let newLeft = initialIconLeft + deltaX / scale;
  let newTop = initialIconTop + deltaY / scale;

  // 境界チェック (mapLayer のサイズ内に収める)
  // mapLayerの元サイズは width:1400, height:600 (CSS参照)
  const mapWidth = 1400;
  const mapHeight = 600;

  // アイコンの幅・高さ（スケールで変動しない内部サイズ）
  const iconW = activeIcon.offsetWidth;
  const iconH = activeIcon.offsetHeight;

  newLeft = Math.max(0, Math.min(newLeft, mapWidth - iconW));
  newTop = Math.max(0, Math.min(newTop, mapHeight - iconH));

  activeIcon.style.left = `${newLeft}px`;
  activeIcon.style.top = `${newTop}px`;
});

document.addEventListener("mouseup", () => {
  if (activeIcon) {
    activeIcon.style.cursor = "grab";
    activeIcon.style.zIndex = "";
    activeIcon = null;
  }
});

// ==========================================
// ★追加: 右クリックでのマップ移動 (パンニング)
// ==========================================

let isMapPanning = false;
let mapPanStartX = 0;
let mapPanStartY = 0;
let initialMapTransX = 0;
let initialMapTransY = 0;

// 1. マップコンテナ上でマウスボタンが押されたとき
mapContainer.addEventListener("mousedown", (e) => {
  // e.button === 2 は右クリックです
  if (e.button === 2) {
    isMapPanning = true;

    // ドラッグ開始時のマウス位置
    mapPanStartX = e.clientX;
    mapPanStartY = e.clientY;

    // ドラッグ開始時のマップの位置 (translateX, translateYはグローバル変数)
    initialMapTransX = translateX;
    initialMapTransY = translateY;

    mapContainer.style.cursor = "grabbing"; // カーソルを「掴む」形に
  }
});

// 2. マウスが動いたとき (document全体で監視)
document.addEventListener("mousemove", (e) => {
  // マップのドラッグ中でなければ何もしない
  if (!isMapPanning) return;

  e.preventDefault(); // テキスト選択などを防止

  // 移動量を計算
  const deltaX = e.clientX - mapPanStartX;
  const deltaY = e.clientY - mapPanStartY;

  // 新しい位置を計算して更新
  // ズームと違ってマップ全体を動かすので scale で割る必要はありません
  translateX = initialMapTransX + deltaX;
  translateY = initialMapTransY + deltaY;

  updateTransform();
});

// 3. マウスボタンが離されたとき
document.addEventListener("mouseup", () => {
  if (isMapPanning) {
    isMapPanning = false;
    mapContainer.style.cursor = "default"; // カーソルを元に戻す
  }
});

// 4. 右クリックメニュー（コンテキストメニュー）を無効化
// これがないと、右クリックを離した瞬間にメニューが出て邪魔になります
mapContainer.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});
