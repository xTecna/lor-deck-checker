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

function renderDeckPreview(code){
	const deck = decode(code);

	let champions = [];
	let regions = [];

	deck.forEach((card) => {
		let data = card_data.find(value => card.cardId == value.cardCode);
		const region = data.cardCode.substring(2, 4);
		if (!regions.includes(src_regions[region])){
			regions.push(src_regions[region]);
		}

		if (data.type === "Campeão"){
			champions.push(src_champions[data.cardCode]);
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

function viewDeck(code){
	const content = document.querySelector('#decks');
	const deck = decode(code);

	let champions = [];
	let followers = [];
	let spells = [];

	deck.forEach((card) => {
		let data = card_data.find(value => card.cardId == value.cardCode);
		if (data.type == 'Campeão'){
			champions.push({ ...data, 'qtd': card.quantity});
		} else if (data.type == 'Unidade'){
			followers.push({ ...data, 'qtd': card.quantity});
		} else if (data.type == 'Feitiço'){
			spells.push({ ...data, 'qtd': card.quantity});
		}
	});

	champions.sort(compare);
	followers.sort(compare);
	spells.sort(compare);

	let html = `<div class="deck">${renderDeckPreview(code)}`;

	html += `<div class="deck-completo"><h2>Campeões</h2>`;
	champions.forEach((card) => {
		const region = card.cardCode.substring(2, 4);
		html += `<div class="card ${src_regions[region]}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtd}</span></div>`
	});
	html += `<h2>Seguidores</h2>`
	followers.forEach((card) => {
		const region = card.cardCode.substring(2, 4);
		html += `<div class="card ${src_regions[region]}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtd}</span></div>`
	});
	html += `<h2>Feitiços</h2>`
	spells.forEach((card) => {
		const region = card.cardCode.substring(2, 4);
		html += `<div class="card ${src_regions[region]}" name="${card.cardCode}"><div class="mana-nome"><span class="mana">${card.mana}</span><span class="nome">${card.name}</span></div><span class="qtd">x${card.qtd}</span></div>`
	});
	html += '</div>';

	content.insertAdjacentHTML('beforeend', html);
}

function viewVeredito(codes){
	let cards = [];
	const veredito = document.querySelector('#veredito');
	let ok = true;
	let mensagem = '';

	codes.forEach((code) => {
		const deck = decode(code);

		deck.forEach((card) => {
			if (cards.indexOf(card.cardId) !== -1){
				ok = false;
				const repetidas = document.getElementsByName(card.cardId);
				repetidas.forEach((repetida) => {
					repetida.classList.add("repetida");
				});
			} else {
				cards.push(card.cardId);
			}
		});
	});

	if (ok)
	{
		veredito.classList.add('tudo-certo');
		mensagem = '<h1>Tudo certo, não há cartas repetidas aqui!</h1>';
	}
	else
	{
		mensagem = '';
	}

	veredito.insertAdjacentHTML('beforeend', mensagem);
}

function checkDecks(){
	const veredito = document.querySelector('#veredito');
	const decks = document.querySelector('#decks');
	let ok = true;
	let codes = [];

	veredito.classList.remove('tudo-certo');
	veredito.classList.remove('erro');
	veredito.innerHTML = '';
	decks.innerHTML = '';

	for (let i = 1; i < 4; ++i){
		const code = document.getElementsByName(`deck${i}`)[0].value;
		if (code === '' || !isValid(code)){
			ok = false;
			break;
		}else{
			codes.push(code);
		}
	}

	if (!ok){
		veredito.classList.add('erro');
		veredito.insertAdjacentHTML('beforeend', '<h1 class="error">Um dos códigos passados é inválido.</h1>');
		return;
	}

	codes.forEach((code) => {
		viewDeck(code);
	});

	viewVeredito(codes);
}