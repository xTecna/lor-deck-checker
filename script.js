const availableLanguages = [ 'de_de', 'en_us', 'es_mx', 'es_es', 'fr_fr', 'it_it', 'ja_jp', 'ko_kr', 'pl_pl', 'pt_br', 'th_th', 'tr_tr', 'ru_ru', 'zh_tw', 'vi_vn' ];
let locale = getGameLanguage();
let numDecks = 3;
setGameLanguage(locale);
const parameters = urlParameters();
if (parameters){
	checkDecks(parameters.regra, parameters.singleton, parameters.decks);
}

function toggleDescription(){
	document.getElementById('tooltiptext').classList.toggle('not-hidden');
}

function getGameLanguage(){
	const savedLocale = localStorage.getItem('locale');
	let checkedLocale;

	if (savedLocale) {
		checkedLocale = checkLocale(savedLocale);
		if (checkedLocale){
			return checkedLocale;
		}
	}

	let newLocale = navigator.language || navigator.userLanguage;
	if (!newLocale) return;

	checkedLocale = checkLocale(newLocale);
	if (!checkedLocale){
		newLocale = 'en_us';
	}
	
	return checkedLocale;
}

function checkLocale(locale){
	locale = locale.toLowerCase();
	if (locale.includes('-')){
		locale = locale.replace('-', '_');
	}
	for (let i = 0; i < availableLanguages.length; ++i){
		if (availableLanguages[i] === locale){
			return availableLanguages[i];
		}
	}
	if (locale.includes('-') || locale.includes('_')){
		locale = locale.split('-')[0].split('_')[0];
	}
	for (let i = 0; i < availableLanguages.length; ++i){
		if (availableLanguages[i].startsWith(locale)){
			return availableLanguages[i];
		}
	}
	return null;
}

function setGameLanguage(locale){
	const languageElement = document.getElementById('idioma');
	languageElement.value = locale;

	localStorage.setItem('locale', locale);
}

function changeLanguage(newLocale){
	const checkedLocale = checkLocale(newLocale);
	if (!checkedLocale){
		return;
	}

	locale = checkedLocale;
	setGameLanguage(checkedLocale);
}

function urlParameters(){
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	if (urlParams.has('regra') &&
		urlParams.has('singleton')){
		let i = 1;
		let decks = [];
		while (urlParams.has(`deck${i}`)){
			decks.push(urlParams.get(`deck${i}`));
			i += 1;
		}

		return {
			regra: urlParams.get('regra'),
			singleton: urlParams.get('singleton'),
			decks: decks
		};
	}else{
		return null;
	}
}

function addDeckForm(){
	const decksElement = document.getElementById('decks_input');
	numDecks += 1;
	const newDeckChild = document.createElement('div');
	newDeckChild.innerHTML = `<input type="text" id="deck${numDecks}" name="deck${numDecks}" placeholder="Deck Code ${numDecks}"></input>`;
	decksElement.appendChild(newDeckChild);
}

function removeDeckForm(){
	if (numDecks > 0){
		const deckElement = document.getElementById(`deck${numDecks}`);
		numDecks -= 1;
		const parentElement = deckElement.parentElement;
		parentElement.remove();
	}
}

function getRegionsString(regions){
	return regions.sort().join('');
}

function renderDeckPreview(deck){
	let regions_string = getRegionsString(deck.regions);
	
	let html = `<div class="resumo-deck"><div class="regioes" name="${regions_string}">`;
	deck.regions.forEach(region => {
		html += `<div class="regiao" name="${region}" style="background-image: url(${region === 'shurima' ? 'http://escolaruneterra.com.br/gallerycard/assets/icon-shurima.png' : `http://dd.b.pvp.net/latest/core/en_us/img/regions/icon-${region}.png`});"></div>`;
	})
	html += '</div><div class="campeoes">';
	if (deck.champions.length == 0){
		html += `<div class="campeao" name="sem-campeao"></div>`;
	}
	deck.champions.forEach(champion => {
		html += `<div class="campeao" name="${champion}" style="background-image: url('http://ddragon.leagueoflegends.com/cdn/10.15.1/img/champion/${champion}.png');"></div>`;
	})
	html += '</div></div>';

	return html;
}

function compare(a, b){
	if (a.mana == b.mana){
		if (a.name < b.name){
			return -1;
		}else if (a.name == b.name){
			return 0;
		}else{
			return 1;
		}
	}else{
		if (a.mana < b.mana){
			return -1;
		}else{
			return 1;
		}
	}
}

function renderSession(cards, index, title){
	let html = `<h2 class="session-title"><span>${title}</span><span>${cards.length}</span></h2>`;
	if (cards.length > 0){
		cards.forEach((card) => {
			html += `<div id="${card.cardCode}_${index}" class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qty}</span></div>`
		});
	}

	return html;
}

function viewDeck(deck, index){
	let champions = [];
	let followers = [];
	let spells = [];
	let landmarks = [];

	deck.cards.sort(compare);

	deck.cards.forEach((card) => {
		if (card.type == 'champion'){
			champions.push(card);
		} else if (card.type == 'follower'){
			followers.push(card);
		} else if (card.type == 'spell'){
			spells.push(card);
		} else if (card.type == 'landmark'){
			landmarks.push(card);
		}
	});

	let html = '<div class="deck">';
	html += renderDeckPreview(deck);
	html += '<div class="deck-completo">';
	html += renderSession(champions, index, 'Champions');
	html += renderSession(followers, index, 'Followers');
	html += renderSession(spells, index, 'Spells');
	html += renderSession(landmarks, index, 'Landmarks');
	html += '</div></div>';

	return html;
}

