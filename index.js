import express from 'express'
import cors from 'cors'
import {MongoClient, ObjectId, ServerApiVersion} from 'mongodb'
import 'dotenv/config'


const app = express()
const port = process.env.PORT || 5000


//handle cors policy
app.use(cors())

// work done as middle ware body parser
app.use(express.json())


//handle mongodb

const client = new MongoClient(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
})

async function run() {
    try {
        await client.connect()
        console.log('connect success to MongoDB')

        const database = await client.db('onlineShop')
        const productCollection = database.collection('products')
        const orderCollection = database.collection('orders')

        // get api

        app.get('/products', async (req, res) => {
            // get all data from collection
            const cursor = productCollection.find({})
            // get the page
            const {page, Size} = req.query

            //convert string to number
            let pageNumber = Number(page)
            let pageSize = Number(Size)

            let products
            if (pageNumber) {
                // convert the  limited data to array  products
                products = await cursor.skip(pageNumber * pageSize).limit(pageSize).toArray()
            } else {
                // convert the data to array  products
                products = await cursor.toArray()
            }

            // count how may product has in the db
            const count = await productCollection.countDocuments()
            // send to ui
            res.send({products, count})
        })

        // use post to get data by keys
        app.post('/products/byKeys', async (req, res) => {
            const keys = req.body
            //  the key in db from user order
            const query = {key: {$in: keys}}
            const item = await productCollection.find(query).toArray()
            res.json(item)
        })

        // order api
        app.post('/orders', async (req, res) => {
            const order = req.body
          //  console.table(order)
            //inset order into db
            const result = await orderCollection.insertOne(order)
            res.json(result)
        })

    } finally {

    }
}

run().catch(console.dir)


// make a simple get request
app.get('/', (req, res) => {
    res.send('simple curd server')
})

//run the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})