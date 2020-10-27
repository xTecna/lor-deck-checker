const availableLanguages = [ 'de_de', 'en_us', 'es_es', 'es_mx', 'fr_fr', 'it_it', 'ja_jp', 'ko_kr', 'pl_pl', 'pt_br', 'th_th', 'tr_tr', 'ru_ru', 'zh_tw' ];
let locale = getGameLanguage();

function getGameLanguage(){
	let locale = navigator.language || navigator.userLanguage;
	if (!locale) return;

	const savedLocale = localStorage.getItem('localeGame');
	locale = savedLocale ? savedLocale : locale;

	if (!checkLocale(locale)){
		locale = 'en_us';
	}
	
	localStorage.setItem('localeGame', locale);
	return locale;
}

function checkLocale(locale){
	if (locale.includes('-')){
		locale = locale.split('-')[0];
	}
	for (let i = 0; i < availableLanguages.length; ++i){
		if (availableLanguages[i].startsWith(locale)){
			return availableLanguages[i];
		}
	}
	return null;
}

function renderDeckPreview(deck){
	let regions_string = deck.regions.join('');
	
	let html = `<div class="resumo-deck"><div class="regioes" name="${regions_string}">`;
	deck.regions.forEach(region => {
		html += `<div class="regiao" name="${region}" style="background-image: url('http://dd.b.pvp.net/latest/core/en_us/img/regions/icon-${region}.png');"></div>`;
	})
	html += '</div><div class="campeoes">';
	deck.champions.forEach(champion => {
		html += `<div class="campeao" name="${champion}" style="background-image: url('http://ddragon.leagueoflegends.com/cdn/10.15.1/img/champion/${champion}.png');"></div>`;
	})
	html += '</div></div>';

	return html;
}

function viewDeck(deck, index){
	let champions = [];
	let followers = [];
	let spells = [];
	let landmarks = [];

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

	let html = `<div class="deck">${renderDeckPreview(deck)}`;
	html += `<div class="deck-completo"><h2>Champions</h2>`;
	if (champions.length > 0){
		champions.forEach((card) => {
			html += `<div id="${card.cardCode}_${index}" class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qty}</span></div>`
		});
	}
	else
	{
		html += '<h3>No champions.</h3>';
	}
	html += `<h2>Followers</h2>`;
	if (followers.length > 0){
		followers.forEach((card) => {
			html += `<div id="${card.cardCode}_${index}" class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qty}</span></div>`
		});
	}
	else
	{
		html += '<h3>No followers.</h3>';
	}
	html += `<h2>Spells</h2>`;
	if (spells.length > 0){
		spells.forEach((card) => {
			html += `<div id="${card.cardCode}_${index}" class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qty}</span></div>`
		});
	}
	else
	{
		html += '<h3>No spells.</h3>';
	}
	if (landmarks.length > 0){
		html += `<h2>Landmarks</h2>`;
		landmarks.forEach((card) => {
			html += `<div id="${card.cardCode}_${index}" class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qty}</span></div>`
		});
	}
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
		deck.champions.forEach((champion) => {
			if (champions.includes(champion) && !repetidas.includes(champion)){
				repetidas.push(champion);
			}else{
				champions.push(champion);
			}
		});
	});

	decks.forEach((deck) => {
		const regions_string = deck.regions.join('');
		
		if (regions.includes(regions_string) && !repetidas.includes(regions_string)){
			repetidas.push(regions_string);
		} else {
			regions.push(regions_string);
		}
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
	'riotlock': checkRiotlock
};

async function checkDecks(){
	const veredito = document.querySelector('#veredito');
	const decks_element = document.querySelector('#decks');
	const footer = document.querySelector('#footer');
	let decks = [];
	let html = '';

	veredito.classList.remove('tudo-certo');
	veredito.classList.remove('erro');
	veredito.innerHTML = '<h1><i class="fa fa-spinner fa-spin fa-fw"></i> Loading...</h1>';
	decks_element.innerHTML = '';

	for (let i = 1; i < 4; ++i){
		const code = document.querySelector(`#deck${i}`).value;
		if (code === '')	continue;
		const response = await fetch(`https://escolaruneterra.herokuapp.com/deck/decode?deck=${code}&locale=${locale}`);

		if (response.ok){
			const result = await response.json();
			decks.push(result);
		}else{
			veredito.classList.add('erro');
			veredito.innerHTML = '<h1 class="error">There is an invalid code.</h1>';
			return;
		}
	}

	footer.style.position = '';

	decks.forEach((deck, index) => {
		html += viewDeck(deck, index);
	});
	decks_element.innerHTML = html;
	document.querySelector('#content').style.marginBottom = '80px';
	
	const regra = document.querySelector('#regra').value;
	const singleton = document.querySelector('#singleton').checked;
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

document.querySelector('#footer').style.position = 'absolute';
document.querySelector('#footer').style.bottom = 0;