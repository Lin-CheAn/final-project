// ✅ 初始設定與清除歷史
localStorage.removeItem("ratingHistoryList");

const tracksData = JSON.parse(document.getElementById("song-list").dataset.tracks);
const list = document.getElementById('song-list');
const ratings = {};
let hasSubmitted = false;

// 建立 trackId → name 對應表
const trackMap = {};
tracksData.forEach(song => {
  trackMap[song.id] = song.name;
});

function createSongElement(song, enableRating = true) {
  const songId = song.id || song.track_id;
  const item = document.createElement('div');
  item.className = 'song-item';

  const title = document.createElement('div');
  title.className = 'song-name';
  const displayName = song.name || `${song.track_name} - ${song.artist_name}`;
  title.textContent = displayName;
  title.dataset.id = songId;

  const playerBox = document.createElement('div');
  playerBox.className = 'player-box';

  title.onclick = () => {
    if (playerBox.innerHTML !== "") {
      playerBox.innerHTML = "";
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.borderRadius = '12px';
    iframe.src = `https://open.spotify.com/embed/track/${songId}`;
    iframe.width = "100%";
    iframe.height = "80";
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    playerBox.innerHTML = "";
    playerBox.appendChild(iframe);

    if (enableRating) {
      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'rating';
      let currentRating = ratings[songId] || 0;

      const stars = [];
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '★';
        star.onclick = () => {
          currentRating = i;
          ratings[songId] = currentRating;
          updateStars();
        };
        star.onmouseover = () => highlightStars(i);
        star.onmouseout = () => updateStars();
        stars.push(star);
        ratingDiv.appendChild(star);
      }

      function highlightStars(n) {
        stars.forEach((s, idx) => s.classList.toggle('hovered', idx < n));
      }

      function updateStars() {
        stars.forEach((s, idx) => {
          s.classList.toggle('selected', idx < currentRating);
          s.classList.remove('hovered');
        });
      }

      updateStars();
      playerBox.appendChild(ratingDiv);
    }
  };

  item.appendChild(title);
  item.appendChild(playerBox);
  return item;
}

tracksData.forEach(song => {
  const item = createSongElement(song, true);
  list.appendChild(item);
});

document.getElementById('submit-button').onclick = () => {
  if (Object.keys(ratings).length === 0) {
    alert("請先對至少一首歌曲進行評分！");
    return;
  }

  // 🔁 從頁面中補全名稱對應（防止漏失）
  document.querySelectorAll('.song-item').forEach(item => {
    const titleDiv = item.querySelector('.song-name');
    const name = titleDiv.textContent;
    const id = titleDiv.dataset.id;
    if (id && name) {
      trackMap[id] = name;
    }
  });

  const fullHistory = JSON.parse(localStorage.getItem("ratingHistoryList")) || [];
  fullHistory.push({ ...ratings });
  localStorage.setItem("ratingHistoryList", JSON.stringify(fullHistory));

  updateRatingHistory();

  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ratings: ratings })
  })
    .then(res => res.json())
    .then(data => {
      const recommendList = document.getElementById('recommend-list');
      recommendList.innerHTML = '';

      data.forEach(song => {
        const songId = song.track_id;
        const name = `${song.track_name} - ${song.artist_name}`;
        trackMap[songId] = name;
        const item = createSongElement(song, true);
        recommendList.appendChild(item);
      });

      document.getElementById('recommend-box').style.display = 'block';
      document.getElementById('history-box').style.display = 'block';
      document.getElementById('initial-box').style.display = 'none';

      if (!hasSubmitted) {
        hasSubmitted = true;
        document.getElementById('submit-button').textContent = '再次推薦';
      }
    })
    .catch(err => {
      alert("❌ 送出失敗，請確認後端是否正常運作");
      console.error(err);
    });
};

function updateRatingHistory() {
  const container = document.getElementById("rating-history");
  const historyList = JSON.parse(localStorage.getItem("ratingHistoryList")) || [];

  if (historyList.length === 0) {
    container.innerHTML = "尚無評分紀錄";
    return;
  }

  const allContent = document.createElement("div");

  historyList.forEach((entry, index) => {
    const title = document.createElement("h4");
    title.textContent = `【第 ${index + 1} 次評分紀錄】`;
    allContent.appendChild(title);

    const ul = document.createElement("ul");
    Object.entries(entry).forEach(([trackId, score]) => {
      const name = trackMap[trackId] || trackId;
      const li = document.createElement("li");
      li.textContent = `${name}：${score} 星`;
      ul.appendChild(li);
    });

    allContent.appendChild(ul);
  });

  container.innerHTML = "";
  container.appendChild(allContent);
}

window.onload = updateRatingHistory;
// 🔘 清除歷史紀錄功能
document.addEventListener('DOMContentLoaded', () => {
  const clearButton = document.getElementById('clear-button');
  if (clearButton) {
    clearButton.onclick = () => {
      if (confirm("確定要清除所有評分紀錄？")) {
        localStorage.removeItem("ratingHistoryList");
        updateRatingHistory();
        alert("✅ 所有歷史紀錄已清除！");
      }
    };
  }
});