import config from 'config';
import mongoose from 'mongoose';

const mongoUrl = config.get('mongoUrl');

async function connectDB() {
    try {
        const connection = await mongoose.connect(mongoUrl);
        console.log('Mongoose connection successful');
        return connection;
    } catch (err) {
        console.error('Connection error', err);
        process.exit(1);
    }
}

export default connectDB;
