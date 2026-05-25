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

$lib.Drawing.roundReady = function(data){
	clearBoard();
	if ($data.drw) $data.drw.clear();
	
	if (!$data.room.game) $data.room.game = {};
	$data.room.game.drawer = data.drawer;
	
	$data._roundTime = $data.room.time * 1000;
	$data._fastTime = 10000;
	
	// Show drawing area in the center
	$(".jjoObj").hide();
	$(".jjoriping, .rounds").addClass("drw");
	$(".jjoriping").before($(".rounds")); // 라운드 번호를 상태판 바로 위로 이동
	$stage.game.drw.show();
	
	// Render blank slots for the word length
	var wordLenIndicator = "O ".repeat(data.wordLength).trim();
	$stage.game.display.html(wordLenIndicator);
	
	// If current user is the drawer, show a quick waiting notice
	if (data.drawer === $data.id) {
		$stage.game.display.html(L['secretWordNotice'] + " 확인 중...");
	}

	var themeName = L['theme_' + data.theme] || data.theme || L['modeKDR'];
	var tv = L['jqTheme'] + ": " + themeName;

	$(".jjo-turn-time .graph-bar")
		.width("100%")
		.html(tv)
		.css('text-align', "center");
		
	drawRound(data.round);
	playSound('round_start');
	clearInterval($data._tTime);
};

$lib.Drawing.turnStart = function(data){
	$(".game-user-current").removeClass("game-user-current");
	$(".game-user-bomb").removeClass("game-user-bomb");
	
	if (!$data.room.game) $data.room.game = {};
	$data.room.game.drawer = data.drawer;
	
	$data._roundTime = data.roundTime;
	clearInterval($data._tTime);
	$data._tTime = addInterval($lib.Drawing.turnGoing, TICK);
	playBGM('jaqwi'); // use jaqwi bgm which is playful and fits a quiz!
	
	// Setup roles
	if (data.drawer === $data.id) {
		// I am the drawer! Hide text input, show pencil tools!
		$stage.game.here.hide();
		$("#drw-tools").css("display", "flex");
	} else {
		// I am a guesser! Show text input, hide drawing tools!
		if($data.room.game.seq.indexOf($data.id) >= 0) {
			$stage.game.here.show();
			$stage.game.hereText
				.prop('readonly', false)
				.attr('placeholder', '정답 단어를 입력하세요!')
				.focus();
		}
		$("#drw-tools").hide();
		
		// Render blanks
		var wordLenIndicator = "O ".repeat(data.wordLength).trim();
		$stage.game.display.html(wordLenIndicator);
	}
};

$lib.Drawing.turnGoing = $lib.Jaqwi.turnGoing;

$lib.Drawing.turnEnd = function(id, data){
	var $sc = $("<div>").addClass("deltaScore").html("+" + data.score);
	var $uc = $("#game-user-" + id);

	if(data.giveup){
		$uc.addClass("game-user-bomb");
	}else if(data.answer){
		// End of turn, show final answer
		$stage.game.here.hide();
		$("#drw-tools").hide();
		$stage.game.display.html($("<label>").css('color', "#FFFF44").html(data.answer));
		stopBGM();
		playSound('horr');
	}else{
		// Someone got it right!
		if(id == $data.id) {
			$stage.game.here.hide(); // Hide input once correctly guessed
		}
		addScore(id, data.score);
		if($data._roundTime > 10000) $data._roundTime = 10000; // Speed up time once someone guesses
		drawObtainedScore($uc, $sc);
		updateScore(id, getScore(id)).addClass("game-user-current");
		playSound('success');
	}
};

// Called ONLY on the drawer's client
$lib.Drawing.onSecretWord = function(data) {
	var wordNotice = L['secretWordNotice'] + ": " + data.word;
	$stage.game.display.html($("<label>").css('color', "#FFBB33").html(wordNotice));
	playSound('mission');
};

// Replicate drawing lines from drawer onto guessers' canvases
$lib.Drawing.onDraw = function(data) {
	if (!$data.drw || !$data.drw.ctx) return;
	
	// Skip drawing on drawer client since they already draw locally
	if ($data.id === $data.room.game.drawer) return;
	
	var ctx = $data.drw.ctx;
	
	if (data.action === 'start') {
		$data.drw._lastX = data.x;
		$data.drw._lastY = data.y;
	} else if (data.action === 'draw') {
		ctx.beginPath();
		ctx.moveTo($data.drw._lastX, $data.drw._lastY);
		ctx.lineTo(data.x, data.y);
		ctx.strokeStyle = data.color || "#000000";
		ctx.lineWidth = data.size || 5;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.stroke();
		
		$data.drw._lastX = data.x;
		$data.drw._lastY = data.y;
	} else if (data.action === 'clear') {
		$data.drw.clear();
	}
};
