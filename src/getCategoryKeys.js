module.exports = function (posts, options = {}) {
  const tagSet = new Set(posts.flatMap((post) => post.data[options.categoryVar] || []))
  const hasUncategorizedPosts = posts.some((post) => {
    const categories = post.data[options.categoryVar]
    return !Array.isArray(categories) || categories.length === 0
  })
  const categories = [...tagSet]
  if (hasUncategorizedPosts) {
    categories.push('Uncategorized')
  }
  return categories
}
