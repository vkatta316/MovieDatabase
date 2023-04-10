const { info } = require('console');
const { MongoClient, ObjectId } = require('mongodb');

const url = process.env.MONGO_DB_URL
const client = new MongoClient(url);

async function run() {
    await client.connect()
    return 'Connected to MongoDB server...';
}

run()
    .then(console.log)
    .catch(console.error);