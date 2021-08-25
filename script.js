const availableLanguages = [
  "de_de",
  "en_us",
  "es_mx",
  "es_es",
  "fr_fr",
  "it_it",
  "ja_jp",
  "ko_kr",
  "pl_pl",
  "pt_br",
  "th_th",
  "tr_tr",
  "ru_ru",
  "zh_tw",
  "vi_vn",
];
let locale = getGameLanguage();
let numDecks = 3;
setGameLanguage(locale);
const parameters = urlParameters();
if (parameters) {
  checkDecks(parameters.regra, parameters.singleton, parameters.decks);
}
const regionNames = {
  demacia: "Demacia",
  freljord: "Freljord",
  ionia: "Ionia",
  noxus: "Noxus",
  piltoverzaun: "Piltover & Zaun",
  shadowisles: "Shadow Isles",
  bilgewater: "Bilgewater",
  targon: "Mt Targon",
  shurima: "Shurima",
  bandlecity: "Bandle City",
};
const championNames = {
  JarvanIV: "Jarvan IV",
  MissFortune: "Miss Fortune",
  TahmKench: "Tahm Kench",
  TwistedFate: "Twisted Fate",
  AurelionSol: "Aurelion Sol",
  Leblanc: "LeBlanc",
};

function getRegionName(region) {
  return regionNames[region];
}

function getChampionName(champion) {
  if (championNames[champion]) {
    return championNames[champion];
  } else {
    return champion;
  }
}

function getRegionsName(regions) {
  return regions.map((region) => getRegionName(region)).join(" & ");
}

function toggleDescription() {
  document.getElementById("tooltiptext").classList.toggle("not-hidden");
}

function getGameLanguage() {
  const savedLocale = localStorage.getItem("locale");
  let checkedLocale;

  if (savedLocale) {
    checkedLocale = checkLocale(savedLocale);
    if (checkedLocale) {
      return checkedLocale;
    }
  }

  let newLocale = navigator.language || navigator.userLanguage;
  if (!newLocale) return;

  checkedLocale = checkLocale(newLocale);
  if (!checkedLocale) {
    newLocale = "en_us";
  }

  return checkedLocale;
}

function checkLocale(locale) {
  locale = locale.toLowerCase();
  if (locale.includes("-")) {
    locale = locale.replace("-", "_");
  }
  for (let i = 0; i < availableLanguages.length; ++i) {
    if (availableLanguages[i] === locale) {
      return availableLanguages[i];
    }
  }
  if (locale.includes("-") || locale.includes("_")) {
    locale = locale.split("-")[0].split("_")[0];
  }
  for (let i = 0; i < availableLanguages.length; ++i) {
    if (availableLanguages[i].startsWith(locale)) {
      return availableLanguages[i];
    }
  }
  return null;
}

function setGameLanguage(locale) {
  const languageElement = document.getElementById("idioma");
  languageElement.value = locale;

  localStorage.setItem("locale", locale);
}

function changeLanguage(newLocale) {
  const checkedLocale = checkLocale(newLocale);
  if (!checkedLocale) {
    return;
  }

  locale = checkedLocale;
  setGameLanguage(checkedLocale);
}

function urlParameters() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has("regra") && urlParams.has("singleton")) {
    let i = 1;
    let decks = [];
    while (urlParams.has(`deck${i}`)) {
      decks.push(urlParams.get(`deck${i}`));
      i += 1;
    }

    return {
      regra: urlParams.get("regra"),
      singleton: urlParams.get("singleton"),
      decks: decks,
    };
  } else {
    return null;
  }
}

function addDeckForm() {
  const decksElement = document.getElementById("decks_input");
  numDecks += 1;
  const newDeckChild = document.createElement("div");
  newDeckChild.innerHTML = `<input type="text" id="deck${numDecks}" name="deck${numDecks}" placeholder="Deck Code ${numDecks}"></input>`;
  decksElement.appendChild(newDeckChild);
}

function removeDeckForm() {
  if (numDecks > 0) {
    const deckElement = document.getElementById(`deck${numDecks}`);
    numDecks -= 1;
    const parentElement = deckElement.parentElement;
    parentElement.remove();
  }
}

function getRegionsString(regions) {
  return regions.sort().join("");
}

