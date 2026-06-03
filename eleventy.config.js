module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  eleventyConfig.addPassthroughCopy("src/genstyle.css");
  eleventyConfig.addPassthroughCopy("src/Buy-Son-Source.txt");
  eleventyConfig.addPassthroughCopy("src/BuffaloPorn");

  // Bark machine assets live under src/BuffaloBarkMachine/ but ship to root
  // so existing URLs (/scripts.js) keep working without inbound-link changes.
  eleventyConfig.addPassthroughCopy({ "src/BuffaloBarkMachine/scripts.js": "scripts.js" });

  // The bark machine directory's README.md and backend/ are bundled with the
  // component for portability but aren't web assets — exclude from the build.
  eleventyConfig.ignores.add("src/BuffaloBarkMachine/README.md");
  eleventyConfig.ignores.add("src/BuffaloBarkMachine/backend");

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
