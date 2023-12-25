class Features {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const key = this.queryStr.key;
    if (key && key !== "") {
      const keywords = key.split("").filter((keyword) => keyword.trim() !== "");
      const keywordRegex = keywords.map((keyword) => new RegExp(keyword, "i"));
      this.query = this.query.find({
        $or: [
          { name: { $in: keywordRegex } },
          { category: { $in: keywordRegex } },
        ],
      });
    } else {
      this.query = this.query.find();
    }
    return this;
  }

  filter() {
    const qureycopy = { ...this.queryStr };
    const removeFields = ["key", "page", "limit"];
    removeFields.forEach((k) => delete qureycopy[k]);
    let queryStr = JSON.stringify(qureycopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (i) => `$${i}`);
    this.query = this.query.find(JSON.parse(queryStr));
    if (JSON.parse(queryStr).category) {
      const categoryArray = JSON.parse(queryStr).category.split(",");
      this.query = this.query.find({
        category: { $in: categoryArray },
      });
    }
    return this;
  }

  pagination(productPerPage) {
    const currPage = Number(this.queryStr.page) || 1;

    const skipPages = productPerPage * (currPage - 1);

    this.query = this.query.limit(productPerPage).skip(skipPages);

    return this;
  }
}

module.exports = Features;
