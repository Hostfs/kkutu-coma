/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const {
	ipcRenderer, shell
} = require("electron");
const LANG = require("../../language.json");
let $stage;
let logs = 0;

$(() => {
	$stage = {
		title: $("#title"),
		log: $("#log-board")
	};
	$stage.log.html(LANG['welcome']);
});
ipcRenderer.on('server-status', (ev, code) => {
	$stage.title.removeClass("server-off server-warn server-on");
	switch(code){
		case 0: $stage.title.addClass("server-off"); break;
		case 1: $stage.title.addClass("server-warn"); break;
		case 2: $stage.title.addClass("server-on"); break;
	}
});
ipcRenderer.on('alert', (ev, msg) => {
	alert(msg);
});
ipcRenderer.on('external', (ev, href) => {
	shell.openExternal(href);
});
function ansiToHtml(str) {
	str = str.toString()
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

	const ansiMap = {
		'30': 'color: #1e1e24;',
		'31': 'color: #f38ba8; font-weight: bold;',
		'32': 'color: #a6e3a1; font-weight: bold;',
		'33': 'color: #f9e2af;',
		'34': 'color: #89b4fa;',
		'35': 'color: #cba6f7;',
		'36': 'color: #89dceb; font-weight: bold;',
		'37': 'color: #cdd6f4;',
		'39': 'color: initial;',
		
		'40': 'background-color: #11111b;',
		'41': 'background-color: #eba0ac; color: #11111b; padding: 1px 3px; border-radius: 3px;',
		'42': 'background-color: #a6e3a1; color: #11111b; padding: 1px 3px; border-radius: 3px;',
		'43': 'background-color: #f9e2af; color: #11111b; padding: 1px 3px; border-radius: 3px;',
		'44': 'background-color: #89b4fa; color: #11111b; padding: 1px 3px; border-radius: 3px;',
		'45': 'background-color: #cba6f7; color: #11111b; padding: 1px 3px; border-radius: 3px;',
		'46': 'background-color: #89dceb; color: #11111b; padding: 1px 3px; border-radius: 3px;',
		'47': 'background-color: #cdd6f4; color: #11111b; padding: 1px 3px; border-radius: 3px;',
		'49': 'background-color: initial; color: initial;',
		
		'1': 'font-weight: bold;',
		'22': 'font-weight: normal;',
	};

	const ansiRegex = /\u001b\[([0-9;]*)m/g;
	let html = '';
	let openSpansCount = 0;
	let activeStyles = {
		fg: '',
		bg: '',
		bold: false
	};

	function getSpanStyle() {
		let styles = [];
		if (activeStyles.bold) styles.push('font-weight: bold');
		if (activeStyles.fg) styles.push(activeStyles.fg);
		if (activeStyles.bg) styles.push(activeStyles.bg);
		return styles.join('; ');
	}

	let parts = str.split(ansiRegex);
	for (let i = 0; i < parts.length; i++) {
		if (i % 2 === 0) {
			if (parts[i]) {
				html += parts[i];
			}
		} else {
			const codes = parts[i].split(';');
			let stylesChanged = false;
			
			for (const code of codes) {
				if (code === '0' || code === '') {
					activeStyles.fg = '';
					activeStyles.bg = '';
					activeStyles.bold = false;
					stylesChanged = true;
				} else if (code === '1') {
					activeStyles.bold = true;
					stylesChanged = true;
				} else if (code === '22') {
					activeStyles.bold = false;
					stylesChanged = true;
				} else if (parseInt(code) >= 30 && parseInt(code) <= 37) {
					activeStyles.fg = ansiMap[code] || '';
					stylesChanged = true;
				} else if (code === '39') {
					activeStyles.fg = '';
					stylesChanged = true;
				} else if (parseInt(code) >= 40 && parseInt(code) <= 47) {
					activeStyles.bg = ansiMap[code] || '';
					stylesChanged = true;
				} else if (code === '49') {
					activeStyles.bg = '';
					stylesChanged = true;
				}
			}

			if (stylesChanged) {
				while (openSpansCount > 0) {
					html += '</span>';
					openSpansCount--;
				}
				const currentStyle = getSpanStyle();
				if (currentStyle) {
					html += `<span style="${currentStyle}">`;
					openSpansCount++;
				}
			}
		}
	}

	while (openSpansCount > 0) {
		html += '</span>';
		openSpansCount--;
	}

	html = html.replace(/(error)/gi, `<label class="lt-error">$1</label>`);
	return html;
}

ipcRenderer.on('log', (ev, level, msg) => {
	if(++logs > 100){
		logs--;
		$(".log-item:first").remove();
	}
	msg = ansiToHtml(msg);
	$stage.log.append($(`<div class="log-item log-${level}">${msg}</div>`));
	$stage.log.scrollTop(99999999);
});