function compare(a, b){
	if (a.mana < b.mana)	return -1;
	if (a.mana > b.mana)	return 1;
	return 0;
}

function getRegions(deck){
	let regions = [];

	deck.forEach((card) => {
		if (!regions.includes(card.region)){
			regions.push(card.region);
		}
	});

	return regions;
}

function getChampions(deck){
	let champions = [];

	deck.forEach((card) => {
		if (card.type === "Campeão"){
			champions.push(card.name.replace(' ', ''));
		}
	});

	return champions;
}

function renderDeckPreview(deck){
	const champions = getChampions(deck);
	const regions = getRegions(deck);
	let regions_string = '';

	regions.sort();
	regions.forEach((region) => {
		regions_string += region;
	});
	
	let html = `<div class="resumo-deck"><div class="regioes" name="${regions_string}">`;
	regions.forEach(region => {
		html += `<div class="regiao" name="${region}" style="background-image: url('http://dd.b.pvp.net/latest/core/en_us/img/regions/icon-${region}.png');"></div>`;
	})
	html += '</div><div class="campeoes">';
	champions.forEach(champion => {
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

	deck.forEach((card) => {
		if (card.type == 'Campeão'){
			champions.push(card);
		} else if (card.type == 'Unidade'){
			followers.push(card);
		} else if (card.type == 'Feitiço'){
			spells.push(card);
		} else if (card.type == 'Monumento'){
			landmarks.push(card);
		}
	});

	champions.sort(compare);
	followers.sort(compare);
	spells.sort(compare);
	landmarks.sort(compare);

	let html = `<div class="deck">${renderDeckPreview(deck)}`;
	html += `<div class="deck-completo"><h2>Campeões</h2>`;
	if (champions.length > 0){
		champions.forEach((card) => {
			html += `<div id="${card.cardCode}_${index}" class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtde}</span></div>`
		});
	}
	else
	{
		html += '<h3>Sem campeões.</h3>';
	}
	html += `<h2>Seguidores</h2>`;
	if (followers.length > 0){
		followers.forEach((card) => {
			html += `<div id="${card.cardCode}_${index}" class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtde}</span></div>`
		});
	}
	else
	{
		html += '<h3>Sem seguidores.</h3>';
	}
	html += `<h2>Feitiços</h2>`;
	if (spells.length > 0){
		spells.forEach((card) => {
			html += `<div id="${card.cardCode}_${index}" class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtde}</span></div>`
		});
	}
	else
	{
		html += '<h3>Sem feitiços.</h3>';
	}
	if (landmarks.length > 0){
		html += `<h2>Monumentos</h2>`;
		landmarks.forEach((card) => {
			html += `<div id="${card.cardCode}_${index}" class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtde}</span></div>`
		});
	}
	html += '</div></div>';

	return html;
}

function checkCardlock(decks){
	let cards = [];
	let repetidas = [];

	decks.forEach((deck) => {
		deck.forEach((card) => {
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
		const regions_deck = getRegions(deck);
		regions_deck.forEach((region) => {
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
		const champions_deck = getChampions(deck);
		champions_deck.forEach((champion) => {
			if (champions.includes(champion) && !repetidas.includes(champion)){
				repetidas.push(champion);
			}else{
				champions.push(champion);
			}
		});
	});

	decks.forEach((deck) => {
		const regions_deck = getRegions(deck);
		regions_deck.sort();
		const regions_string = regions_deck.join('');
		
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
		if (deck.length != 40){
			deck.forEach((card) => {
				if (card.qtde > 1){
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
	veredito.innerHTML = '<h1><i class="fa fa-spinner fa-spin fa-fw"></i> Carregando...</h1>';
	decks_element.innerHTML = '';

	for (let i = 1; i < 4; ++i){
		const code = document.querySelector(`#deck${i}`).value;
		if (code === '')	continue;
		const response = await fetch(`https://leaderboardescola.herokuapp.com/deck/decode?deck=${code}`);

		if (response.ok){
			const result = await response.json();
			decks.push(result);
		}else{
			veredito.classList.add('erro');
			veredito.innerHTML = '<h1 class="error">Um dos códigos passados é inválido.</h1>';
			return;
		}
	}

	// footer.style.position = '';

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
		veredito.innerHTML = '<h1>Tudo certo e de acordo com as regras.</h1>';
	} else {
		veredito.innerHTML = '';
	}
}