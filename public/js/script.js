document.addEventListener("DOMContentLoaded", () => {
  // --- DOM要素の取得 ---
  const addRankBtn = document.getElementById("add-rank-btn");
  const tierListContainer = document.getElementById("tier-list-container");
  const characterPool = document.getElementById("character-pool");

  // --- 状態管理のための変数 ---
  let draggedItem = null; // ドラッグ中の「クローン要素」
  let sourceItem = null; // ドラッグ元の「オリジナル要素」
  let offsetX, offsetY;
  let originalZone = null; // ドラッグ元のゾーン
  let originalNextSibling = null; // ドラッグ元の要素の、元の次の要素
  let lastValidDropZone = null;

  // --- ブラウザ標準のドラッグ機能を無効化 ---
  document.addEventListener("dragstart", (e) => {
    // .draggable クラスを持つ要素の場合、イベントをキャンセル
    if (e.target.classList.contains("draggable")) {
      e.preventDefault();
    }
  });

  // 1. ドラッグ開始 (mousedown)
  document.addEventListener("mousedown", (e) => {
    // .draggable クラスを持つ要素で、左クリックの場合のみ
    if (e.button === 0 && e.target.classList.contains("draggable")) {
      // 意図しないテキスト選択などを防ぐ
      e.preventDefault();

      sourceItem = e.target;

      // ドラッグ開始時の元の場所を記憶
      originalZone = sourceItem.parentElement;
      originalNextSibling = sourceItem.nextElementSibling;

      // ドラッグ元のオリジナル要素に、ドラッグ中であることを示すクラスを付与
      sourceItem.classList.add("dragging-source");

      // オリジナル要素のクローン（分身）を作成
      draggedItem = sourceItem.cloneNode(true);
      draggedItem.classList.add("dragging");

      // マウスカーソルと要素の左上隅との差分を計算
      const rect = sourceItem.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      // クローンを絶対配置にし、カーソルに追従させる
      draggedItem.style.position = "absolute";
      draggedItem.style.left = `${e.clientX - offsetX}px`;
      draggedItem.style.top = `${e.clientY - offsetY + window.scrollY}px`;
      draggedItem.style.pointerEvents = "none";

      // クローンをbody直下に追加して、ページ全体を自由に動けるようにする
      document.body.appendChild(draggedItem);
      // document全体でマウスの動きとボタンを離すイベントを監視

      document.body.classList.add("is-dragging");

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  });

  // 2. ドラッグ中 (mousemove)
  function onMouseMove(e) {
    if (!draggedItem) return;

    // クローンをマウスの動きに追従させる
    draggedItem.style.left = `${e.clientX - offsetX}px`;
    draggedItem.style.top = `${e.clientY - offsetY + window.scrollY}px`;

    // ドラッグ中の要素を一時的に非表示にして、下の要素を取得
    draggedItem.style.display = "none";
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    draggedItem.style.display = "";

    const dropZone = elementBelow
      ? elementBelow.closest(".rank-drop-zone")
      : null;

    // すべてのドロップゾーンからハイライトを一旦削除
    document.querySelectorAll(".rank-drop-zone").forEach((dz) => {
      dz.classList.remove("drag-over");
    });

    // --- プレビュー機能の中核 ---
    if (dropZone) {
      // ドロップゾーンに入った場合、オリジナル要素をプレビューとして移動
      dropZone.classList.add("drag-over");
      const afterElement = getDragAfterElement(dropZone, e.clientX);
      if (afterElement == null) {
        dropZone.appendChild(sourceItem);
      } else {
        dropZone.insertBefore(sourceItem, afterElement);
      }
      lastValidDropZone = dropZone;
    } else {
      // どのドロップゾーンにも入っていない場合、オリジナル要素を元の場所に戻す
    }
  }

  // 3. ドラッグ終了 (mouseup)
  function onMouseUp(e) {
    if (!sourceItem) return;

    // --- 後片付け ---
    // mousemoveでプレビュー表示された位置が最終的な位置となるため、
    // ここでは要素の移動は不要。後片付けのみ行う。

    document.body.removeChild(draggedItem);
    sourceItem.classList.remove("dragging-source");

    document.querySelectorAll(".rank-drop-zone").forEach((dz) => {
      dz.classList.remove("drag-over");
    });

    document.body.classList.remove("is-dragging");
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    // 変数をリセット
    draggedItem = null;
    sourceItem = null;
    originalZone = null;
    originalNextSibling = null;
  }

  // 同じランク内で画像を移動させるための補助関数
  function getDragAfterElement(container, x) {
    // コンテナ内の、現在ドラッグしているオリジナル要素以外の draggable要素を取得
    const draggableElements = [
      ...container.querySelectorAll(".draggable:not(.dragging-source)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        // offsetが負の値で、かつこれまで見つかった最も近い要素よりも近い場合
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  // --- 初期ランクの生成 ---
  createRankElement("S", "#ff7f7f");
  createRankElement("A", "#ffbf7f");
  createRankElement("B", "#ffff7f");
  createRankElement("C", "#7fff7f");
  createRankElement("D", "#6495ED");

  // --- ランクの追加機能 ---
  addRankBtn.addEventListener("click", () => {
    createRankElement("New Rank", "#cccccc");
  });

  /**
   * 新しいTierランクのHTML要素を生成してページに追加する関数
   * @param {string} name - ランク名
   * @param {string} color - ランクの背景色
   */
  function createRankElement(name, color) {
    const rankDiv = document.createElement("div");
    rankDiv.classList.add("tier-rank");

    rankDiv.innerHTML = `
            <div class="rank-label" style="background-color: ${color};" contenteditable="true">${name}</div>
            <div class="rank-drop-zone"></div>
            <div class="rank-controls">
                <input type="color" value="${color}" class="rank-color-input" title="ランクの色を変更">
                <input type="text" value="${name}" class="rank-name-input" title="ランク名を変更">
                <button class="delete-rank-btn" title="ランクを削除">×</button>
            </div>
            
        `;
    tierListContainer.appendChild(rankDiv);
  }

  // --- ランクの操作 (名前変更、色変更、削除) 機能 ---
  // tierListContainer全体でイベントを監視する（イベント委任）
  tierListContainer.addEventListener("click", (e) => {
    // ランクの削除機能
    if (e.target.classList.contains("delete-rank-btn")) {
      const rankElement = e.target.closest(".tier-rank");
      if (
        confirm(
          `'${
            rankElement.querySelector(".rank-name-input").value
          }' ランクを削除しますか？`
        )
      ) {
        // ランク内のキャラクターを下のプールに戻す
        const images = rankElement.querySelectorAll(".draggable");
        images.forEach((img) => characterPool.appendChild(img));
        rankElement.remove();
      }
    }
  });

  tierListContainer.addEventListener("input", (e) => {
    const rankElement = e.target.closest(".tier-rank");
    if (!rankElement) return;

    const rankLabel = rankElement.querySelector(".rank-label");

    // ランクのカラー変更機能
    if (e.target.classList.contains("rank-color-input")) {
      rankLabel.style.backgroundColor = e.target.value;
    }

    // ランクの名前変更機能 (テキストボックス)
    if (e.target.classList.contains("rank-name-input")) {
      rankLabel.textContent = e.target.value;
    }
  });

  // ランクの名前変更機能 (ラベルを直接編集)
  tierListContainer.addEventListener(
    "blur",
    (e) => {
      if (
        e.target.classList.contains("rank-label") &&
        e.target.isContentEditable
      ) {
        const rankElement = e.target.closest(".tier-rank");
        const rankNameInput = rankElement.querySelector(".rank-name-input");
        rankNameInput.value = e.target.textContent;
      }
    },
    true
  );
});
