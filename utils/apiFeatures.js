class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1) FILTERING
        // NOTE: it copies the req.query
        // NOTE: making them equal would create a reference to the req.query, so updating queryObj would update req.query as well
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'limit', 'sort', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // NOTE: operators (such as greater than) should look like this in the url:
        // NOTE: {{HOST_NAME}}/api/v1/tours?page[gte]=2&...
        // it will look like this: { price: { gte: '200' }, ... }
        // we need dollar signs before operators: { price: { $gte: '200' }, ... }
        // NOTE: here, we put dollar signs before operators using regex
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`,
        );

        this.query = this.query.find(JSON.parse(queryString));
        // let query = Tour.find(JSON.parse(queryString));

        return this;
    }

    sort() {
        // criterias separated with comma (,) in sorting order
        // NOTE: example: {{HOST_NAME}}/api/v1/tours?sort=price,ratingsAverage
        if (this.queryString.sort) {
            // NOTE: replace ',' with ' ' in sorting
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // default sort
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limit() {
        // NOTE: example: {{HOST_NAME}}/api/v1/tours?fields=price,ratingsAverage
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // NOTE: BEST PRACTICE => default: exclude __v
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        // NOTE: example: {{HOST_NAME}}/api/v1/tours?page=2&limit=3
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        // NOTE: how many objects have to be skipped (previous pages * limit)
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
