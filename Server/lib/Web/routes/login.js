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

const MainDB	 = require("../db");
const JLog	 = require("../../sub/jjlog");
// const Ajae	 = require("../../sub/ajaejs").checkAjae;
const passport = require('passport');
const glob = require('glob-promise');
const GLOBAL	 = require("../../sub/global.json");
const config = require('../../sub/auth.json');
const path = require('path')

function process(req, accessToken, MainDB, $p, done) {
    $p.token = accessToken;
    $p.sid = req.session.id;

    let now = Date.now();
    req.session.admin = GLOBAL.ADMIN.includes($p.id);
    req.session.authType = $p.authType;

    MainDB.users.findOne([ '_id', $p.id ]).on(($body) => {
        if ($body) {
            if ($body.title) {
                $p.title = $body.title;
                $p.name = $body.title;
            } else {
                MainDB.users.update([ '_id', $p.id ]).set([ 'title', $p.title ]).on();
            }
        } else {
            MainDB.users.update([ '_id', $p.id ]).set([ 'title', $p.title ]).on();
        }

        req.session.profile = $p;
        MainDB.users.update([ '_id', $p.id ]).set([ 'lastLogin', now ]).on();

        console.log(`\n======================================================`);
        console.log(`[LOGIN SUCCESS] User: ${$p.title} | Discord ID: ${$p.id}`);
        console.log(`To make this user an ADMIN, copy-paste '${$p.id}' into`);
        console.log(`GLOBAL.ADMIN inside Server/lib/sub/global.json.`);
        console.log(`======================================================\n`);
        JLog.success(`[LOGIN SUCCESS] User: ${$p.title} | Discord ID: ${$p.id}`);

        MainDB.session.upsert([ '_id', req.session.id ]).set({
            'profile': $p,
            'createdAt': now
        }).on(() => {
            req.session.save((err) => {
                done(null, $p);
            });
        });
    });
}

exports.run = (Server, page) => {
    //passport configure
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    const strategyList = {};
    
	for (let i in config) {
		try {
			let auth = require(path.resolve(__dirname, '..', 'auth', 'auth_' + i + '.js'))
			Server.get('/login/' + auth.config.vendor, passport.authenticate(auth.config.vendor))
			Server.get('/login/' + auth.config.vendor + '/callback', passport.authenticate(auth.config.vendor, {
				successRedirect: '/',
				failureRedirect: '/loginfail'
			}))
			passport.use(new auth.config.strategy(auth.strategyConfig, auth.strategy(process, MainDB /*, Ajae */)));
			strategyList[auth.config.vendor] = {
				vendor: auth.config.vendor,
				displayName: auth.config.displayName,
				color: auth.config.color,
				fontColor: auth.config.fontColor
			};

			JLog.info(`OAuth Strategy ${i} loaded successfully.`)
		} catch (error) {
			JLog.error(`OAuth Strategy ${i} is not loaded`)
			JLog.error(error.message)
		}
	}
	
	Server.get("/login", (req, res) => {
		var ip = req.ip || req.connection.remoteAddress;
		var isLocal = (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'localhost');
		if(global.isPublic && !isLocal){
			page(req, res, "login", { '_id': req.session.id, 'text': req.query.desc, 'loginList': strategyList});
		}else{
			let now = Date.now();
			let id = req.query.id || "ADMIN";
			MainDB.users.findOne([ '_id', id ]).on(($body) => {
				let title = ($body && $body.title) ? $body.title : ("LOCAL #" + id);
				if ($body && !$body.title) {
					MainDB.users.update([ '_id', id ]).set([ 'title', title ]).on();
				}
				let lp = {
					id: id,
					title: title,
					name: title,
					token: "LOCAL_DEV_TOKEN",
					birth: [ 4, 16, 0 ],
					_age: { min: 20, max: undefined }
				};
				MainDB.session.upsert([ '_id', req.session.id ]).set([ 'profile', JSON.stringify(lp) ], [ 'createdAt', now ]).on(function($res){
					MainDB.users.update([ '_id', id ]).set([ 'lastLogin', now ]).on();
					req.session.admin = true;
					req.session.profile = lp;
					req.session.save(function(err){
						res.redirect("/");
					});
				});
			});
		}
	});

	Server.get("/logout", (req, res) => {
		if(!req.session.profile){
			return res.redirect("/");
		} else {
			req.session.destroy();
			res.redirect('/');
		}
	});

	Server.get("/loginfail", (req, res) => {
		page(req, res, "loginfail");
	});
}