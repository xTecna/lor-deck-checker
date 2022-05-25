class CardDataHandler {
    constructor() {
        this.data = null;
    }

    async getDataFromLocale(locale) {
        try {
            let response = await fetch(
                `https://raw.githubusercontent.com/xTecna/lor-cards/main/${locale}.json`
            );

            if (response.ok) {
                this.data = await response.json();
            } else {
                this.data = null;
            }
        } catch {
            this.data = null;
        }
    }

    getDataFromCode(code) {
        return this.data[code];
    }

    getDeckFromCards(code, cards) {
        const convertedCards = cards.map((card) => {
            let cardData = this.getDataFromCode(card.code);
            if (!cardData) {
                throw new Error("Invalid card data.");
            }
            return { 'count': card.count, ...cardData };
        });

        let champions = [];
        for (let card of convertedCards) {
            if (card.supertype === "champion") {
                champions.push(card.nameRef);
            }
        }

        let regions = [];
        if (champions.includes("Jhin")) {
            regions.push("Jhin");
        }
        if (champions.includes("Bard")) {
            regions.push("Bard");
        }
        for (let card of convertedCards) {
            if (champions.includes("Jhin") && card.origin["Jhin"]) {
            } else if (champions.includes("Bard") && card.origin["Bard"]) {
            } else if (card.regions.length === 1 && !regions.includes(card.regions[0])) {
                regions.push(card.regions[0]);
            }
        }

        return {
            'cardCode': code,
            'regions': regions,
            'champions': champions,
            'cards': convertedCards.map((card) => {
                return {
                    'cardCode': card.cardCode,
                    'region': card.regions[0],
                    'cost': card.cost,
                    'name': card.name,
                    'type': card.supertype === "champion" ? card.supertype : card.type,
                    'qty': card.count
                };
            })
        };
    }
}

class Base32 {
    numberOfTrailingZeros(i) {
        if (i === 0) return 32;
        let n = 31;

        let y = i << 16;
        if (y !== 0) { n = n - 16; i = y; }
        y = i << 8;
        if (y !== 0) { n = n - 8; i = y; }
        y = i << 4;
        if (y !== 0) { n = n - 4; i = y; }
        y = i << 2;
        if (y !== 0) { n = n - 2; i = y; }

        return n - ((i << 1) >> 31);
    }

    constructor() {
        this.SEPARATOR = "-";
        this.DIGITS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".split("");
        this.MASK = this.DIGITS.length - 1;
        this.SHIFT = this.numberOfTrailingZeros(this.DIGITS.length);
        this.CHAR_MAP = this.DIGITS.reduce((m, d, i) => {
            m[d.toString()] = i;
            return m;
        }, {});
        this.SEPARATOR = '-';
    }

    decode(encoded) {
        encoded = encoded.trim().replace(this.SEPARATOR, "");
        encoded = encoded.replace(/[=]*$/, "");
        encoded = encoded.toUpperCase();

        if (encoded.length === 0) return [0];

        const encodedLength = encoded.length;
        const outLength = Math.floor(encodedLength * this.SHIFT / 8);
        const result = new Array(outLength);
        let buffer = 0;
        let next = 0;
        let bitsLeft = 0;
        for (const c of encoded.split("")) {
            if (!(c in this.CHAR_MAP)) {
                throw new TypeError("Illegal character: " + c);
            }

            buffer <<= this.SHIFT;
            buffer |= this.CHAR_MAP[c] & this.MASK;
            bitsLeft += this.SHIFT;
            if (bitsLeft >= 8) {
                result[next++] = (buffer >> (bitsLeft - 8)) & 0xff;
                bitsLeft -= 8;
            }
        }

        return result;
    }
}

class VarInt {
    constructor() {
        this.AllButMSB = 0x7f;
        this.JustMSB = 0x80;
    }

    pop(bytes) {
        let result = 0;
        let currentShift = 0;
        let bytesPopped = 0;

        for (let i = 0; i < bytes.length; ++i) {
            ++bytesPopped;
            let current = bytes[i] & this.AllButMSB;
            result |= current << currentShift;

            if ((bytes[i] & this.JustMSB) !== this.JustMSB) {
                bytes.splice(0, bytesPopped);
                return result;
            }

            currentShift += 7;
        }

        throw new TypeError("Byte array did not contain valid varints.");
    }
}

class LorDeckEncoder {
    constructor(cardDataHandler) {
        this.cardDataHandler = cardDataHandler;

        this.base32 = new Base32();
        this.varInt = new VarInt();

        this.initialVersion = 1;
        this.maxKnownVersion = 5;
        this.format = 2;
        this.cardCodeLength = 7;

        this.factionCodes = {
            "DE": 0,
            "FR": 1,
            "IO": 2,
            "NX": 3,
            "PZ": 4,
            "SI": 5,
            "BW": 6,
            "SH": 7,
            "MT": 9,
            "BC": 10,
            "RU": 12,
            0: "DE",
            1: "FR",
            2: "IO",
            3: "NX",
            4: "PZ",
            5: "SI",
            6: "BW",
            7: "SH",
            9: "MT",
            10: "BC",
            12: "RU"
        };
        this.factionLibraryVersions = {
            "DE": 1,
            "FR": 1,
            "IO": 1,
            "NX": 1,
            "PZ": 1,
            "SI": 1,
            "BW": 2,
            "MT": 2,
            "SH": 3,
            "BC": 4,
            "RU": 5
        };
    }

    getDeckFromCode(code) {
        let result = [];

        let bytes = null;
        try {
            bytes = this.base32.decode(code);
        }
        catch
        {
            throw new TypeError("Invalid deck code");
        }

        let firstByte = bytes.shift();
        let format = firstByte >> 4;
        let version = firstByte & 0xF;

        if (format !== this.format) {
            throw new TypeError("The provided code does not match the required format.");
        }
        if (version > this.maxKnownVersion) {
            throw new Error("The provided code requires a higher version of this library; please update.");
        }

        for (let i = 3; i > 0; --i) {
            const numGroupOfs = this.varInt.pop(bytes);

            for (let j = 0; j < numGroupOfs; ++j) {
                const numOfsInThisGroup = this.varInt.pop(bytes);
                const set = this.varInt.pop(bytes);
                const faction = this.varInt.pop(bytes);

                for (let k = 0; k < numOfsInThisGroup; ++k) {
                    const card = this.varInt.pop(bytes);

                    const setString = set.toString().padStart(2, '0');
                    const factionString = this.factionCodes[faction];
                    const cardString = card.toString().padStart(3, '0');

                    result.push({ 'code': setString + factionString + cardString, 'count': i });
                }
            }
        }

        while (bytes.length > 0) {
            let fourPlusCount = this.varInt.pop(bytes);
            let fourPlusSet = this.varInt.pop(bytes);
            let fourPlusFaction = this.varInt.pop(bytes);
            let fourPlusNumber = this.varInt.pop(bytes);

            let fourPlusSetString = fourPlusSet.toString().padStart(2, '0');
            let fourPlusFactionString = this.factionCodes[fourPlusFaction];
            let fourPlusNumberString = fourPlusNumber.toString().padStart(3, '0');

            result.push({ 'code': fourPlusSetString + fourPlusFactionString + fourPlusNumberString, 'count': fourPlusCount });
        }

        return this.cardDataHandler.getDeckFromCards(code, result);
    }
}