const express = require('express');
const app = express();
const connectDB=require('./config/db');
const path=require('path');



connectDB();

app.use(express.json({extended:false}))


app.use('/api/users',require('./routes/api/users'))
app.use('/api/posts',require('./routes/api/post'))
app.use('/api/auth',require('./routes/api/auth'))
app.use('/api/profile',require('./routes/api/profile'))

//Serve static assets in production

if(process.env.NODE_ENV==='production'){
    //set static folder
    app.use(express.static('client/build'))
}
app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'client','build','index.html'))
})


const PORT = process.env.PORT || 5000;//5000 for server backend port,3000 for dev client port

app.listen(PORT, () => console.log(`server started on ${PORT}`));
