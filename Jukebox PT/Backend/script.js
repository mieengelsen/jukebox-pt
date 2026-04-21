// Henter HTML-elementet med id="container", hvor albumlisten skal vises
let containerForAlbumNames = document.getElementById("container");

// Henter søgefeltet fra HTML
let searchInput = document.getElementById("searchInput");

// Henter containeren til dropdown-resultaterne fra søgningen
let searchResults = document.getElementById("searchResults");

// Opretter et tomt array, som senere skal indeholde alle albums
let allAlbums = [];

// Starter programmet
init();

// Asynkron funktion der initialiserer appen
async function init() {
  try {
    // Henter data fra albums.json
    const data = await fetchData("../data/albums.json");

    // Skriver de hentede data i konsollen til debugging
    console.log("Data loaded:", data);

    // Gemmer albumlisten i allAlbums
    // Hvis data.albums ikke findes, bruges et tomt array
    allAlbums = data.albums || [];

    // Skriver antal albums i konsollen
    console.log("Albums found:", allAlbums.length);

    // Viser alle albums med det samme, uden søgning
    renderAlbums("");
  } catch (error) {
    // Hvis der opstår en fejl, vises den i konsollen
    console.error("Fejl ved hentning af albums:", error);

    // Viser en fejlbesked i HTML, hvis albums.json ikke kunne hentes
    containerForAlbumNames.innerHTML = "<p>Kunne ikke hente albums.json</p>";
  }
}

// Asynkron funktion der henter JSON-data fra en given URL
async function fetchData(url) {
  // Sender en request til den angivne URL
  const response = await fetch(url);

  // Hvis svaret ikke er OK (fx 404 eller 500), kastes en fejl
  if (!response.ok) {
    throw new Error("HTTP fejl: " + response.status + " på " + url);
  }

  // Returnerer JSON-indholdet fra response
  return await response.json();
}

// Funktion der viser albums baseret på søgetekst
function renderAlbums(searchText) {
  // Tømmer containeren først, så gamle resultater fjernes
  containerForAlbumNames.innerHTML = "";

  // Gennemgår alle albums ét ad gangen
  allAlbums.forEach(function (album) {
    // Henter albummets titel og gør den lowercase
    // Hvis titlen mangler, bruges en tom streng
    const albumTitle = (album.title || "").toLowerCase();

    // Henter kunstnerens navn og gør det lowercase
    // Optional chaining bruges for at undgå fejl, hvis artist mangler
    const artistName = (album.artist?.name || "").toLowerCase();

    // Tjekker om søgeteksten findes i albummets titel
    const matchesAlbum = albumTitle.includes(searchText);

    // Tjekker om søgeteksten findes i kunstnerens navn
    const matchesArtist = artistName.includes(searchText);

    // Tjekker om søgeteksten findes i mindst ét track på albummet
    const matchesTrack = (album.tracks || []).some(function (track) {
      // Returnerer true hvis trackets titel indeholder søgeteksten
      return (track.title || "").toLowerCase().includes(searchText);
    });

    // Hvis søgefeltet er tomt, eller der er match på album, artist eller track
    if (searchText === "" || matchesAlbum || matchesArtist || matchesTrack) {
      // Opretter et nyt p-element
      let pElement = document.createElement("p");

      // Sætter tekstindholdet til "albumtitel - kunstnernavn"
      pElement.innerText = `${album.title} - ${album.artist?.name || ""}`;

      // Tilføjer p-elementet til containeren
      containerForAlbumNames.appendChild(pElement);
    }
  });
}

