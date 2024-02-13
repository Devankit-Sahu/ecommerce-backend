class Features {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const key = this.queryStr.key;
    const keywords = key.split(" ").filter((keyword) => keyword.trim() !== "");
    const maxPrice = keywords.filter((price) => !isNaN(Number(price)));
    const keywordRegex = keywords.map((keyword) => new RegExp(keyword, "i"));
    const searchPipeline = [];
    // if there is price in the query
    if (maxPrice.length > 0) {
      searchPipeline.push({
        $match: {
          $and: [
            { name: { $in: keywordRegex } },
            { category: { $in: keywordRegex } },
            { price: { $gte: 0, $lte: Math.max(...maxPrice.map(Number)) } },
          ],
        },
      });
    } else {
      searchPipeline.push({
        $match: {
          $or: [
            { name: { $in: keywordRegex } },
            { category: { $in: keywordRegex } },
          ],
        },
      });
    }
    searchPipeline.push({
      $lookup: {
        from: "productreviews",
        localField: "_id",
        foreignField: "productId",
        as: "productReviews",
      },
    });
    this.query = this.query.aggregate(searchPipeline);
    return this;
  }

  filter() {
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

    filterPipeline.push({
      $lookup: {
        from: "productreviews",
        localField: "_id",
        foreignField: "productId",
        as: "productReviews",
      },
    });
    this.query = this.query.aggregate(filterPipeline);
    return this;
  }

  pagination(productPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    console.log(currentPage);
    const skipPages = productPerPage * (currentPage - 1);
    this.query = this.query.skip(skipPages).limit(productPerPage);
    return this;
  }
}

module.exports = Features;