function renderDeckPreview(deck) {
  let regions_string = getRegionsString(deck.regions);

  let html = `<div class="resumo-deck"><div class="regioes" name="${regions_string}">`;
  deck.regions.forEach((region) => {
    html += `<div class="regiao" name="${region}" style="background-image: url('http://dd.b.pvp.net/latest/core/en_us/img/regions/icon-${region}.png');"></div>`;
  });
  html += '</div><div class="campeoes">';
  if (deck.champions.length == 0) {
    html += `<div class="campeao" name="sem-campeao"></div>`;
  }
  deck.champions.forEach((champion) => {
    html += `<div class="campeao" name="${champion}" style="background-image: url('http://ddragon.leagueoflegends.com/cdn/10.15.1/img/champion/${champion}.png');"></div>`;
  });
  html += "</div></div>";

  return html;
}

function compare(a, b) {
  if (a.cost == b.cost) {
    if (a.name < b.name) {
      return -1;
    } else if (a.name == b.name) {
      return 0;
    } else {
      return 1;
    }
  } else {
    if (a.cost < b.cost) {
      return -1;
    } else {
      return 1;
    }
  }
}

function renderSession(cards, index, title) {
  let html = `<h2 class="session-title"><span>${title}</span><span>${cards.length}</span></h2>`;
  if (cards.length > 0) {
    cards.forEach((card) => {
      html += `<div id="${card.cardCode}_${index}" class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.cost}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qty}</span></div>`;
    });
  }

  return html;
}

function viewDeck(deck, index) {
  let champions = [];
  let followers = [];
  let spells = [];
  let landmarks = [];

  deck.cards.sort(compare);

  deck.cards.forEach((card) => {
    if (card.type == "champion") {
      champions.push(card);
    } else if (card.type == "follower") {
      followers.push(card);
    } else if (card.type == "spell") {
      spells.push(card);
    } else if (card.type == "landmark") {
      landmarks.push(card);
    }
  });

  let html = '<div class="deck">';
  html += renderDeckPreview(deck);
  html += '<div class="deck-completo">';
  html += renderSession(champions, index, "Champions");
  html += renderSession(followers, index, "Followers");
  html += renderSession(spells, index, "Spells");
  html += renderSession(landmarks, index, "Landmarks");
  html += "</div></div>";

  return html;
}

function checkCardlock(decks) {
  let cards = [];
  let repetidas = [];

  decks.forEach((deck) => {
    deck.cards.forEach((card) => {
      if (cards.includes(card.cardCode) && !repetidas.includes(card.cardCode)) {
        repetidas.push(card.cardCode);
      } else {
        cards.push(card.cardCode);
      }
    });
  });

  return repetidas;
}

function checkRegionlock(decks) {
  let regions = [];
  let repetidas = [];

  decks.forEach((deck) => {
    deck.regions.forEach((region) => {
      if (regions.includes(region) && !repetidas.includes(region)) {
        repetidas.push(region);
      } else {
        regions.push(region);
      }
    });
  });

  return repetidas;
}

function checkRiotlock(decks) {
  let regions = [];
  let champions = [];
  let repetidas = [];

  decks.forEach((deck) => {
    if (deck.champions.length == 0) {
      if (
        champions.includes("sem-campeao") &&
        !repetidas.includes("sem-campeao")
      ) {
        repetidas.push("sem-campeao");
      } else {
        champions.push("sem-campeao");
      }
    }

    deck.champions.forEach((champion) => {
      if (champions.includes(champion) && !repetidas.includes(champion)) {
        repetidas.push(champion);
      } else {
        champions.push(champion);
      }
    });
  });

  decks.forEach((deck) => {
    const regions_string = getRegionsString(deck.regions);

    if (
      regions.includes(regions_string) &&
      !repetidas.includes(regions_string)
    ) {
      repetidas.push(regions_string);
    } else {
      regions.push(regions_string);
    }
  });

  return repetidas;
}

function checkCollectionlock(decks) {
  let repetidas = [];
  let counting = {};

  decks.forEach((deck) => {
    deck.cards.forEach((card) => {
      if (counting[card.cardCode]) {
        counting[card.cardCode] += card.qty;
      } else {
        counting[card.cardCode] = card.qty;
      }
      if (counting[card.cardCode] > 3) {
        if (!repetidas.includes(card.cardCode)) {
          repetidas.push(card.cardCode);
        }
      }
    });
  });

  return repetidas;
}

