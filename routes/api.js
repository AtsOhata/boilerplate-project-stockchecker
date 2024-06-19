'use strict';
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();


app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://dbuser2:uuuth@cluster0.uk2xzib.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const likeSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  ip: { type: String, required: true },
});

const Like = mongoose.model('Like', likeSchema);

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const symbol = Array.isArray(req.query.stock) ? req.query.stock : [req.query.stock];
      const symbolLength = symbol.length;
      const like = req.query.like;
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      if (!symbol) {
        return res.send({ error: 'Symbol is required' });
      }
      try {
        if (like) {
          let hashedIp = "";
          if (ip.length > 9) {
            hashedIp = ip.slice(0, -3) + "000";
          } else {
            // 自環境アクセス時にはIPが::1になる
            hashedIp = "::000"
          }
          for (let i = 0; i < symbolLength; i++) {
            const existingLike = await Like.find({ symbol: symbol[i], ip: hashedIp });
            const newLike = new Like({ symbol: symbol[i], ip: hashedIp });
            const savedLike = await newLike.save();
          }
        }
        if (symbolLength == 1) {
          const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol[0]}/quote`);
          const likeCount = await Like.countDocuments({ symbol: symbol[0] });
          let stockData = {
            stock: response.data.symbol,
            price: response.data.latestPrice,
            likes: likeCount
          }
          res.send({
            stockData: stockData
          });
        } else {
          const response1 = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol[0]}/quote`);
          const response2 = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol[1]}/quote`);
          const likeCount1 = await Like.countDocuments({ symbol: symbol[0] });
          const likeCount2 = await Like.countDocuments({ symbol: symbol[1] });
          let stockData = [
            {
              stock: response1.data.symbol,
              price: response1.data.latestPrice,
              rel_likes : likeCount1 - likeCount2
            },
            {
              stock: response2.data.symbol,
              price: response2.data.latestPrice,
              rel_likes : likeCount2 - likeCount1
            },
          ]
          res.send({
            stockData: stockData
          });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to fetch stock data' });
      }
    });

};
