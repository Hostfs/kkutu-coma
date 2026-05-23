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

var File	 = require("fs");
var MainDB	 = require("../db");
var GLOBAL	 = require("../../sub/global.json");
var JLog	 = require("../../sub/jjlog");
var Lizard	 = require("../../sub/lizard.js");

exports.run = function(Server, page){

Server.get("/gwalli", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	req.session.admin = true;
	page(req, res, "gwalli");
});
Server.get("/gwalli/injeong", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	MainDB.kkutu_injeong.find([ 'theme', { $not: "~" } ]).limit(100).on(function($list){
		res.send({ list: $list });
	});
});
Server.get("/gwalli/gamsi", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	MainDB.users.findOne([ '_id', req.query.id ]).limit([ 'server', true ]).on(function($u){
		if(!$u) return res.sendStatus(404);
		var data = { _id: $u._id, server: $u.server };
		
		MainDB.session.findOne([ 'profile.id', $u._id ]).limit([ 'profile', true ]).on(function($s){
			if($s) data.title = $s.profile.title || $s.profile.name;
			res.send(data);
		});
	});
});
Server.get("/gwalli/users", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	if(req.query.name){
		MainDB.session.find([ 'profile.title', req.query.name ]).on(function($u){
			if($u) return onSession($u);
			MainDB.session.find([ 'profile.name', req.query.name ]).on(function($u){
				if($u) return onSession($u);
				res.sendStatus(404);
			});
		});
	}else{
		MainDB.users.findOne([ '_id', req.query.id ]).on(function($u){
			if($u) return res.send({ list: [ $u ] });
			res.sendStatus(404);
		});
	}
	function onSession(list){
		var board = {};
		
		Lizard.all(list.map(function(v){
			if(board[v.profile.id]) return null;
			else{
				board[v.profile.id] = true;
				return getProfile(v.profile.id);
			}
		})).then(function(data){
			res.send({ list: data });
		});
	}
	function getProfile(id){
		var R = new Lizard.Tail();
		
		if(id) MainDB.users.findOne([ '_id', id ]).on(function($u){
			R.go($u);
		}); else R.go(null);
		return R;
	}
});
Server.get("/gwalli/kkutudb/:word", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	var TABLE = MainDB.kkutu[req.query.lang];
	
	if(!TABLE || !TABLE.findOne) return res.sendStatus(400);
	TABLE.findOne([ '_id', req.params.word ]).on(function($doc){
		res.send($doc);
	});
});
Server.get("/gwalli/kkututheme", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	var TABLE = MainDB.kkutu[req.query.lang];
	
	if(!TABLE || !TABLE.find) return res.sendStatus(400);
	TABLE.find([ 'theme', new RegExp(req.query.theme) ]).limit([ '_id', true ]).on(function($docs){
		res.send({ list: $docs.map(v => v._id) });
	});
});
Server.get("/gwalli/kkutuhot", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	File.readFile(GLOBAL.KKUTUHOT_PATH, function(err, file){
		var data = {};
		if (!err && file) {
			try {
				data = JSON.parse(file.toString());
			} catch(e) {
				JLog.error("Error parsing kkutuhot file: " + e.toString());
			}
		}
		
		parseKKuTuHot().then(function($kh){
			res.send({ prev: data, data: $kh });
		});
	});
});
Server.get("/gwalli/shop/:key", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	var q = (req.params.key == "~ALL") ? undefined : [ '_id', req.params.key ];
	
	MainDB.kkutu_shop.find(q).on(function($docs){
		MainDB.kkutu_shop_desc.find(q).on(function($desc){
			res.send({ goods: $docs, desc: $desc });
		});
	});
});
Server.post("/gwalli/injeong", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	var list = JSON.parse(req.body.list).list;
	var themes;
	
	list.forEach(function(v){
		if(v.ok){
			req.body.nof = true;
			req.body.lang = "ko";
			v.theme.split(',').forEach(function(w, i){
				setTimeout(function(lid, x){
					req.body.list = lid;
					req.body.theme = x;
					onKKuTuDB(req, res);
				}, i * 1000, v._id.replace(/[^가-힣0-9]/g, ""), w);
			});
		}else{
			MainDB.kkutu_injeong.update([ '_id', v._origin ]).set([ 'theme', "~" ]).on();
		}
		// MainDB.kkutu_injeong.remove([ '_id', v._origin ]).on();
	});
	res.sendStatus(200);
});
Server.post("/gwalli/kkutudb", onKKuTuDB);
function onKKuTuDB(req, res){
	if(!checkAdmin(req, res)) return;
	
	var theme = req.body.theme;
	var list = req.body.list;
	var TABLE = MainDB.kkutu[req.body.lang];
	
	if(list) list = list.split(/[,\r\n]+/);
	else return res.sendStatus(400);
	if(!TABLE || !TABLE.insert) return res.sendStatus(400);
	
	noticeAdmin(req, theme, list.length);
	list.forEach(function(item){
		if(!item) return;
		item = item.trim();
		if(!item.length) return;
		TABLE.findOne([ '_id', item ]).on(function($doc){
			if(!$doc) return TABLE.insert([ '_id', item ], [ 'type', "INJEONG" ], [ 'theme', theme ], [ 'mean', "＂1＂" ], [ 'flag', 2 ]).on();
			var means = $doc.mean.split(/＂[0-9]+＂/g).slice(1);
			var len = means.length;
			
			if($doc.theme.indexOf(theme) == -1){
				$doc.type += ",INJEONG";
				$doc.theme += "," + theme;
				$doc.mean += `＂${len+1}＂`;
				TABLE.update([ '_id', item ]).set([ 'type', $doc.type ], [ 'theme', $doc.theme ], [ 'mean', $doc.mean ]).on();
			}else{
				JLog.warn(`Word '${item}' already has the theme '${theme}'!`);
			}
		});
	});
	if(!req.body.nof) res.sendStatus(200);
}
Server.post("/gwalli/kkutudb/:word", function(req, res){
	if(!checkAdmin(req, res)) return;
	var TABLE = MainDB.kkutu[req.body.lang];
	var data = JSON.parse(req.body.data);
	
	if(!TABLE || !TABLE.upsert) return res.sendStatus(400);
	
	noticeAdmin(req, data._id);
	if(data.mean == ""){
		TABLE.remove([ '_id', data._id ]).on(function($res){
			res.send($res.toString());
		});
	}else{
		TABLE.upsert([ '_id', data._id ]).set([ 'flag', data.flag ], [ 'type', data.type ], [ 'theme', data.theme ], [ 'mean', data.mean ]).on(function($res){
			res.send($res.toString());
		});
	}
});
Server.post("/gwalli/kkutuhot", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	noticeAdmin(req);
	parseKKuTuHot().then(function($kh){
		var i, j, obj = {};
		
		for(i in $kh){
			for(j in $kh[i]){
				obj[$kh[i][j]._id] = $kh[i][j].hit;
			}
		}
		File.writeFile(GLOBAL.KKUTUHOT_PATH, JSON.stringify(obj), function(err){
			res.send(err);
		});
	});
});
Server.post("/gwalli/users", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	var list = JSON.parse(req.body.list).list;
	
	list.forEach(function(item){
		MainDB.users.upsert([ '_id', item._id ]).set(item).on();
	});
	res.sendStatus(200);
});
Server.post("/gwalli/shop", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	var list = JSON.parse(req.body.list).list;
	
	list.forEach(function(item){
		item.core.options = JSON.parse(item.core.options);
		MainDB.kkutu_shop.upsert([ '_id', item._id ]).set(item.core).on();
		MainDB.kkutu_shop_desc.upsert([ '_id', item._id ]).set(item.text).on();
	});
	res.sendStatus(200);
});

};
function noticeAdmin(req, ...args){
	JLog.info(`[ADMIN] ${req.originalUrl} ${req.ip} | ${args.join(' | ')}`);
}
function checkAdmin(req, res){
	var ip = req.ip || req.connection.remoteAddress;
	var isLocal = (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost');
	if (isLocal) {
		return true;
	}

	if(global.isPublic){
		if(req.session.profile){
			if(req.session.profile.id === "ADMIN" || GLOBAL.ADMIN.indexOf(req.session.profile.id) != -1){
				return true;
			}
			req.session.admin = false;
			if (req.path === '/gwalli') {
				res.send(`
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<title>Access Denied - KKuTu Admin</title>
						<link rel="stylesheet" href="/css/fa.css">
						<style>
							body {
								background: #0f0f1b;
								color: #e2e8f0;
								font-family: system-ui, -apple-system, sans-serif;
								display: flex;
								justify-content: center;
								align-items: center;
								height: 100vh;
								margin: 0;
							}
							.card {
								background: rgba(255, 255, 255, 0.03);
								border: 1px solid rgba(255, 255, 255, 0.06);
								padding: 40px;
								border-radius: 12px;
								text-align: center;
								max-width: 500px;
								box-shadow: 0 20px 50px rgba(0,0,0,0.5);
								backdrop-filter: blur(20px);
							}
							h1 { color: #ef4444; margin-top: 0; font-size: 24px; font-weight: 800; }
							p { line-height: 1.6; color: #94a3b8; font-size: 14px; }
							.badge {
								background: rgba(99, 102, 241, 0.15);
								border: 1px solid rgba(99, 102, 241, 0.3);
								color: #a5b4fc;
								padding: 8px 16px;
								border-radius: 4px;
								font-family: monospace;
								font-size: 15px;
								font-weight: bold;
								display: inline-block;
								margin: 15px 0;
								user-select: all;
								cursor: pointer;
							}
							.step {
								text-align: left;
								background: rgba(0,0,0,0.2);
								padding: 15px;
								border-radius: 6px;
								margin-top: 20px;
								font-size: 13px;
								color: #cbd5e1;
							}
							.step code { color: #818cf8; font-family: monospace; }
						</style>
					</head>
					<body>
						<div class="card">
							<i class="fa fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 15px;"></i>
							<h1>관리자 권한이 없습니다</h1>
							<p>성공적으로 로그인되었으나, 귀하의 계정은 최고 관리자 명단에 등록되어 있지 않습니다.</p>
							<p>대시보드에 접근하려면 아래 고유 ID를 더블클릭하여 복사한 후 서버 설정에 추가해 주세요.</p>
							<div class="badge" title="더블클릭하여 복사">${req.session.profile.id}</div>
							<div class="step">
								<strong>[등록 방법]</strong><br>
								1. 끄투 서버 폴더 내 <code>Server/lib/sub/global.json</code> 파일을 엽니다.<br>
								2. <code>"ADMIN"</code> 배열 안에 위 파란색 ID를 추가합니다.<br>
								3. 저장 후 끄투 서버를 <strong>재시작</strong>해 주세요.
							</div>
						</div>
					</body>
					</html>
				`);
				return false;
			}
			return res.send({ error: 400 }), false;
		}else{
			req.session.admin = false;
			if (req.path === '/gwalli') {
				return res.redirect('/login'), false;
			}
			return res.send({ error: 400 }), false;
		}
	}
	return true;
}
function parseKKuTuHot(){
	var R = new Lizard.Tail();
		
	Lizard.all([
		query(`SELECT * FROM kkutu_ko WHERE hit > 0 ORDER BY hit DESC LIMIT 50`),
		query(`SELECT * FROM kkutu_ko WHERE _id ~ '^...$' AND hit > 0 ORDER BY hit DESC LIMIT 50`),
		query(`SELECT * FROM kkutu_ko WHERE type = 'INJEONG' AND hit > 0 ORDER BY hit DESC LIMIT 50`),
		query(`SELECT * FROM kkutu_en WHERE hit > 0 ORDER BY hit DESC LIMIT 50`)
	]).then(function($docs){
		R.go($docs);
	});
	function query(q){
		var R = new Lizard.Tail();
		
		MainDB.kkutu['ko'].direct(q, function(err, $docs){
			if(err) return JLog.error(err.toString());
			R.go($docs.rows);
		});
		return R;
	}
	return R;
}