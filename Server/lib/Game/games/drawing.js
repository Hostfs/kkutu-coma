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

var Const = require('../../const');
var Lizard = require('../../sub/lizard');
var DB;
var DIC;

exports.init = function(_DB, _DIC){
	DB = _DB;
	DIC = _DIC;
};

exports.getTitle = function(){
	var R = new Lizard.Tail();
	var my = this;
	
	my.game.done = [];
	setTimeout(function(){
		R.go("①②③④⑤⑥⑦⑧⑨⑩");
	}, 500);
	return R;
};

exports.roundReady = function(){
	var my = this;
	var ijl = my.opts.injpick.length;
	
	clearTimeout(my.game.qTimer);
	my.game.winner = [];
	my.game.giveup = [];
	my.game.round++;
	my.game.roundTime = my.time * 1000;
	
	if(my.game.round <= my.round){
		// Pick Drawer from sequence
		var seqLen = my.game.seq.length;
		my.game.drawer = my.game.seq[(my.game.round - 1) % seqLen];
		my.game.theme = my.opts.injpick[Math.floor(Math.random() * ijl)];
		
		getAnswer.call(my, my.game.theme).then(function($ans){
			if(!my.game.done) return;
			
			my.game.late = false;
			my.game.answer = $ans || { _id: "사과" }; // fallback
			my.game.done.push(my.game.answer._id);
			
			// Broadcast roundReady to everyone in the room
			my.byMaster('roundReady', {
				round: my.game.round,
				drawer: my.game.drawer,
				wordLength: my.game.answer._id.length,
				theme: my.game.theme
			}, true);
			
			// Send secret word only to the drawer client
			var drawerClient = DIC[my.game.drawer];
			if (drawerClient) {
				drawerClient.send('secretWord', { word: my.game.answer._id });
			}
			
			setTimeout(my.turnStart, 3000);
		});
	}else{
		my.roundEnd();
	}
};

exports.turnStart = function(){
	var my = this;
	
	if(!my.game.answer) return;
	
	my.game.roundAt = (new Date()).getTime();
	my.game.primary = 0;
	
	// Broadcast turn start and clear canvas for everyone
	my.byMaster('turnStart', {
		drawer: my.game.drawer,
		wordLength: my.game.answer._id.length,
		roundTime: my.game.roundTime
	}, true);
	
	my.game.qTimer = setTimeout(my.turnEnd, my.game.roundTime);
};

exports.turnEnd = function(){
	var my = this;

	if(my.game.answer){
		my.game.late = true;
		my.byMaster('turnEnd', {
			answer: my.game.answer ? my.game.answer._id : ""
		});
	}
	my.game._rrt = setTimeout(my.roundReady, 3500);
};

exports.submit = function(client, text){
	var my = this;
	var score, t;
	var $ans = my.game.answer;
	var now = (new Date()).getTime();
	var play = (my.game.seq ? my.game.seq.includes(client.id) : false);
	var isDrawer = (client.id === my.game.drawer);
	
	if(!my.game.winner) return;
	
	// Drawers cannot guess their own word
	if (isDrawer) {
		client.chat(text);
		return;
	}
	
	// If guess is correct and player hasn't won yet
	if(my.game.winner.indexOf(client.id) == -1 && text == $ans._id && play){
		t = now - my.game.roundAt;
		score = my.getScore(text, t);
		
		my.game.primary++;
		my.game.winner.push(client.id);
		
		// Award points to the guesser
		client.game.score += score;
		client.publish('turnEnd', {
			target: client.id,
			ok: true,
			value: text,
			score: score,
			bonus: 0
		}, true);
		
		// Also award drawer points for drawing it well!
		var drawerClient = DIC[my.game.drawer];
		if (drawerClient) {
			var drawerBonus = Math.round(score * 0.4);
			drawerClient.game.score += drawerBonus;
			drawerClient.publish('turnEnd', {
				target: drawerClient.id,
				ok: true,
				value: `출제보너스 (+${drawerBonus})`,
				score: drawerBonus,
				bonus: drawerBonus
			}, true);
		}
		
		client.invokeWordPiece(text, 0.9);
		
	} else {
		// Just general chat
		client.chat(text);
	}
	
	// If all guessers have successfully guessed the word, end the turn early!
	var totalGuessers = my.game.seq.length - 1;
	if(play && my.game.primary >= totalGuessers && totalGuessers > 0){
		clearTimeout(my.game.qTimer);
		my.turnEnd();
	}
};

exports.getScore = function(text, delay){
	var my = this;
	var rank = my.game.hum - my.game.primary + 3;
	var tr = 1 - delay / my.game.roundTime;
	var score = 10 * Math.pow(rank, 1.3) * ( 0.4 + 0.6 * tr );

	return Math.round(score);
};

function getAnswer(theme) {
	var my = this;
	var R = new Lizard.Tail();
	var args = [ [ '_id', { $nin: my.game.done } ] ];
	
	args.push([ 'type', Const.KOR_GROUP ]);
	args.push([ 'flag', { $lte: 7 } ]); // common Korean nouns/words
	if (theme) {
		args.push([ 'theme', new RegExp("(,|^)(" + theme + ")(,|$)") ]);
	}
	
	DB.kkutu['ko'].find.apply(my, args).on(function($res){
		if(!$res || !$res.length) {
			// Fallback: search without theme filter
			var fallbackArgs = [ [ '_id', { $nin: my.game.done } ], [ 'type', Const.KOR_GROUP ], [ 'flag', { $lte: 7 } ] ];
			DB.kkutu['ko'].find.apply(my, fallbackArgs).on(function($fallbackRes){
				if(!$fallbackRes || !$fallbackRes.length) return R.go(null);
				return pickWord($fallbackRes);
			});
		} else {
			return pickWord($res);
		}
		
		function pickWord(list) {
			var len = list.length;
			do{
				var pick = Math.floor(Math.random() * len);
				var word = list[pick]._id;
				// Filter for pure Korean nouns of length 2 to 5 characters
				if(word.length >= 2 && word.length <= 5 && !/[^가-힣]/.test(word)){
					return R.go(list[pick]);
				}
				list.splice(pick, 1);
				len--;
			}while(len > 0);
			R.go(null);
		}
	});
	return R;
}
