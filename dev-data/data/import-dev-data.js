const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './.env' });

const DB_STRING = process.env.DB_CONNECTION_STRING.replace(
    '<PASSWORD>',
    process.env.DB_PASSWORD,
);

mongoose
    .connect(DB_STRING, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
    })
    .then(() => console.log('DB connection succesfull!'));

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// Import data to database
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data imported!');
    } catch (error) {
        console.log(error);
    }
};

// Delete data from db
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data deleted!');
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
