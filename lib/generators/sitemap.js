'use strict';

var minimatch = require('minimatch');
var pathFn = require('path');
var fs = require('fs');
var sitemapTmpl;

function template(config) {
  if (sitemapTmpl) return sitemapTmpl;

  var nunjucks = require('nunjucks');
  var env = new nunjucks.Environment(null, {
    autoescape: false,
    watch: false
  });

  env.addFilter('uriencode', function(str) {
    return encodeURI(str);
  });

  var sitemapSrc = config.sitemap.template || pathFn.join(__dirname, './sitemap/sitemap.xml');
  sitemapTmpl = nunjucks.compile(fs.readFileSync(sitemapSrc, 'utf8'), env);

  return sitemapTmpl;
}

module.exports = function(locals) {
  var config = this.config;
  var skipRenderList = [
    '**/*.js',
    '**/*.css'
  ];

  if (Array.isArray(config.skip_render)) {
    skipRenderList = skipRenderList.concat(config.skip_render);
  } else if (config.skip_render != null) {
    skipRenderList.push(config.skip_render);
  }

  var posts = [].concat(locals.posts.toArray(), locals.pages.toArray())
    .filter(function(post) {
      return post.sitemap !== false && !isMatch(post.source, skipRenderList);
    })
    .sort(function(a, b) {
      return b.updated - a.updated;
    });

  var xml = template(config).render({
    config: config,
    posts: posts
  });

  return {
    path: config.sitemap.path,
    data: xml
  };
};

function isMatch(path, patterns) {
  if (!patterns) return false;
  if (!Array.isArray(patterns)) patterns = [patterns];
  if (!patterns.length) return false;

  for (var i = 0, len = patterns.length; i < len; i++) {
    if (minimatch(path, patterns[i])) return true;
  }

  return false;
}
