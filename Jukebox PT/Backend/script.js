let containerForAlbumNames = document.getElementById("container");
let searchInput = document.getElementById("searchInput");
let searchResults = document.getElementById("searchResults");

let allAlbums = [];

init();

async function init() {
  try {
    const data = await fetchData("../data/albums.json");
    console.log("Data loaded:", data);

    allAlbums = data.albums || [];
    console.log("Albums found:", allAlbums.length);

    renderAlbums("");
  } catch (error) {
    console.error("Fejl ved hentning af albums:", error);
    containerForAlbumNames.innerHTML = "<p>Kunne ikke hente albums.json</p>";
  }
}

async function fetchData(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("HTTP fejl: " + response.status + " på " + url);
  }

  return await response.json();
}

function renderAlbums(searchText) {
  containerForAlbumNames.innerHTML = "";

  allAlbums.forEach(function (album) {
    const albumTitle = (album.title || "").toLowerCase();
    const artistName = (album.artist?.name || "").toLowerCase();

    const matchesAlbum = albumTitle.includes(searchText);
    const matchesArtist = artistName.includes(searchText);

    const matchesTrack = (album.tracks || []).some(function (track) {
      return (track.title || "").toLowerCase().includes(searchText);
    });

    if (searchText === "" || matchesAlbum || matchesArtist || matchesTrack) {
      let pElement = document.createElement("p");
      pElement.innerText = `${album.title} - ${album.artist?.name || ""}`;
      containerForAlbumNames.appendChild(pElement);
    }
  });
}

function showSearchDropdown(searchText) {
  searchResults.innerHTML = "";

  if (searchText === "") {
    searchResults.style.display = "none";
    return;
  }

  let results = [];
  let uniqueResults = new Set();

  allAlbums.forEach(function (album) {
    const albumTitle = album.title || "";
    const artistName = album.artist?.name || "";

    if (albumTitle.toLowerCase().includes(searchText)) {
      const albumText = albumTitle + " — album";
      if (!uniqueResults.has(albumText)) {
        uniqueResults.add(albumText);
        results.push({
          text: albumText,
          value: albumTitle,
        });
      }
    }

    if (artistName.toLowerCase().includes(searchText)) {
      const artistText = artistName + " — artist";
      if (!uniqueResults.has(artistText)) {
        uniqueResults.add(artistText);
        results.push({
          text: artistText,
          value: artistName,
        });
      }
    }

    (album.tracks || []).forEach(function (track) {
      const trackTitle = track.title || "";

      if (trackTitle.toLowerCase().includes(searchText)) {
        const trackText = trackTitle + " — " + artistName;
        if (!uniqueResults.has(trackText)) {
          uniqueResults.add(trackText);
          results.push({
            text: trackText,
            value: trackTitle,
          });
        }
      }
    });
  });

  if (results.length === 0) {
    let div = document.createElement("div");
    div.classList.add("result-item");
    div.innerText = "Ingen resultater";
    searchResults.appendChild(div);
    searchResults.style.display = "block";
    return;
  }

  results.slice(0, 15).forEach(function (result) {
    let div = document.createElement("div");
    div.classList.add("result-item");
    div.innerText = result.text;

    div.addEventListener("click", function () {
      searchInput.value = result.value;
      searchResults.style.display = "none";
      renderAlbums(result.value.toLowerCase());
    });

    searchResults.appendChild(div);
  });

  searchResults.style.display = "block";
}

searchInput.addEventListener("input", function () {
  let searchText = searchInput.value.toLowerCase().trim();
  showSearchDropdown(searchText);
  renderAlbums(searchText);
});

document.addEventListener("click", function (e) {
  const searchContainer = document.querySelector(".search-container");
  if (searchContainer && !searchContainer.contains(e.target)) {
    searchResults.style.display = "none";
  }
});

//Dvaletilstand

let timer;
const screensaver = document.getElementById("screensaver");

function activateScreensaver() {
  screensaver.classList.add("active");
}

function resetTimer() {
  clearTimeout(timer);
  screensaver.classList.remove("active");
  timer = setTimeout(activateScreensaver, 3000);
}

function setupListeners() {
  const events = ["mousemove", "click", "keydown", "touchstart"];

  for (let i = 0; i < events.length; i++) {
    document.addEventListener(events[i], resetTimer);
  }
}

setupListeners();
resetTimer();
