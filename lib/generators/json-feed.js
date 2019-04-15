'use strict';

const util = require('hexo-util');

function run(site) {
  const hexo = this;
  var cfg = hexo.config.hasOwnProperty('jsonFeed') ? hexo.config.jsonFeed : {};

  var minify = function(str) {
    return util.stripHTML(str).trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
  };

  var posts = site.posts.sort('-date').filter(function(post) {
    return post.published;
  }).slice(0, cfg.limit || 25).map(function(post) {
    return {
      title: post.title,
      link: post.permalink,
      description: post.excerpt ? minify(post.excerpt) : minify(post.content),
      pubDate: post.date.toDate().toUTCString(),
      guid: post.permalink,
      category: post.categories.length ? post.categories.map(function(cat) {
        return cat.name;
      }).join(',') : post.tags.map(function(tag) {
        return tag.name;
      }).join(',')
    };
  });

  var build = new Date().toUTCString();

  var rss = {
    title: hexo.config.title,
    description: hexo.config.description,
    language: hexo.config.language,
    link: hexo.config.url,
    pubDate: posts.length ? posts[0].pubDate : build,
    lastBuildDate: build,
    webMaster: hexo.config.author,
    items: posts
  };

  return {
    path: 'content.json',
    data: JSON.stringify(rss)
  };
}

module.exports = run;
