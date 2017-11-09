'use strict';

const filters = require('./lib/filters');
const renderer = require('./lib/renderer');
const generators = require('./lib/generators');
const tags = require('./lib/tags');
const revision = require('./lib/revision');
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
  
    config.descco_pipeline.html_minifier = Object.assign(htmlMinifierDefaults, htmlConfig, config.asset_pipeline.html_minifier || {});
  
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
  
    config.descco_pipeline.imagemin = Object.assign(imageminDefaults, imageConfig, config.asset_pipeline.imagemin || {});
  
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
     * JsonContent config.
     */
    hexo.extend.generator.register('json-content', generators.jsonContent);

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