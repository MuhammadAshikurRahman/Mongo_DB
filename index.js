const express = require('express'); // Express ফ্রেমওয়ার্ক ইমপোর্ট
const bodyParser = require('body-parser'); // body-parser ডেটা পার্স করার জন্য
const { MongoClient, ObjectId } = require('mongodb'); // MongoDB এর ক্লায়েন্ট এবং ObjectId ইমপোর্ট

// MongoDB URI এবং ক্লায়েন্ট সেটআপ
const uri = "mongodb+srv://mdashikurrahman50000:uel4Zcf5Rkj1DtU9@cluster0.dasvi.mongodb.net/VegitableShop?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Express অ্যাপ্লিকেশন সেটআপ
const app = express();
app.use(express.json()); // JSON ডেটা পার্স করার জন্য Middleware
app.use(bodyParser.urlencoded({ extended: true })); // ফর্ম ডেটা পার্স করার জন্য Middleware

// হোমপেজ রাউট
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // index.html ফাইল রিটার্ন করা
});

// MongoDB কানেকশন এবং Routes
async function start() {
    try {
        await client.connect(); // MongoDB কানেকশন শুরু
        console.log("Connected to MongoDB!");

        const productCollection = client.db("VegitableShop").collection("Product"); // Product কালেকশন সেটআপ

        // নতুন প্রোডাক্ট যোগ করার জন্য POST রুট
        app.post('/addProduct', async (req, res) => {
            const product = req.body; // ফর্ম থেকে প্রোডাক্ট ডেটা
            await productCollection.insertOne(product); // প্রোডাক্ট ডাটাবেসে সংরক্ষণ
            res.redirect('/'); // হোমপেজে রিডাইরেক্ট
        });

        // সমস্ত প্রোডাক্ট দেখানোর জন্য GET রুট
        app.get('/products', async (req, res) => {
            const products = await productCollection.find({}).toArray(); // সমস্ত প্রোডাক্ট রিট্রিভ
            res.json(products); // JSON ফরম্যাটে রেসপন্স
        });

        // প্রোডাক্ট মুছে ফেলার জন্য DELETE রুট
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id; // রিকোয়েস্ট থেকে প্রোডাক্টের ID
            const result = await productCollection.deleteOne({ _id: new ObjectId(id) }); // প্রোডাক্ট মুছে ফেলা
            res.send(result.deletedCount === 1 ? "Product deleted successfully" : "Product not found"); // ফলাফল
        });

        // প্রোডাক্ট আপডেট করার জন্য PUT রুট
        app.put('/updateProduct/:id', async (req, res) => {
            const id = req.params.id; // রিকোয়েস্ট থেকে প্রোডাক্টের ID
            const updatedProduct = req.body; // ফর্ম থেকে আপডেট ডেটা
            const result = await productCollection.updateOne(
                { _id: new ObjectId(id) }, // ID দিয়ে প্রোডাক্ট খোঁজা
                { $set: updatedProduct } // আপডেট ডেটা সেট
            );
            res.send(result.matchedCount === 1 ? "Product updated successfully" : "Product not found"); // ফলাফল
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error); // কোনো সমস্যা হলে লগ করা
    }
}

// সার্ভার চালু
app.listen(process.env.PORT || 1000, () => {
    console.log("Server running on port 1000");
    start(); // MongoDB কানেকশন এবং Routes শুরু
});
