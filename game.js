import { discordSdk } from './discord.js';
console.log(discordSdk);

const boardTag = document.querySelector('#board');
const keyboardTag = document.querySelector('#keyboard');
const keyboardTemplateLatin = document.querySelector('#template-keyboard-latin');
const keyboardTemplateCyrillic = document.querySelector('#template-keyboard-cyrillic');
const rowTemplate = document.querySelector('#template-row');

const keyboards = {
	en: keyboardTemplateLatin.content.cloneNode(true),
	ru: keyboardTemplateCyrillic.content.cloneNode(true)
};

const ALPHABET = {
	en: { 65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g", 72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m", 78: "n", 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z"},
	ru: { 65: "ф", 66: "и", 67: "с", 68: "в", 69: "у", 70: "а", 71: "п", 72: "р", 73: "ш", 74: "о", 75: "л", 76: "д", 77: "ь", 78: "т", 79: "щ", 80: "з", 81: "й", 82: "к", 83: "ы", 84: "е", 85: "г", 86: "м", 87: "ц", 88: "ч", 89: "н", 90: "я", 186: "ж", 188: "б", 190: "ю", 192: "ё", 219: "х", 221: "ъ", 222: "э"}
};

class Board
{
	constructor(rowCount, wordLength)
	{
		this.rows = [];
		for(let i = 0; i < rowCount; i++)
		{
			let row = [];
			let rowTag = rowTemplate.content.cloneNode(true).querySelector('.row');

			for(let j = 0; j < wordLength; j++)
			{
				let div = document.createElement('div');
				div.classList.add('cell');
				row.push(div);

				rowTag.appendChild(div);
			}

			this.rows.push(row);
			boardTag.appendChild(rowTag);
		}
	}
}

class Keyboard
{
	constructor(lang, cb)
	{
		this.keys = {};
		this.lang = lang;

		let keyboard = keyboards[this.lang];
		keyboardTag.appendChild(keyboard);

		let _keys = keyboardTag.querySelectorAll('.key');
		for(let i = 0; i < _keys.length; i++)
		{
			let keycode = _keys[i].getAttribute('keycode');
			this.keys[keycode] = {
				tag: _keys[i],
				lastUsedDevice: null
			};

			_keys[i].addEventListener('mousedown', e =>
			{
				let keycode = e.target.getAttribute('keycode');
				if(this.keys[keycode] && !this.keys[keycode].lastUsedDevice)
				{
					this.keys[keycode].tag.classList.add('active');
					this.keys[keycode].lastUsedDevice = 'mouse';
					cb(keycode);
				}
			});
		}

		document.addEventListener('mouseup', e =>
		{
			for(const keycode in this.keys)
			{
				if(this.keys[keycode].lastUsedDevice === 'mouse')
				{
					this.keys[keycode].tag.classList.remove('active');
					this.keys[keycode].lastUsedDevice = null;
				}
			}
		});

		document.addEventListener('keydown', e =>
		{
			if(this.keys[e.keyCode] && !this.keys[e.keyCode].lastUsedDevice)
			{
				this.keys[e.keyCode].tag.classList.add('active')
				this.keys[e.keyCode].lastUsedDevice = 'keyboard';
				cb(e.keyCode);
			}
		});

		document.addEventListener('keyup', e => 
		{
			if(this.keys[e.keyCode] && this.keys[e.keyCode].lastUsedDevice == 'keyboard')
			{
				this.keys[e.keyCode].tag.classList.remove('active')
				this.keys[e.keyCode].lastUsedDevice = null;
			}
		});

		window.addEventListener('blur', e =>
		{
			for(const keycode in this.keys)
			{
				if(this.keys[keycode].lastUsedDevice)
				{
					this.keys[keycode].tag.classList.remove('active');
					this.keys[keycode].lastUsedDevice = null;
				}
			}
		});
	}
}

class Game
{
	constructor()
	{
		this.word = '';
		this.keyCodes = [];
		this.wordLength = null;
		this.lang = 'en';
		this.rowIndex = 0;
		this.isFinished = false;

		this.wordLength = 10;

		this.board = new Board(5, this.wordLength);
		this.keyboard = new Keyboard(this.lang, this.processKey.bind(this));
	}

	processKey(keycode)
	{
		if(this.isFinished) return;

		if(keycode == 13)
		{
			if(this.word.length == this.wordLength)
			{
				let data = {
					type: 'answer',
					word: this.word,
					attempt: this.rowIndex + 1
				};
				this.send(data);
			}
		}
		else if(keycode == 8)
		{
			if(this.word.length > 0)
			{				
				this.board.rows[this.rowIndex][this.word.length - 1].textContent = '';
				this.word = this.word.slice(0, -1);
				this.keyCodes = this.keyCodes.slice(0, -1);
			}
		}
		else
		{
			if(this.word.length < this.wordLength)
			{
				let letter = ALPHABET[this.lang][keycode];
				this.board.rows[this.rowIndex][this.word.length].textContent = letter.toUpperCase();
				this.word += letter.toUpperCase();
				this.keyCodes.push(keycode);
			}
		}
	}

	send(data = {})
	{
		// let xhr = new XMLHttpRequest();
		// xhr.open('POST', '/server');

		// xhr.onreadystatechange = function()
		// {
		// 	if(xhr.readyState == XMLHttpRequest.DONE && xhr.status >= 200 && xhr.status < 300)
		// 		this.#processAnswerCB(xhr.response);
		// }

		// xhr.send(data);

		this.#processAnswerCB({});
	}

	#processAnswerCB(response)
	{

		response = {
			guess: "GHOST",
			result: [
				"absent",
				"correct",
				"present",
				"absent",
				"correct"
			],
			finished: false,
			solved: false
		};

		for(let i = 0; i < this.wordLength; i++)
		{
			this.board.rows[this.rowIndex][i].textContent = response.guess[i];
			this.board.rows[this.rowIndex][i].classList.add(response.result[i]);

			let keycode = this.keyCodes[i];
			this.keyboard.keys[keycode].tag.classList.add(response.result[i]);

		}

		this.rowIndex++;
		this.word = '';
		this.keyCodes = [];

		if(response.finished)
		{
			this.isFinished = true;
		}
	}
}

var game = new Game();
