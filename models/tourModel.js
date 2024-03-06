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
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                // GeoJSON
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: { virtuals: true }, // NOTE: FOR THE VIRTUAL PROPERTIES!
        toObject: { virtuals: true }, // NOTE: FOR THE VIRTUAL PROPERTIES!
    },
);

// define virtual property
// it wont be persisted in the DB, but it will be attached for every query
// NOTE: IMPORTANT! we cannot reference virtual properties in queries!
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// NOTE: VIRTUAL POPULATE
// virtual field for the child reference without persisting it in DB
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

// Document middleware
// NOTE: it runs before save() and create() BUT NOT before insertMany()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// NOTE: POPULATE extracts the referenced elements and instead of ids
// NOTE: the full object will be displayed
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });

    next();
});

// NOTE: using this, creating a new tour only requires the tour guides' ids,
// NOTE: and it will automatically copy the user object to this.guides.
// NOTE: IMPORTANT: using this, after every user update we would have to update this entity as well -> referencing is better
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(
//         async (id) => await User.findById(id),
//     );

//     this.guides = await Promise.all(guidesPromises);

//     next();
// });

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
