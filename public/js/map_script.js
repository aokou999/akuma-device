const mapContainer = document.getElementById("map-container");
const icons = document.querySelectorAll(".draggable-icon");

// ドラッグ中かどうかを判定するフラグ

let activeIcon = null;
// クリックした位置とアイコンの左上隅との差分を保持する変数
let offsetX = 0;
let offsetY = 0;

// 各アイコンにイベントリスナーを設定する
icons.forEach((icon) => {
  icon.addEventListener("mousedown", (e) => {
    activeIcon = icon;
    activeIcon.style.cursor = "grabbing";

    activeIcon.style.zIndex = "10";

    // マウスクリック位置とアイコンの現在位置の差分を計算
    offsetX = e.clientX - icon.getBoundingClientRect().left;
    offsetY = e.clientY - icon.getBoundingClientRect().top;
  });
});

// 2. マウスが動いた時の処理 (document全体で監視)
// アイコンからマウスが外れてもドラッグを継続できるようにするため
document.addEventListener("mousemove", (e) => {
  if (!activeIcon) return;

  // ドラッグ中のデフォルトの動作（テキスト選択など）を無効化
  e.preventDefault();

  // マップコンテナの情報を取得
  const mapRect = mapContainer.getBoundingClientRect();

  // マップの左上を(0,0)とした、アイコンの新しい座標を計算
  let newX = e.clientX - mapRect.left - offsetX;
  let newY = e.clientY - mapRect.top - offsetY;

  // === ここが境界チェックの核心部分 ===
  // X座標の最小値（左端）と最大値（右端）を計算
  const minX = 0;
  const maxX = mapContainer.clientWidth - activeIcon.clientWidth;
  // Y座標の最小値（上端）と最大値（下端）を計算
  const minY = 0;
  const maxY = mapContainer.clientHeight - activeIcon.clientHeight;

  // 計算した座標が範囲内に収まるように制限する
  newX = Math.max(minX, Math.min(newX, maxX));
  newY = Math.max(minY, Math.min(newY, maxY));
  // ===================================

  // アイコンの位置を更新
  activeIcon.style.left = `${newX}px`;
  activeIcon.style.top = `${newY}px`;
});

// 3. マウスのボタンが離された時の処理 (document全体で監視)
document.addEventListener("mouseup", () => {
  if (activeIcon) {
    activeIcon.style.cursor = "grab";
    activeIcon.style.zIndex = "";
  }
  activeIcon = null;
});
