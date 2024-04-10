class Features {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  async search() {
    const key = this.queryStr.key;
    const keywords = key.split(" ").filter((keyword) => keyword.trim() !== "");
    const keywordRegex = keywords.map((keyword) => new RegExp(keyword, "i"));
    this.query = this.query.aggregate([
      {
        $match: {
          $or: [
            { name: { $in: keywordRegex } },
            { category: { $in: keywordRegex } },
          ],
        },
      },
    ]);
  }

  async filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ["key", "page", "limit"];
    removeFields.forEach((k) => delete queryCopy[k]);
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (i) => `$${i}`);
    const queryJSON = JSON.parse(queryStr);
    let filterPipeline = [];
    if (queryJSON.category) {
      const categoryArray = queryJSON.category.split(",");
      filterPipeline.push({ $match: { category: { $in: categoryArray } } });
    }

    if (queryJSON.price) {
      const { $gte, $lte } = queryJSON.price;
      const priceFilter = {
        $gte: parseFloat($gte),
        $lte: parseFloat($lte),
      };
      filterPipeline.push({ $match: { price: priceFilter } });
    }
    this.query = this.query.aggregate(filterPipeline);
  }

  async pagination(productPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skipPages = productPerPage * (currentPage - 1);
    this.query = this.query.skip(skipPages).limit(productPerPage);
  }
}

export default Features;
