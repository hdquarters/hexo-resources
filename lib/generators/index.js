'use strict';

const jsonFeed = require('./json-feed');
const sitemap = require('./sitemap');
const search = require('./search');
const index = require('./index-generator');
const category = require('./category');
const feed = require('./feed');

module.exports = {
  jsonFeed,
  sitemap,
  search,
  index,
  category,
  feed
};
