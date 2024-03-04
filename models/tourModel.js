const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            maxlength: [150, 'Tour name is too long (max 150 characters)'],
            minlength: [5, 'Tour name is too short (min 5 characters)'],
        },
        slug: {
            type: String,
            unique: true,
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Valid enum values: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Ratings average cannot be lower than 1.0'],
            max: [5, 'Ratings average cannot be higher than 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 4.5,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    return val < this.price;
                },
                message: 'Price discount cannot be higher than price',
            },
        },
        summary: {
            type: String,
            trim: true, // NOTE: removes whitespaces from beginning and end
            required: [true, 'A tour must have a summary'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        image: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true }, // NOTE: FOR THE VIRTUAL PROPERTIES!
        toObject: { virtuals: true }, // NOTE: FOR THE VIRTUAL PROPERTIES!
    },
);

// define virtual property
// it wont be persisted in the DB, but it will be attached for every query
// NOTE: IMPORTANT! we cannot reference virtual properties in queries!
// NOTE: IMPORTANT! To use this property it cannot be an arrow function!
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Document middleware
// NOTE: it runs before save() and create() BUT NOT before insertMany()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Post middleware
// NOTE: it runs AFTER save() and create()
tourSchema.post('save', (doc, next) => {
    next();
});

// Query middleware
// regex for every find like functions (find, findById, findOne...)
// NOTE: it runs BEFORE every given query
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

// Aggregation middleware
// NOTE: this.pipeline() shows the aggregation
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
