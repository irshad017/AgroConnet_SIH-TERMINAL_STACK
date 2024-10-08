const express = require('express')
const cors = require('cors')
const body_parser = require('body-parser')
const JWT_SECRET = 'secretkey';
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { UserAuth } = require('./middleWare/UserAuth')
const { Farmer, Product, User } = require('./connect/SchemaDb');
const { default: mongoose } = require('mongoose');

const app = express()
app.use(express.json())
app.use(body_parser.json())
app.use(cors())

app.post('/sign',async(req,resp,next)=>{
    try{
        const {
            email, 
            password,
            firstName,
            lastName,
            farmName,
            expenditure,
            income,
            profit,
            loss,
            farmLocation,
        } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Farmer.findOne({ email });
        if (user) {
            resp.status(400).json({ error: 'Username already exists' });
            return;
        }
        const newUser = new Farmer({ 
            youAre: "Farmer",
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            farmName: farmName,
            // orderHistory: ,
            expenditure: expenditure,
            income: income,
            profit: profit,
            loss: loss,
            farmLocation: farmLocation
        });
        await newUser.save();
        const token = jwt.sign({ farmerId: newUser._id }, JWT_SECRET);
        resp.json({ 
            message: 'User registered successfully',
            token: token,
            farmerId: newUser._id
        });
    }catch(err){
        resp.status(500).json({ error: 'Failed to register user',err });
        console.log(err);
    }
})
//USER-SIGNUP-----
app.post('/signUpUSER',async(req,resp,next)=>{
    try{
        const {
            username, 
            password,
            firstName,
            lastName,
            phoneNumber,
            address
        } = req.body;
        console.log(address)
        
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword)
        const user = await User.findOne({ email: username });
        if (user) {
            resp.status(400).json({ error: 'Username already exists' });
            // alert("Email already Exists!")
            console.log("User Already present")
            return;
        }
        console.log(user)
        const newUser = new User({ 
            youAre: "Customer",
            email: username,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            address: address
        });
        // console.log(newUser)
        await newUser.save();
        const token = jwt.sign({ UserId: newUser._id }, JWT_SECRET);
        console.log(newUser._id)
        resp.json({ 
            message: 'User registered successfully',
            token: token,
            UserId: newUser._id
        });
    }catch(err){
        resp.status(500).json({ error: 'Failed to register user',err });
        console.log(err);
    }
})
// app.get('/getUSERS', async (req,resp)=>{
//     try{
//         const user = await User.findOne({})
//     }
// })
app.post('/login', async (req, resp) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return resp.status(400).json({ msg: "Email and password are required" });
        }

        const user = await Farmer.findOne({ email });
        if (!user) {
            return resp.status(400).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const token = jwt.sign({ email, userId: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Token with 1-hour expiration
            return resp.json({ message: 'Login successful', token });
        } else {
            return resp.status(400).json({ error: 'Invalid email or password' });
        }
    } catch (err) {
        console.error("Error during login", err);
        return resp.status(500).json({
            msg: "Error occurred",
            error: err.message,
        });
    }
});
//USER-LOGIN
app.post('/loginUSER', async (req, resp) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return resp.status(400).json({ msg: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return resp.status(400).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const token = jwt.sign({ email, userId: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Token with 1-hour expiration
            return resp.json({ message: 'Login successful', token });
        } else {
            return resp.status(400).json({ error: 'Invalid email or password' });
        }
    } catch (err) {
        console.error("Error during login", err);
        return resp.status(500).json({
            msg: "Error occurred",
            error: err.message,
        });
    }
});
// market_place ALL_PRODUCTS ARRAY AND ALL_FARMER 
app.get('/market_product', async(req,resp)=>{
    try{
        const farm = await Farmer.find()
        const product = await Farmer.find({},'productSell')
        // console.log("ProducT: ",product)
        const products = product.flatMap(farmer => farmer.productSell);

        if(!products){
            resp.status(404).json({
                msg: "No products found"
            })
        }
        if(!farm){
            resp.status(404).json({
                msg: "No Farmer found"
            })
        }
        // console.log("Products: ",products)
        // console.log("Farmer detail: ",farm)
        if(product && farm){
            resp.status(200).json({
                farmerData: farm,
                data: products,
                msg: "Successfully Fetched"
            })
        }
    }catch(err){
        console.log("Error")
        resp.status(500).json({
            msg: err.message
        })
    }
})
// FARMER-CURRENT-DATA
app.get('/currentFarmerData', async(req,resp)=>{
    try{
        const farmerID = req.query.FarmerID
        // console.log("f: ",farmerID)
        if(!farmerID){
            resp.status(300).json({
                msg: "farmerID not present"
            })
        }else{
            const farm = await Farmer.findById(farmerID)
            // console.log(farm)
            if(!farm){
                resp.status(404).json({
                    msg: "No Farmer found"
                })
            }
            if( farm){
                resp.status(200).json({
                    farmerData: farm,
                    msg: "Successfully Fetched"
                })
            }
        }
    }catch(err){
        console.log("Error")
        resp.status(500).json({
            msg: err.message
        })
    }
})
// USER-CURRENT-DATA
app.get('/currentUserData', async(req,resp)=>{
    try{
        const userID = req.query.userId
        if(!userID){
            resp.status(300).json({
                msg: "UserID not present"
            })
        }else{
            const user = await User.findById(userID)
            if(!user){
                resp.status(404).json({
                    msg: "No Farmer found"
                })
            }
            if(user){
                resp.status(200).json({
                    userData: user,
                    msg: "Successfully Fetched"
                })
            }
        }
    }catch(err){
        console.log("Error")
        resp.status(500).json({
            msg: err.message
        })
    }
})
// PRODUCT-ADD & SEE MY PREVIOUS PRODUCT POSTS---
// PRODUCT-ADD & SEE MY PREVIOUS PRODUCT POSTS---
app.post('/updateProduct/:farmerId', async(req,resp)=>{
    try{
        const {farmerId} = req.params
        const {
            title, 
            description, 
            rate, 
            imageURL, 
            quantity} = req.body

        const newProduct = {
            farmerId,
            title,
            description,
            rate,
            imageURL,
            quantity
        };
        const updatedFarmer = await Farmer.findByIdAndUpdate(
            farmerId,
            { $push: { productSell: newProduct } },
            { new: true }
        );
        if (!updatedFarmer) {
            return resp.status(404).json({ msg: "Farmer not found" });
        }
        resp.status(201).json({ msg: "Product added successfully", updatedFarmer });
    }catch(err){
        resp.status(400).json({
            msg: "Error Message",
            error: err.message
        })
    }
})
// DELETE MY PRODUCT
app.delete('/deleteMyProduct', async (req, resp) => {
    const FarmerId = req.query.farmerId;
    const ProductId = req.query.productId;

    console.log("F:", FarmerId);
    console.log("P:", ProductId);

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(FarmerId) || !mongoose.Types.ObjectId.isValid(ProductId)) {
        console.log('Invalid Farmer or Product ID');
        return resp.status(400).json({ message: 'Invalid Farmer or Product ID' });
    }

    try {
        if (!FarmerId || !ProductId) {
            return resp.status(400).json({ error: 'farmerId and productId are required' });
        }

        // Convert ProductId to ObjectId
        const productObjectId = new mongoose.Types.ObjectId(ProductId);

        // Find the farmer
        const Farm = await Farmer.findById(FarmerId);
        if (!Farm) {
            return resp.status(404).json({ message: 'Farmer not found' });
        }

        // Check if the product exists in the farmer's productSell array
        const productExists = Farm.productSell.some(product => product._id.toString() === productObjectId.toString());
        if (!productExists) {
            console.log('Product not found in farmer\'s productSell list');
            return resp.status(404).json({ message: 'Product not found in farmer\'s productSell list' });
        }

        // Pull the product from the productSell array
        const result = await Farmer.updateOne(
            { _id: FarmerId, 'productSell._id': productObjectId },
            { $pull: { productSell: { _id: productObjectId } } }
        );

        console.log("RESULT", result);
        if (result.modifiedCount > 0) {
            console.log("Product ID from user deleted successfully");
            resp.status(200).json({ message: 'Product deleted successfully from user and collaborators' });
        } else {
            console.log("Not Deleted");
            resp.status(404).json({ message: 'Failed To Delete Product' });
        }
    } catch (err) {
        console.log("ErroR: ",err)
        resp.status(500).json({
            msg: "Error Message",
            error: err.message
        });
    }
});