// Funktion der viser dropdown med søgeresultater
function showSearchDropdown(searchText) {
  // Tømmer tidligere søgeresultater
  searchResults.innerHTML = "";

  // Hvis søgeteksten er tom, skjules dropdownen
  if (searchText === "") {
    searchResults.style.display = "none";
    return;
  }

  // Array der skal indeholde søgeresultaterne
  let results = [];

  // Set bruges til at undgå dubletter i dropdownen
  let uniqueResults = new Set();

  // Gennemgår alle albums ét ad gangen
  allAlbums.forEach(function (album) {
    // Henter albummets titel
    const albumTitle = album.title || "";

    // Henter kunstnerens navn
    const artistName = album.artist?.name || "";

    // Hvis albummets titel matcher søgeteksten
    if (albumTitle.toLowerCase().includes(searchText)) {
      // Laver teksten der skal vises i dropdownen
      const albumText = albumTitle + " — album";

      // Hvis resultatet ikke allerede findes i Set'et
      if (!uniqueResults.has(albumText)) {
        // Tilføjer teksten til Set'et
        uniqueResults.add(albumText);

        // Tilføjer objekt med visningstekst og værdi til results-arrayet
        results.push({
          text: albumText,
          value: albumTitle,
        });
      }
    }

    // Hvis kunstnerens navn matcher søgeteksten
    if (artistName.toLowerCase().includes(searchText)) {
      // Laver teksten der skal vises i dropdownen
      const artistText = artistName + " — artist";

      // Hvis resultatet ikke allerede findes
      if (!uniqueResults.has(artistText)) {
        // Tilføjer teksten til Set'et
        uniqueResults.add(artistText);

        // Tilføjer resultatet til listen
        results.push({
          text: artistText,
          value: artistName,
        });
      }
    }

    // Gennemgår alle tracks på albummet
    (album.tracks || []).forEach(function (track) {
      // Henter trackets titel
      const trackTitle = track.title || "";

      // Hvis trackets titel matcher søgeteksten
      if (trackTitle.toLowerCase().includes(searchText)) {
        // Laver teksten der skal vises i dropdownen
        const trackText = trackTitle + " — " + artistName;

        // Hvis resultatet ikke allerede findes
        if (!uniqueResults.has(trackText)) {
          // Tilføjer teksten til Set'et
          uniqueResults.add(trackText);

          // Tilføjer track-resultatet til results-arrayet
          results.push({
            text: trackText,
            value: trackTitle,
          });
        }
      }
    });
  });

  // Hvis der ikke blev fundet nogen resultater
  if (results.length === 0) {
    // Opretter et div-element
    let div = document.createElement("div");

    // Giver div'en klassen "result-item"
    div.classList.add("result-item");

    // Skriver "Ingen resultater" i div'en
    div.innerText = "Ingen resultater";

    // Tilføjer div'en til dropdown-containeren
    searchResults.appendChild(div);

    // Viser dropdownen
    searchResults.style.display = "block";
    return;
  }

  // Viser kun de første 15 resultater
  results.slice(0, 15).forEach(function (result) {
    // Opretter et div-element til hvert resultat
    let div = document.createElement("div");

    // Giver elementet klassen "result-item"
    div.classList.add("result-item");

    // Sætter teksten til resultatets tekst
    div.innerText = result.text;

    // Tilføjer klik-event på resultatet
    div.addEventListener("click", function () {
      // Sætter søgefeltets værdi til det valgte resultat
      searchInput.value = result.value;

      // Skjuler dropdownen
      searchResults.style.display = "none";

      // Viser albums baseret på det valgte resultat
      renderAlbums(result.value.toLowerCase());
    });

    // Tilføjer resultatet til dropdown-containeren
    searchResults.appendChild(div);
  });

  // Sørger for at dropdownen vises
  searchResults.style.display = "block";
}

// Lytter efter input i søgefeltet
searchInput.addEventListener("input", function () {
  // Henter teksten fra inputfeltet, gør den lowercase og fjerner mellemrum i start/slut
  let searchText = searchInput.value.toLowerCase().trim();

  // Viser dropdown-resultater baseret på søgeteksten
  showSearchDropdown(searchText);

  // Opdaterer albumvisningen baseret på søgeteksten
  renderAlbums(searchText);
});

// Lytter efter klik på hele dokumentet
document.addEventListener("click", function (e) {
  // Finder containeren omkring søgefeltet
  const searchContainer = document.querySelector(".search-container");

  // Hvis der findes en search-container, og brugeren klikker udenfor den
  if (searchContainer && !searchContainer.contains(e.target)) {
    // Skjuler søgeresultaterne
    searchResults.style.display = "none";
  }
});

// Dvaletilstand

// Variabel der skal holde timeout-id'et
let timer;

// Henter screensaver-elementet fra HTML
const screensaver = document.getElementById("screensaver");

// Funktion der aktiverer screensaver
function activateScreensaver() {
  // Tilføjer klassen "active" til screensaver-elementet
  screensaver.classList.add("active");
}

// Funktion der nulstiller timeren
function resetTimer() {
  // Stopper den gamle timer, hvis der findes en
  clearTimeout(timer);

  // Fjerner "active"-klassen, så screensaver skjules
  screensaver.classList.remove("active");
<<<<<<< Updated upstream
  timer = setTimeout(activateScreensaver, 6000);
=======

  // Starter en ny timer, som aktiverer screensaver efter 3000 ms
  timer = setTimeout(activateScreensaver, 3000);
>>>>>>> Stashed changes
}

// Funktion der sætter event listeners op
function setupListeners() {
  // Liste over events der skal nulstille timeren
  const events = ["mousemove", "click", "keydown", "touchstart"];

  // Gennemgår listen af events
  for (let i = 0; i < events.length; i++) {
    // Tilføjer resetTimer som event listener til hver event
    document.addEventListener(events[i], resetTimer);
  }
}

// Kalder funktionen der opretter alle listeners
setupListeners();

// Starter timeren med det samme
resetTimer();
