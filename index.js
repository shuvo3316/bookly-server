
const express=require('express')
const cors =require('cors')
const jwt =require('jsonwebtoken')
var cookieParser = require('cookie-parser')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app=express();
const port =process.env.PORT ||5000


//middlewere
app.use(cors({
    origin: [
       
    'https://xyzoverwrought-dust.surge.sh',
    "https://xyzoverwrought-dust.surge.sh",
    'http://localhost:5173/'
  
],

   
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())






// custom middle weres /
const verifyToken=(req,res,next)=>{
    const token =req?.cookies?.token;
    if(!token){
        return res.status(401).send({message:'unauthorized access'})
    }
    jwt.verify(token,process.env.Access_token,(err,decoded)=>{
        if(err){
            return res.status(401).send({message:'unauthorized access'})
        }
        req.user=decoded
        console.log("decoded user",req.user)
        next()
    })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mab1nuw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const bolean=true;

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   // await client.connect();
    const servicesCollection =client.db('Bookly').collection('allservices')
    const bookingsCollection =client.db('Bookly').collection('bookings')

    //auth related api
    app.post('/jwt',async(req,res)=>{
        const user =req.body;
        console.log('user for token',user);
        const token =jwt.sign(user,process.env.Access_token,{expiresIn:'1h'})
        res.cookie('token',token,{
            httpOnly:true,
            secure:true,
            sameSite:'none'
        })
        .send({message:true})
    })

    app.post('/logout',async(req,res)=>{
        const user=req.body;
        console.log('looging out ',user)
        res.clearCookie("token",{maxAge:0})
        .send({messagee:true})
    })




    // add service 
  app.post('/allservices',async(req,res)=>{
    const newProduct = req.body;
    console.log("products are : ",newProduct)
    const result = await servicesCollection.insertOne(newProduct);
    res.send(result)
  })
//   bookings 
  app.post('/bookings',async(req,res)=>{
    const newBooking = req.body;
    console.log("products are : ",newBooking)
   const result = await bookingsCollection.insertOne(newBooking);
    res.send(result)
  })
  //get booking specefic
  app.get('/bookings/:uid',verifyToken,async(req,res)=>{

    const uid=req.params.uid;
    const query ={uid:uid}
    console.log(req.cookies)

   
    // console.log(query)
    const result =await bookingsCollection.find(query).toArray();
    const r=result[0]
      if(req.user.email!==r.useremail)
    {
        return res.status(403).send({message:'forbidden access'})
    }

    console.log(r.useremail)
    res.send(result)
    // console.log(uid)
 })
  //get a pending specefic
  app.get('/bookings/:email',async(req,res)=>{
    const email=req.params.email;
    console.log('token owner',req.user)

    // if(req.user.email!==email)
    // {
    //     return res.status(403).send({message:'forbidden access'})
    // }
    const query ={uid:uid}
    
   
    // console.log(query)
    const result =await bookingsCollection.find(query).toArray();
    res.send(result)
    console.log(email)
 })

//  bookings 
app.get('/bookings',async(req,res)=>{
    let query1={}
    // let query2={}

    if(req.query?.email){
        query1={serviceProvideremail:req.query.email}
    }
    // if(req.query?.status){
    //     query2={status:req.query.status}
    // }
    const status={status:'pending'}
    
   
   // console.log(query1)
    // console.log(query2)
    const result =await bookingsCollection.find({
        $and: [
            query1 ,
            status
        ]
    }).toArray();
    //const result2=result.find(status)
    res.send(result)
    
 })
//  bookings 
app.get('/bookings',async(req,res)=>{
    // let query2={}

   
    // if(req.query?.status){
    //     query2={status:req.query.status}
    // }
    
   
    // console.log(query2)
    const result =await bookingsCollection.find().toArray();
    //const result2=result.find(status)
    res.send(result)
    
 })

  //get allservice
 app.get('/allservices',async(req,res)=>{
    const result = await servicesCollection.find().toArray();
    res.send(result)
 })

 app.get('/popularservices',async(req,res)=>{
    
    const query ={Popularity:true}
   
    console.log(query)
    const result =await servicesCollection.find(query).toArray();
    res.send(result)
    //console.log(result)
 })

//  manage service
 app.get('/manageservice/:uid',async(req,res)=>{
    const uid=req.params.uid;
    const query ={uid:uid}
   
    // console.log(query)
    const result =await servicesCollection.find(query).toArray();
    res.send(result)
    // console.log(uid)
 })
//  delete service 
 app.delete('/manageservice/:id',async(req,res)=>{
    const id=req.params.id;
    const query ={_id : new ObjectId(id)}
   
    console.log(query)
    const result =await servicesCollection.deleteOne(query)
    res.send(result)
    // console.log(uid)
 })
 //get single service 
 app.get("/allservices/service/:id",async(req,res)=>{
    const id =req.params.id;
    console.log(id)
    const query={_id : new ObjectId(id)}
    const result =await servicesCollection.findOne(query)
    res.send(result)
 })


//  update service 
app.patch('/allservices/service/:id',async(req,res)=>{
    const id =req.params.id;
    const filter={_id: new ObjectId(id)}
    const updatedservice=req.body;
  const product={
      $set:{
        //name:updatedproduct.name,
          namee:updatedservice.name,
          photo:updatedservice.photo,
          price:updatedservice.price,
          description:updatedservice.description,
          area:updatedservice.area
      }

  }
 const result=await servicesCollection.updateOne(filter,product)
  res.send(result)
  console.log("the product",product)
})
//  update booking service 
app.patch('/bookings/:id',async(req,res)=>{
    const id =req.params.id;
    const filter={_id: new ObjectId(id)}
    const updatedservice=req.body;
  const product={
      $set:{
        //name:updatedproduct.name,
        //   namee:updatedservice.name,
        //   photo:updatedservice.photo,
        //   price:updatedservice.price,
        //   description:updatedservice.description,
          status:updatedservice.status
      }

  }
 const result=await bookingsCollection.updateOne(filter,product)
  res.send(result)
  console.log("the product",id)
})



    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/',(req,res)=>{
    res.send('bookly database is running')
})
app.listen(port,()=>{
    console.log(`bookly is running on port = ${port}`)
})