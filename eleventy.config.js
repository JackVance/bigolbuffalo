module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addPassthroughCopy("src/genstyle.css");
  eleventyConfig.addPassthroughCopy("src/scripts.js");
  eleventyConfig.addPassthroughCopy("src/BuffaloPorn");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"],
  };
};
