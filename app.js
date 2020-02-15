const   express     = require("express"),
        app         = express(),
        mongoose    = require("mongoose")

mongoose.connect('mongodb://localhost:27017/redisdemo',{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})



mongoose.connection
        .once('open', ()=>console.log('connected to database'))
        .on('error',(err)=>console.log("connection to database failed!!",err))
app.listen(3000,()=>console.log("server started at port:3000"))