// see my products added
app.get('/addProduct',async(req,resp)=>{
    try{
        const farmerID = req.query.farmerId
        // console.log(farmerID)
        const products = await Farmer.findOne(
            {_id: farmerID}
        )
        // console.log(products)
        resp.status(200).json({
            msg: "Fetched",
            farmerData: products
        })
    }catch(err){
        resp.status(500).json({
            msg: "Error in fetching product data",
            error: err.message
        })
    }
})
// BUY REQUEST----
app.post('/buyRequest', async(req,resp)=>{
    try{
        const sellerID = req.query.SellerId
        const buyerData = req.body
        
        console.log("seller",sellerID)
        console.log("DATA",buyerData)
        const buy = await Farmer.findByIdAndUpdate(
            sellerID,
            {$push: {order: buyerData}},
            {new: true}
        )
        console.log("buy")
        console.log("BUY",buy)
        if(!buy){
            return resp.status(404).send({
                msg: "Farmer Not Found"
            })
        }
        console.log("!buy")
        resp.status(200).json({
            msg: "Successfully Ordered!"
        })
    }catch(err){
        console.log("R")
        resp.status(500).json({
            msg: "Not Ordered",
            error: err
        })
    }
})





app.listen(5000, ()=>{
    console.log("server is running on port 5000")
})