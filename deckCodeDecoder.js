function readChar(alphabet, char) {
	var idx = alphabet.indexOf(char)

	if (idx === -1) {
		throw new Error('Invalid character found: ' + char)
	}

	return idx;
}

function base32Decode(input) {
	var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
	input = input.replace(/=+$/, '')

	var length = input.length

	var bits = 0
	var value = 0

	var index = 0
	var output = new Uint8Array((length * 5 / 8) | 0)

	for (var i = 0; i < length; i++) {
		value = (value << 5) | readChar(alphabet, input[i])
		bits += 5

		if (bits >= 8) {
			output[index++] = (value >>> (bits - 8)) & 255
			bits -= 8
		}
	}

	return output.buffer
}
//setting the MSB and REST for encoding and decoding VarInts
var MSB = 0x80, REST = 0x7F

function readVarInt(buf, offset) {
	var result = 0;
	var bytesPopped = 1
	var offset = offset || 0
	var currentShifted = 0
	var shifted = false
	for (var i = offset; i < buf.byteLength; i++) {
		var value = new Uint8Array(buf.slice(i, i + 1))[0]
		var current = value & REST;
		var ifMsb = value & MSB;
		if (ifMsb != MSB) {
			if (shifted) {
				var shifted = current << currentShifted
				result = result | shifted
			} else {
				result = current
			}
			return { "value": result, "moved": bytesPopped }
		} else {
			var shifted = current << currentShifted
			result = result | shifted
			shifted = true
		}
		bytesPopped++
		currentShifted += 7;
	}
}

function padNumber(value, length) {
	var str = "" + value
	var offset = "0"
	if (str.length < length) {
		for (var i = 0; i < (length - 1) - (str.length); i++) {
			offset += "0"
		}
	}
	return offset + str
}

//dict to help us convert Fraction encoded numbers to thier string intepretation
const fractionIdentifierDecode = {
	0: 'DE',
	1: 'FR',
	2: 'IO',
	3: 'NX',
	4: 'PZ',
	5: 'SI',
	6: 'BW',
	9: 'MT',
};

// function to decode the LoR deck Codes
function decode(code) {
	//counter to know where we are in the Byte Array
	var counter = 0;
	//Setting MAX known version
	var MAX_KNOWN_VERSION = 2;
	//decoding the code
	const decodedBytes = base32Decode(code);
	//getting the format and version from the Byte Array
	const formatVersionValue = new Uint8Array(decodedBytes.slice(0, 1));
	counter++;

	var cards = [];
	//decoding the format and version both are added to one byte 00010001
	var format = formatVersionValue >> 4;
	var version = formatVersionValue & 0xf;
	//checking if the code is the right version
	if (version > MAX_KNOWN_VERSION) {
		throw 'The provided code requires a higher version of this library; please update.';
		return null;
	}

	//looping through the 3 quantities of cards [3,2,1]
	for (var i = 3; i > 0; i--) {
		//getting number of fractions in a quantity
		var numOfFractionsResult = readVarInt(decodedBytes, counter);
		if (numOfFractionsResult != undefined) {
			var numOfFractions = numOfFractionsResult['value'];
			counter += numOfFractionsResult['moved'];
			for (var j = 0; j < numOfFractions; j++) {
				//getting number of cards in a fraction group
				var numofCardsResult = readVarInt(decodedBytes, counter);
				var numofCards = numofCardsResult['value'];
				counter += numofCardsResult['moved'];
				//reading the set number for the given group
				var setNumberResult = readVarInt(decodedBytes, counter);
				var setNumber = setNumberResult['value'];
				counter += setNumberResult['moved'];
				//reading the fraction for the given group
				var fractionValueResult = readVarInt(decodedBytes, counter);
				var fractionValue =
					fractionIdentifierDecode[fractionValueResult['value']];
				counter += fractionValueResult['moved'];
				//looping through the number of cards in the group
				for (var k = 0; k < numofCards; k++) {
					//getting card number for all cards in the group
					var cardNumberResult = readVarInt(decodedBytes, counter);
					var cardNumber = cardNumberResult['value'];
					counter += cardNumberResult['moved'];
					//creating card object to describe the pack
					var cardId =
						padNumber(setNumber, 2) + fractionValue + padNumber(cardNumber, 3);
					cards.push({ quantity: i, cardId: cardId });
				}
			}
		}
	}
	//reading cards with 4+ quantity (this is only used in special events)
	while (decodedBytes.ByteLength > counter) {
		//reading the card quantity
		var fourPlusQuantityResult = readVarInt(decodedBytes, counter);
		var fourPlusQuantity = fourPlusQuantityResult['value'];
		counter += fourPlusQuantityResult['moved'];
		//reading the card set number
		var fourPlusSetResult = readVarInt(decodedBytes, counter);
		var fourPlusSet = fourPlusSetResult['value'];
		counter += fourPlusSetResult['moved'];
		//reading the card fraction
		var fourPlusFractionResult = readVarInt(decodedBytes, counter);
		var fourPlusFraction = fourPlusFractionResult['value'];
		counter += fourPlusFractionResult['moved'];
		//reading the card number
		var fourPlusCardNumberResult = readVarInt(decodedBytes, counter);
		var fourPlusCardNumber = fourPlusCardNumberResult['value'];
		counter += fourPlusCardNumberResult['moved'];
		//creating card object to describe the pack
		var cardId =
			padNumber(fourPlusSet, 2) +
			fourPlusFraction +
			padNumber(fourPlusCardNumber, 3);
		cards.push({ quantity: fourPlusQuantity, cardId: cardId });
	}

	return cards;
}
