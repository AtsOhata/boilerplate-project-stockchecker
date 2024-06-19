const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
	test('Test 001: Viewing one stock', function (done) {
		chai
			.request(server)
			.keepOpen()
			.get('/api/stock-prices?stock=GOOG')
			.end(function (err, res) {
				assert.equal(res.body.stockData.stock, "GOOG");
				assert.equal(typeof res.body.stockData.price, "number");
				assert.equal(typeof res.body.stockData.likes, "number");
				done();
			});
	});
	test('Test 002: Viewing one stock and liking it', function (done) {
		chai
			.request(server)
			.keepOpen()
			.get('/api/stock-prices?stock=GOOG&like=true')
			.end(function (err, res) {
				assert.equal(res.body.stockData.stock, "GOOG");
				assert.equal(typeof res.body.stockData.price, "number");
				assert.equal(typeof res.body.stockData.likes, "number");
				done();
			});
	});
	test('Test 003: Viewing the same stock and liking it again', function (done) {
		chai
			.request(server)
			.keepOpen()
			.get('/api/stock-prices?stock=GOOG&like=true')
			.end(function (err, res) {
				assert.equal(res.body.stockData.stock, "GOOG");
				assert.equal(typeof res.body.stockData.price, "number");
				assert.equal(typeof res.body.stockData.likes, "number");
				done();
			});
	});
	test('Test 004: Viewing two stocks', function (done) {
		chai
			.request(server)
			.keepOpen()
			.get('/api/stock-prices?stock=GOOG&stock=MSFT')
			.end(function (err, res) {
				assert.equal(res.body.stockData[0].stock, "GOOG");
				assert.equal(typeof res.body.stockData[0].price, "number");
				assert.equal(typeof res.body.stockData[0].rel_likes, "number");
				assert.equal(res.body.stockData[1].stock, "MSFT");
				assert.equal(typeof res.body.stockData[1].price, "number");
				assert.equal(typeof res.body.stockData[1].rel_likes, "number");
				done();
			});
	});
	test('Test 005: Viewing two stocks and liking them', function (done) {
		chai
			.request(server)
			.keepOpen()
			.get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
			.end(function (err, res) {
				assert.equal(res.body.stockData[0].stock, "GOOG");
				assert.equal(typeof res.body.stockData[0].price, "number");
				assert.equal(typeof res.body.stockData[0].rel_likes, "number");
				assert.equal(res.body.stockData[1].stock, "MSFT");
				assert.equal(typeof res.body.stockData[1].price, "number");
				assert.equal(typeof res.body.stockData[1].rel_likes, "number");
				done();
			});
	});
});
