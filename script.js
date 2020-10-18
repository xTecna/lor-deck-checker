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
	const content = document.querySelector('#decks');

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
	html += '</div>';

	content.insertAdjacentHTML('beforeend', html);
}

function checkCardlock(decks){
	let cards = [];
	let ok = true;

	decks.forEach((deck) => {
		deck.forEach((card) => {
			if (cards.includes(card.cardCode)){
				ok = false;
				const repetidas = document.getElementsByName(card.cardCode);
				repetidas.forEach((repetida) => {
					repetida.classList.add('repetida');
				});
			} else {
				cards.push(card.cardCode);
			}
		});
	});

	return ok;
}

function checkRegionlock(decks){
	let regions = [];
	let ok = true;

	decks.forEach((deck) => {
		const regions_deck = getRegions(deck);
		regions_deck.forEach((region) => {
			if (regions.includes(region)){
				ok = false;
				const repetidas = document.getElementsByName(region);
				repetidas.forEach((repetida) => {
					repetida.classList.add('repetida');
				});
			}else{
				regions.push(region);
			}
		});
	});

	return ok;
}

function checkRiotlock(decks){
	let champions = [];
	let ok = true;

	decks.forEach((deck) => {
		const champions_deck = getChampions(deck);
		champions_deck.forEach((champion) => {
			if (champions.includes(champion)){
				ok = false;
				const repetidas = document.getElementsByName(champion);
				repetidas.forEach((repetida) => {
					repetida.classList.add('repetida');
				});
			}else{
				champions.push(champion);
			}
		});
	});

	let regions = [];

	decks.forEach((deck) => {
		const regions_deck = getRegions(deck);
		let regions_string = '';
		regions_deck.sort();
		regions_deck.forEach((region) => {
			regions_string += region;
		});
		
		if (regions.includes(regions_string)){
			ok = false;
			const repetidas = document.getElementsByName(regions_string);
			repetidas.forEach((repetida) => {
				repetida.classList.add('repetida');
			});
		} else {
			regions.push(regions_string);
		}
	});

	return ok;
}

function checkSingleton(decks){
	let ok = true;

	decks.forEach((deck, index) => {
		if (deck.length != 40){
			deck.forEach((card) => {
				if (card.qtde > 1){
					ok = false;
					const repetida = document.getElementById(`${card.cardCode}_${index}`);
					repetida.classList.add('repetida');
				}
			});
		}
	});

	return ok;
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
	let ok = true;

	veredito.classList.remove('tudo-certo');
	veredito.classList.remove('erro');
	veredito.innerHTML = '';
	decks_element.innerHTML = '';

	for (let i = 1; i < 4; ++i){
		const code = document.querySelector(`#deck${i}`).value;
		const response = await fetch(`https://leaderboardescola.herokuapp.com/deck/decode?deck=${code}`);

		if (response.ok){
			const result = await response.json();
			decks.push(result);
		}else{
			veredito.classList.add('erro');
			veredito.insertAdjacentHTML('beforeend', '<h1 class="error">Um dos códigos passados é inválido.</h1>');
			footer.style.position = 'absolute';
			return;
		}
	}

	footer.style.position = '';

	decks.forEach((deck, index) => {
		viewDeck(deck, index);
	});
	document.querySelector('#conteudo').style.marginBottom = '80px';

	const regra = document.querySelector('#regra').value;
	const singleton = document.querySelector('#singleton').checked;
	ok = regras_function[regra](decks);

	if (singleton){
		if (ok){
			ok = checkSingleton(decks);
		}else{
			checkSingleton(decks);
		}
	}

	if (ok){
		veredito.classList.add('tudo-certo');
		veredito.insertAdjacentHTML('beforeend', '<h1>Tudo certo e de acordo com as regras.</h1>');
	}
}

document.querySelector('#footer').style.position = 'absolute';
document.querySelector('#footer').style.bottom = 0;