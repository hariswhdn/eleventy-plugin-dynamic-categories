const slugify = require('slugify')
let _ = require('lodash')
const getCategoryKeys = require('./src/getCategoryKeys.js')

/*
List all options from this plugin
categoryVar
categoryCollection
perPageCount
itemsCollection

*/

module.exports = function (
  eleventyConfig,
  options = {
    categoryVar: 'categories',
    itemCollection: 'posts',
  }
) {
  const categoryCollection = options.categoryCollection || options.categoryVar
  const perPageCount = options.perPageCount || 5

  // Creates the collection
  eleventyConfig.addCollection(categoryCollection, function (collections) {
    const posts = collections.getFilteredByTag(options.itemsCollection)
    let tagArray = getCategoryKeys(posts, options)

    const categoriesWithPosts = tagArray.map((category) => {
      //   collection.filter((article) => {
      //     const hasCategory = article.data.categories && article.data.categories.includes(category);
      //     const isUncategorized =
      //       (!article.data.categories || article.data.categories.length === 0) &&
      //       category === "Uncategorized";
      //     return hasCategory || isUncategorized;
      //   })

      let filteredPosts = posts
        .filter((post) => {
          // if (!post.data[categoryCollection]) return false
          // return post.data[categoryCollection].includes(category)}).flat();
          const hasCategory = post.data[categoryCollection] && post.data[categoryCollection].includes(category)
          const isUncategorized =
            (!post.data[categoryCollection] || post.data[categoryCollection].length === 0) &&
            category === 'Uncategorized'
          return hasCategory || isUncategorized
        })
        .flat()
      // console.log(slugify(category))
      return {
        title: category,
        slug: slugify(category),
        posts: [...filteredPosts],
      }
    })
    // console.log(`\x1b[32m[Dynamic Categories] Created Collection ${categoryCollection} with ${categoriesWithPosts.length} items`, '\x1b[0m')
    return categoriesWithPosts
  })

  eleventyConfig.addCollection(`${categoryCollection}ByPage`, function (collection) {
    // Get unique list of all tags currently in use
    const posts = collection.getFilteredByTag(options.itemsCollection)

    // Get each item that matches the tag and add it to the tag's array, chunked by paginationSize
    let paginationSize = perPageCount
    let tagMap = []
    let tagArray = getCategoryKeys(posts, options)

    for (let tagName of tagArray) {
      const filteredPosts = posts
        .filter((post) => {
          // if (!post.data[categoryCollection]) return false
          // return post.data[categoryCollection].includes(tagName)}).flat();
          const hasCategory = post.data[categoryCollection] && post.data[categoryCollection].includes(tagName)
          const isUncategorized =
            (!post.data[categoryCollection] || post.data[categoryCollection].length === 0) &&
            tagName === 'Uncategorized'
          return hasCategory || isUncategorized
        })
        .flat()
      let tagItems = filteredPosts.reverse()
      let pagedItems = _.chunk(tagItems, paginationSize)
      const totalPages = Math.ceil(filteredPosts.length / perPageCount)
      for (let pageNumber = 0, max = pagedItems.length; pageNumber < max; pageNumber++) {
        const currentNumber = pageNumber + 1
        const slug = slugify(tagName)
        tagMap.push({
          slug,
          title: tagName,
          totalPages,
          posts: pagedItems[pageNumber],
          permalinkScheme: `${slug}${currentNumber > 1 ? `/${currentNumber}` : ''}/index.html`,
          pages: {
            current: currentNumber,
            next: currentNumber != totalPages && currentNumber + 1,
            previous: currentNumber > 1 && currentNumber - 1,
          },
        })
      }
    }
    // Return a two-dimensional array of items, chunked by paginationSize
    return tagMap
  })

  eleventyConfig.addShortcode('pagination', function (page) {
    const {pages, totalPages} = page
    const {current, next, previous} = pages
    const nextHref = next
      ? `<a class="py-1 px-2 border rounded whitespace-nowrap" href="${current != 1 ? '../' : ''}${next}">Next</a>`
      : '<span class="py-1 px-2 border rounded whitespace-nowrap opacity-50">Next</span>'
    const previousHref = previous
      ? `<a class="py-1 px-2 border rounded whitespace-nowrap" href="../${previous == 1 ? '' : previous}">Prev</a>`
      : '<span class="py-1 px-2 border rounded whitespace-nowrap opacity-50">Prev</span>'
    const markup = `<nav class="px-6 py-2.5 flex items-center justify-between gap-x-2"><div class="flex gap-x-2">${previousHref}</div><span>Page ${current} of ${totalPages}</span><div class="flex gap-x-2">${nextHref}</div></nav>`
    return markup
  })
}
