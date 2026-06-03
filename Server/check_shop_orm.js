const DB = require('./lib/Web/db');
const JLog = require('./lib/sub/jjlog');

DB.ready = function() {
	console.log("DB is ready in ORM!");
	DB.kkutu_shop.find().limit([ 'cost', true ], [ 'term', true ], [ 'group', true ], [ 'options', true ], [ 'updatedAt', true ]).on(function($goods){
		console.log(`ORM returned ${$goods.length} items from kkutu_shop.`);
		const purchasable = $goods.filter(g => g.cost >= 0);
		console.log(`Purchasable: ${purchasable.length}`);
		console.log("First 5 purchasable:");
		console.log(purchasable.slice(0, 5));
		console.log("Last 5 purchasable:");
		console.log(purchasable.slice(-5));
		process.exit(0);
	});
};
