'use strict';

const util = require('hexo-util');
const moment = require('moment');
const keywords = require('keyword-extractor');

const minify = str => util.stripHTML(str).trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
const getProps = ref => Object.getOwnPropertyNames(ref).filter(item => ref[item]);
const catags = item => {
  return {
    name: item.name,
    slug: item.slug,
    permalink: item.permalink
  }
}

let cfg = hexo.config.descco_pipeline.jsonContent || { meta: true };
let pages = cfg.hasOwnProperty('pages') ? cfg.pages : {
		raw: false,
		content: false,
		title: true,
		slug: true,
		date: true,
		updated: true,
		comments: true,
		path: true,
		link: true,
		permalink: true,
		excerpt: true,
		text: true,
		keywords: true
};

let posts = cfg.hasOwnProperty('posts') ? cfg.posts : {
		raw: false,
		content: false,
		title: true,
		slug: true,
		date: true,
		updated: true,
		comments: true,
		path: true,
		link: true,
		permalink: true,
		excerpt: true,
		text: true,
		categories: true,
		tags: true,
		keywords: true
};

let json = cfg.meta ? {
  meta: {
    title: hexo.config.title,
    subtitle: hexo.config.subtitle,
    description: hexo.config.description,
    author: hexo.config.author,
    url: hexo.config.url,
    root: hexo.config.root
  }
} : {};

let ignore = cfg.ignore ? cfg.ignore.map(item => item.toLowerCase()) : [];
let getKeywords = str => {
  return keywords.extract(str, {
    language: cfg.keywords,
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  }).join(' ')
}
let setContent = (obj, item, ref) => {
  switch (item) {
    case 'excerpt':
      obj.excerpt = minify(ref.excerpt)
      break

    case 'text':
      obj.text = minify(ref.content)
      break

    case 'keywords':
      if (cfg.keywords)
        obj.keywords = getKeywords(minify(ref.excerpt))
      break

    case 'categories':
      obj.categories = ref.categories.map(catags)
      break

    case 'tags':
      obj.tags = ref.tags.map(catags)
      break

    case 'date':
      obj.date = cfg.dateFormat ?
        moment(ref.date).format(cfg.dateFormat) :
        ref.date
      break

    case 'updated':
      obj.updated = cfg.dateFormat ?
        moment(ref.updated).format(cfg.dateFormat) :
        ref.updated
      break

    default:
      obj[item] = ref[item]
  }
  return obj
};

const jsonContent = site => {
	if (pages) {
		let pagesNames = getProps(pages),
			pagesContent = site.pages.filter(page => {
				let path = page.path.toLowerCase()
				return !ignore.find(item => path.includes(item))
			}).map(page => pagesNames.reduce((obj, item) => setContent(obj, item, page), {}))

		if (posts || cfg.meta)
			json.pages = pagesContent
		else
			json = pagesContent
	}

	if (posts) {
		let postsNames = getProps(posts),
			postsContent = site.posts.sort('-date').filter(post => {
				let path = post.path.toLowerCase()
				return post.published && !ignore.find(item => path.includes(item))
			}).map(post => postsNames.reduce((obj, item) => setContent(obj, item, post), {}))

		if (pages || cfg.meta)
			json.posts = postsContent
		else
			json = postsContent
	}

	return {
		path: 'content.json',
		data: JSON.stringify(json)
	}
}

module.exports = jsonContent;