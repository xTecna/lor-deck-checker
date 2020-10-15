function isValid(code){
	try
	{
		decode(code);
		return true;
	}
	catch
	{
		return false;
	}
}

function compare(a, b){
	if (a.mana < b.mana)	return -1;
	if (a.mana > b.mana)	return 1;
	return 0;
}

function renderDeckPreview(deck){
	let champions = [];
	let regions = [];

	deck.forEach((card) => {
		if (!regions.includes(card.region)){
			regions.push(card.region);
		}

		if (card.type === "Campeão"){
			champions.push(card.name.replace(' ', ''));
		}
	})
	
	let html = `<div class="resumo-deck"><div class="regioes">`;
	regions.forEach(region => {
		html += `<div class="regiao"><img src="http://dd.b.pvp.net/latest/core/en_us/img/regions/icon-${region}.png"></div>`;
	})
	html += '</div><div class="separador"></div><div class="campeoes">';
	champions.forEach(champion => {
		html += `<div class="campeao"><img src="http://ddragon.leagueoflegends.com/cdn/10.15.1/img/champion/${champion}.png"></div>`;
	})
	html += '</div></div>';

	return html;
}

function viewDeck(deck){
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
			html += `<div class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtde}</span></div>`
		});
	}
	else
	{
		html += '<h3>Sem campeões.</h3>';
	}
	html += `<h2>Seguidores</h2>`;
	if (followers.length > 0){
		followers.forEach((card) => {
			html += `<div class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtde}</span></div>`
		});
	}
	else
	{
		html += '<h3>Sem seguidores.</h3>';
	}
	html += `<h2>Feitiços</h2>`;
	if (spells.length > 0){
		spells.forEach((card) => {
			html += `<div class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtde}</span></div>`
		});
	}
	else
	{
		html += '<h3>Sem feitiços.</h3>';
	}
	if (landmarks.length > 0){
		html += `<h2>Monumentos</h2>`;
		landmarks.forEach((card) => {
			html += `<div class="card ${card.region}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtde}</span></div>`
		});
	}
	html += '</div>';

	content.insertAdjacentHTML('beforeend', html);
}

function viewVeredito(decks){
	const veredito = document.querySelector('#veredito');
	let cards = [];
	let ok = true;

	decks.forEach((deck) => {
		deck.forEach((card) => {
			if (cards.indexOf(card.cardCode) !== -1){
				ok = false;
				const repetidas = document.getElementsByName(card.cardCode);
				repetidas.forEach((repetida) => {
					repetida.classList.add("repetida");
				});
			} else {
				cards.push(card.cardCode);
			}
		});
	});

	if (ok)
	{
		veredito.classList.add('tudo-certo');
		veredito.insertAdjacentHTML('beforeend', '<h1>Tudo certo, não há cartas repetidas aqui!</h1>');
	}
}

async function checkDecks(){
	const veredito = document.querySelector('#veredito');
	const decks_element = document.querySelector('#decks');
	const footer = document.querySelector('#footer');
	let decks = [];

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

	decks.forEach((deck) => {
		viewDeck(deck);
	});
	document.querySelector('#conteudo').style.marginBottom = '80px';

	viewVeredito(decks);
}

document.querySelector('#footer').style.position = 'absolute';
document.querySelector('#footer').style.bottom = 0;