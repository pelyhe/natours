const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB_STRING = process.env.DB_CONNECTION_STRING.replace(
    '<PASSWORD>',
    process.env.DB_PASSWORD,
);

mongoose
    .connect(DB_STRING, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB connection successful!'));

const app = require('./app');

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
    console.log(`Server running on ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
