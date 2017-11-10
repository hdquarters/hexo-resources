'use strict';

const filters = require('./lib/filters');
const renderer = require('./lib/renderer');
const generators = require('./lib/generators');
const tags = require('./lib/tags');
const revision = require('./lib/revision');
const assign = require('object-assign');
const pathFn = require('path');
const merge = require('utils-merge');
const config = hexo.config;

/**
 * hexo.config.descco_pipeline is defined in _config.yml.
 */

if(config.descco_pipeline){
    /**
     * HTML config.
     */
    const htmlMinifierDefaults = {
      ignoreCustomComments: [/^\s*more/],
      removeComments: true,
      removeCommentsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeEmptyAttributes: true,
      minifyJS: true,
      minifyCSS: true
    };
    const htmlConfig = {
      exclude: []
    }
  
    config.descco_pipeline.html_minifier = Object.assign(htmlMinifierDefaults, htmlConfig, config.descco_pipeline.html_minifier || {});
  
    hexo.extend.filter.register('after_render:html', filters.html);
  
    /**
     * Image config.
     */
    const imageminDefaults = {
      interlaced: false,
      multipass: false,
      optimizationLevel: 3,
      pngquant: false,
      progressive: false
    }
    const imageConfig = {};
  
    config.descco_pipeline.imagemin = Object.assign(imageminDefaults, imageConfig, config.descco_pipeline.imagemin || {});
    hexo.extend.filter.register('after_generate', filters.image);
  
    /**
     * Sass config.
     */
    hexo.extend.renderer.register('scss', 'css', renderer.sass);
    hexo.extend.renderer.register('sass', 'css', renderer.sass);

    /**
     * Webpack config.
     */
    hexo.extend.renderer.register('js', 'js', renderer.webpack);

    /**
     * Codepen config.
     */
    hexo.extend.tag.register('codepen', tags.codepen);

    /**
     * jsonFeed config.
     */
    const jsonFeedDefaults = {};
    const jsonFeedConfig = {};

    config.descco_pipeline.jsonFeed = Object.assign(jsonFeedDefaults, jsonFeedConfig, config.descco_pipeline.jsonFeed || {});

    hexo.extend.generator.register('json-feed', generators.jsonFeed);

    /**
     * ejs config.
     */
    hexo.extend.renderer.register('ejs', 'html', renderer.ejs, true);

    /**
     * Marked config.
     */
    hexo.config.marked = assign({
      gfm: true,
      pedantic: false,
      sanitize: false,
      tables: true,
      breaks: true,
      smartLists: true,
      smartypants: true,
      modifyAnchors: '',
      autolink: true
    }, hexo.config.descco_pipeline.marked);
    
    hexo.extend.renderer.register('md', 'html', renderer.marked, true);
    hexo.extend.renderer.register('markdown', 'html', renderer.marked, true);
    hexo.extend.renderer.register('mkd', 'html', renderer.marked, true);
    hexo.extend.renderer.register('mkdn', 'html', renderer.marked, true);
    hexo.extend.renderer.register('mdwn', 'html', renderer.marked, true);
    hexo.extend.renderer.register('mdtxt', 'html', renderer.marked, true);
    hexo.extend.renderer.register('mdtext', 'html', renderer.marked, true);

    /**
     * Sitemap config.
     */
    var configSitemap = hexo.config.sitemap = assign({
      path: 'sitemap.xml'
    }, hexo.config.descco_pipeline.sitemap);
    
    if (!pathFn.extname(configSitemap.path)) {
      configSitemap.path += '.xml';
    }
    
    hexo.extend.generator.register('sitemap', generators.sitemap);

    /**
     * Search config.
     */
    var configSearch = hexo.config.search = merge({
      path: 'search.json',
      field: 'post'
    }, hexo.config.descco_pipeline.search);
    
    // Set default search path
    if (!configSearch.path){
      configSearch.path = 'search.json';
    }
    
    // Add extension name if don't have
    // if (!pathFn.extname(configSearch.path)){
    //   configSearch.path += '.xml';
    // }
    
    // if (pathFn.extname(configSearch.path)=='.xml') {
    //   hexo.extend.generator.register('xml', generators.search.xml);
    // }
    
    if (pathFn.extname(configSearch.path)=='.json') {
      hexo.extend.generator.register('json', generators.search.json);
    }

    /**
     * Feed config.
     */
    var configFeed = hexo.config.feed = assign({
      type: 'atom',
      limit: 20,
      hub: '',
      content: true,
      content_limit: 140,
      content_limit_delim: ''
    }, hexo.config.descco_pipeline.feed);
    
    var type = configFeed.type.toLowerCase();
    
    // Check feed type
    if (type !== 'atom' && type !== 'rss2') {
      configFeed.type = 'atom';
    } else {
      configFeed.type = type;
    }
    
    // Set default feed path
    if (!configFeed.path) {
      configFeed.path = configFeed.type + '.xml';
    }
    
    // Add extension name if don't have
    if (!pathFn.extname(configFeed.path)) {
      configFeed.path += '.xml';
    }
    
    hexo.extend.generator.register('feed', generators.feed);

    /**
     * Index config.
     */
    hexo.config.index_generator = assign({
      per_page: typeof hexo.config.per_page === 'undefined' ? 10 : hexo.config.per_page,
      order_by: '-date'
    }, hexo.config.index_generator);
    
    hexo.extend.generator.register('index', generators.index);

    /**
     * Category config.
     */
    hexo.config.category_generator = assign({
      per_page: typeof hexo.config.per_page === 'undefined' ? 10 : hexo.config.per_page
    }, hexo.config.category_generator);
    
    hexo.extend.generator.register('category', generators.category);

    /**
     * Hook to enable revisioning.
     */
    const revisioningDefaults = {
      exclude: []
    };
    const soupConfig = {
      selectors: {
        'img[data-src]': 'data-src',
        'img[src]': 'src',
        'link[rel="apple-touch-icon"]': 'href',
        'link[rel="icon"]': 'href',
        'link[rel="shortcut icon"]': 'href',
        'link[rel="stylesheet"]': 'href',
        'script[src]': 'src',
        'source[src]': 'src',
        'video[poster]': 'poster'
      }
    };
  
    config.descco_pipeline.revisioning= Object.assign(revisioningDefaults, soupConfig, config.descco_pipeline.revisioning || {});
  
    if(config.descco_pipeline.revisioning.enable){
      hexo.extend.filter.register('after_generate', revision);
    }
  
    hexo.extend.filter.register('after_init', function(){
      // Setup desccoPipeline for caching data
      hexo.desccoPipeline = {
        revIndex: {}
      }
    });
  }
  