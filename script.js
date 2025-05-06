const songs = [
  { name: "Song A", id: "1ZMiCix7XSAbfAJlEZWMCp" },
  { name: "Song B", id: "3nqQXoyQOWXiESFLlDF1hG" },
  { name: "Song C", id: "3tjFYV6RSFtuktYl3ZtYcq" },
  { name: "Song D", id: "4iV5W9uYEdYUVa79Axb7Rh" },
  { name: "Song E", id: "1AhDOtG9vPSOmsWgNW0BEY" },
  { name: "Song F", id: "7BKLCZ1jbUBVqRi2FVlTVw" },
  { name: "Song G", id: "5nTtCOCds6I0PHMNtqelas" },
  { name: "Song H", id: "5nNmj1cLH3r4aA4XDJ2bgY" },
  { name: "Song I", id: "3KkXRkHbMCARz0aVfEt68P" },
  { name: "Song J", id: "0VjIjW4GlUZAMYd2vXMi3b" },
  { name: "Song K", id: "2XU0oxnq2qxCpomAAuJY8K" },
  { name: "Song L", id: "4uUG5RXrOk84mYEfFvj3cK" },
  { name: "Song M", id: "1fDsrQ23eTAVFElUMaf38X" },
  { name: "Song N", id: "6PGoSes0D9eUDeeAafB2As" },
  { name: "Song O", id: "5CtI0qwDJkDQGwXD1H1cLb" },
  { name: "Song P", id: "3yfqSUWxFvZELEM4PmlwIR" },
  { name: "Song Q", id: "1F03Q5dYE6Nt1eM0k0mULp" },
  { name: "Song R", id: "0zM17Y5vZb3OIWh7sPZeyN" },
  { name: "Song S", id: "3ee8Jmje8o58CHK66QrVC2" },
  { name: "Song T", id: "1rgnBhdG2JDFTbYkYRZAku" }
];

const list = document.getElementById('song-list');
const ratings = {}; // { songId: rating }
let lastOpenedPlayerBox = null;
let lastSongId = null;

songs.forEach(song => {
  const item = document.createElement('div');
  item.className = 'song-item';

  const title = document.createElement('div');
  title.className = 'song-name';
  title.textContent = song.name;

  const playerBox = document.createElement('div');
  playerBox.className = 'player-box';

  title.onclick = () => {
    if (lastOpenedPlayerBox === playerBox && lastSongId === song.id) {
      playerBox.innerHTML = "";
      lastOpenedPlayerBox = null;
      lastSongId = null;
      return;
    }

    if (lastOpenedPlayerBox) lastOpenedPlayerBox.innerHTML = "";

    const iframe = document.createElement('iframe');
    iframe.style.borderRadius = '12px';
    iframe.src = `https://open.spotify.com/embed/track/${song.id}`;
    iframe.width = "100%";
    iframe.height = "80";
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";

    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'rating';
    let currentRating = ratings[song.id] || 0;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.textContent = '★';
      star.onclick = () => {
        currentRating = i;
        ratings[song.id] = currentRating;
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
    playerBox.innerHTML = "";
    playerBox.appendChild(iframe);
    playerBox.appendChild(ratingDiv);
    lastOpenedPlayerBox = playerBox;
    lastSongId = song.id;
  };

  item.appendChild(title);
  item.appendChild(playerBox);
  list.appendChild(item);
});

// ⬇️ 統一送出按鈕
const submitArea = document.getElementById('submit-area');
const submitAllBtn = document.createElement('button');
submitAllBtn.textContent = '送出評分';
submitAllBtn.onclick = () => {
  const rated = Object.entries(ratings);
  if (rated.length === 0) {
    alert("請先對至少一首歌曲進行評分！");
    return;
  }

  const payload = rated.map(([song_id, rating]) => ({ song_id, rating }));
  console.log("🔄 送出以下評分：", payload);

  fetch('http://127.0.0.1:8000/submit_ratings/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ratings: payload })
  })
    .then(res => res.json())
    .then(data => {
      alert("評分已送出！");
      console.log("✅ 推薦清單：", data.recommendations);
      // 你可以在這裡更新推薦區域，例如：
      // document.getElementById('recommend-list').innerHTML = data.recommendations.map(song => `<li>${song}</li>`).join('');
    });
};
submitArea.appendChild(submitAllBtn);