function checkSingleton(decks) {
  let repetidas = [];

  decks.forEach((deck, index) => {
    if (deck.cards.length != 40) {
      deck.cards.forEach((card) => {
        if (card.qty > 1) {
          repetidas.push(`${card.cardCode}_${index}`);
        }
      });
    }
  });

  return repetidas;
}

function renderLoading(loading, number = -1) {
  const veredito = document.querySelector("#veredito");

  if (loading) {
    veredito.classList.remove(...veredito.classList);
    veredito.innerHTML = `<h1><i class="fa fa-spinner fa-spin fa-fw"></i> Loading...${
      number > -1 ? ` (${(number * 100).toFixed(2)}%)` : ""
    }</h1>`;
  } else {
    veredito.innerHTML = "";
  }
}

function renderVerdict(className, message) {
  const veredito = document.querySelector("#veredito");

  veredito.classList.remove(...veredito.classList);
  veredito.classList.add(className);
  veredito.innerHTML = `<h1>${message}</h1>`;
}

function renderDecks(html) {
  const decks_element = document.querySelector("#decks");

  decks_element.innerHTML = html;
  document.querySelector("#content").style.marginBottom = "80px";
}

async function convertDeck(code, locale) {
  try {
    if (code === "") return null;

    const response = await fetch(
      `https://escolaruneterra.herokuapp.com/deck/decode?deck=${code}&locale=${locale}`
    );

    if (response.ok) {
      const result = await response.json();
      return {
        ...result,
        cards: result.cards.map((card) => {
          return {
            regions: card.regions,
            cost: card.cost,
            name: card.name,
            cardCode: card.cardCode,
            type: card.supertype === "champion" ? card.supertype : card.type,
            qty: card.qty,
          };
        }),
      };
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

function checkRules(regras, singleton, decks) {
  const regras_function = {
    cardlock: checkCardlock,
    regionlock: checkRegionlock,
    riotlock: checkRiotlock,
    collectionlock: checkCollectionlock,
  };
  const repetidas = regras_function[regras](decks);

  if (singleton) {
    repetidas.push.apply(repetidas, checkSingleton(decks));
  }

  return repetidas;
}

async function checkDecks(r, s, d) {
  let regra,
    singleton,
    decks = [];

  if (!r || !s || !d) {
    regra = document.querySelector("#regra_jogador").value;
    singleton = document.querySelector("#singleton_jogador").checked;
    for (let i = 1; i <= numDecks; ++i) {
      decks.push(document.querySelector(`#deck${i}`).value);
    }
  } else {
    regra = r;
    singleton = s;
    decks = d;
  }

  let html = "";

  renderLoading(true);
  renderDecks("");

  if (decks.some((item) => item === "")) {
    renderVerdict("erro", "There is an empty field.");
    return;
  }

  for (let i = 0; i < numDecks; ++i) {
    decks[i] = await convertDeck(decks[i], locale);
    console.log(decks[i]);
    if (decks[i] == null) {
      renderVerdict("erro", "There is an invalid code.");
      return;
    }
  }

  decks.forEach((deck, index) => {
    html += viewDeck(deck, index);
  });
  renderDecks(html);

  const repetidas = checkRules(regra, singleton, decks);

  repetidas.forEach((repetida) => {
    const elements = document.getElementsByName(repetida);
    elements.forEach((element) => {
      element.classList.add("repetida");
    });
  });

  if (repetidas.length == 0) {
    renderVerdict("tudo-certo", "Ready to go!");
  } else {
    renderVerdict("erro", "");
  }
}

function togglePlayerOrganizer(player) {
  const elementPlayer = document.getElementById("jogador");
  const elementOrganizer = document.getElementById("organizador");

  if (player) {
    elementOrganizer.classList.add("hide");
    elementPlayer.classList.remove("hide");
  } else {
    elementPlayer.classList.add("hide");
    elementOrganizer.classList.remove("hide");
  }
}

function togglePlayerColumn() {
  const element = document.getElementById("player_column_number");
  element.classList.toggle("hide");
}

function getDeckRow(deck, deck_index, repetidas) {
  const filteredRegions = deck.regions.filter((region) =>
    repetidas.includes(region)
  );
  const regions_string = getRegionsString(deck.regions);
  const filteredRegionString = repetidas.includes(regions_string);
  const filteredChampions = deck.champions.filter((champion) =>
    repetidas.includes(champion)
  );
  const filteredNoChampion = repetidas.includes("no-champion");
  const filteredDeck = deck.cards.filter((card) =>
    repetidas.includes(card.cardCode)
  );
  let filteredSingleton = repetidas.filter(
    (code) => code.includes("_") && code.split("_")[1] == deck_index
  );
  filteredSingleton = filteredSingleton.map((code) => code.split("_")[0]);
  filteredSingleton = deck.cards.filter((card) =>
    filteredSingleton.includes(card.cardCode)
  );
  let row = "";

  if (
    filteredRegions.length > 0 ||
    filteredRegionString ||
    filteredChampions.length > 0 ||
    filteredNoChampion ||
    filteredDeck.length > 0 ||
    filteredSingleton > 0
  ) {
    row += `<span>Deck ${deck_index}</span>`;
  }

  filteredRegions.forEach((region) => {
    row += `<li>${getRegionName(region)}</li>`;
  });
  if (filteredRegionString) {
    row += `<li>${getRegionsName(deck.regions)}</li>`;
  }
  filteredChampions.forEach((champion) => {
    row += `<li>${getChampionName(champion)}</li>`;
  });
  if (filteredNoChampion) {
    row += `<li>No Champion</li>`;
  }
  filteredDeck.forEach((card) => {
    row += `<li>${card.name}</li>`;
  });
  filteredSingleton.forEach((card) => {
    row += `<li>${card.name} (more than one copy)</li>`;
  });

  row += "</ul>";
  return row;
}

async function getPlayerRow(playerName, regra, singleton, playerDecks) {
  let decksValidos = true;
  let row = `<tr><td>${playerName}</td>`;
  for (let i = 0; i < playerDecks.length; ++i) {
    console.log(playerDecks[i]);
    playerDecks[i] = await convertDeck(playerDecks[i], locale);
    console.log(playerDecks[i]);
    if (playerDecks[i] == null) {
      if (decksValidos) {
        row += "<td><ul>";
      }
      row += `<li>Deck ${i + 1} has an empty or invalid code.</li>`;
      decksValidos = false;
    }
  }

  if (!decksValidos) {
    row += "</ul></td>";
    return row;
  }

  const repetidas = checkRules(regra, singleton, playerDecks, true);

  if (repetidas.length > 0) {
    row += "<td>";
    playerDecks.forEach(
      (deck, index) => (row += getDeckRow(deck, index + 1, repetidas))
    );
    row += "</td></tr>";
    return row;
  } else {
    row += "<td>Ready to go!</td></tr>";
    return row;
  }
}

function checkManyDecks() {
  const regra = document.getElementById("regra_organizador").value;
  const singleton = document.getElementById("singleton_organizador").checked;
  const file = document.getElementById("file").files[0];
  const header = document.getElementById("header").checked;
  const playerIndex = document.getElementById("player_column").checked
    ? document.getElementById("player_column_number").value
    : -1;
  const numberOfDecks = +document.getElementById("decks_number").value;
  const firstDeckIndex = document.getElementById("decks_index").value;

  document.getElementById("file").value = "";

  renderLoading(true, 0);

  if (file == undefined) {
    renderLoading(false);
    renderVerdict("erro", "No file was selected.");
  }

  Papa.parse(file, {
    config: {
      header: header,
    },
    complete: async function (results) {
      let message = "<table><tr><th>Player</th><th>Message</th></tr>";
      const data = results.data;
      const numberOfPlayers = data.length;

      renderDecks("");

      for (let i = 0; i < numberOfPlayers; ++i) {
        const playerName =
          playerIndex == -1 ? `Player ${i + 1}` : data[i][playerIndex - 1];
        const playerDecks = data[i].slice(
          firstDeckIndex - 1,
          firstDeckIndex - 1 + numberOfDecks
        );

        message += await getPlayerRow(
          playerName,
          regra,
          singleton,
          playerDecks
        );
        renderLoading(true, (i + 1) / numberOfPlayers);
      }

      renderLoading(false);
      message += "</table>";
      renderDecks(message);
    },
  });
}