function checkCardlock(decks){
	let cards = [];
	let repetidas = [];

	decks.forEach((deck) => {
		deck.cards.forEach((card) => {
			if (cards.includes(card.cardCode) && !repetidas.includes(card.cardCode)){
				repetidas.push(card.cardCode);
			} else {
				cards.push(card.cardCode);
			}
		});
	});

	return repetidas;
}

function checkRegionlock(decks){
	let regions = [];
	let repetidas = [];

	decks.forEach((deck) => {
		deck.regions.forEach((region) => {
			if (regions.includes(region) && !repetidas.includes(region)){
				repetidas.push(region);
			}else{
				regions.push(region);
			}
		});
	});

	return repetidas;
}

function checkRiotlock(decks){
	let regions = [];
	let champions = [];
	let repetidas = [];

	decks.forEach((deck) => {
		if (deck.champions.length == 0){
			if (champions.includes('sem-campeao') && !repetidas.includes('sem-campeao')){
				repetidas.push('sem-campeao');
			}else{
				champions.push('sem-campeao');
			}
		}

		deck.champions.forEach((champion) => {
			if (champions.includes(champion) && !repetidas.includes(champion)){
				repetidas.push(champion);
			}else{
				champions.push(champion);
			}
		});
	});

	decks.forEach((deck) => {
		const regions_string = getRegionsString(deck.regions);
		
		if (regions.includes(regions_string) && !repetidas.includes(regions_string)){
			repetidas.push(regions_string);
		} else {
			regions.push(regions_string);
		}
	});

	return repetidas;
}

function checkCollectionlock(decks){
	let repetidas = [];
	let counting = {};

	decks.forEach((deck) => {
		deck.cards.forEach((card) => {
			if (counting[card.cardCode]){
				counting[card.cardCode] += card.qty;
			} else {
				counting[card.cardCode] = card.qty;
			}
			if (counting[card.cardCode] > 3){
				if (!repetidas.includes(card.cardCode)){
					repetidas.push(card.cardCode);
				}
			}
		});
	});

	return repetidas;
}

function checkSingleton(decks){
	let repetidas = [];

	decks.forEach((deck, index) => {
		if (deck.cards.length != 40){
			deck.cards.forEach((card) => {
				if (card.qty > 1){
					repetidas.push(`${card.cardCode}_${index}`);
				}
			});
		}
	});

	return repetidas;
}

const regras_function = {
	'cardlock': checkCardlock,
	'regionlock': checkRegionlock,
	'riotlock': checkRiotlock,
	'collectionlock': checkCollectionlock
};

async function checkDecks(r, s, d){
	let regra, singleton, decks = [];

	if (!r || !s || !d){
		regra = document.querySelector('#regra').value;
		singleton = document.querySelector('#singleton').checked;
		for (let i = 1; i <= numDecks; ++i){
			decks.push(document.querySelector(`#deck${i}`).value);
		}
	}else{
		regra = r;
		singleton = s;
		decks = d;
	}

	const veredito = document.querySelector('#veredito');
	const decks_element = document.querySelector('#decks');
	let html = '';

	veredito.classList.remove('tudo-certo');
	veredito.classList.remove('erro');
	veredito.innerHTML = '<h1><i class="fa fa-spinner fa-spin fa-fw"></i> Loading...</h1>';
	decks_element.innerHTML = '';

	if (decks.some((item) => item === '')){
		veredito.classList.add('erro');
		veredito.innerHTML = '<h1 class="error">There is an empty field.</h1>';
		return;
	}

	for (let i = 0; i < numDecks; ++i){
		try
		{
			const code = decks[i];
			const response = await fetch(`https://escolaruneterra.herokuapp.com/deck/decode?deck=${code}&locale=${locale}`);

			if (response.ok){
				const result = await response.json();
				decks[i] = result;
			}else{
				veredito.classList.add('erro');
				veredito.innerHTML = '<h1 class="error">There is an invalid code.</h1>';
				return;
			}
		}
		catch (error)
		{
			veredito.classList.add('erro');
			veredito.innerHTML = '<h1 class="error">There is an invalid code.</h1>';
			return;
		}
	}

	decks.forEach((deck, index) => {
		html += viewDeck(deck, index);
	});
	decks_element.innerHTML = html;
	document.querySelector('#content').style.marginBottom = '80px';
	
	const repetidas = regras_function[regra](decks);

	if (singleton){
		repetidas.push.apply(repetidas, checkSingleton(decks));
	}

	repetidas.forEach((repetida) => {
		const elements = document.getElementsByName(repetida);
		elements.forEach((element) => {
			element.classList.add('repetida');
		});
	});

	if (repetidas.length == 0){
		veredito.classList.add('tudo-certo');
		veredito.innerHTML = '<h1>Ready to go!</h1>';
	} else {
		veredito.innerHTML = '';
	}
}