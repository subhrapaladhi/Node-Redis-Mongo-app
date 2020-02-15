const   express     = require("express"),
        app         = express(),
        mongoose    = require("mongoose"),
        bodyParser  = require("body-parser"),
        multer      = require("multer"),
        upload      = multer()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// MONGODB SETUP

mongoose.connect('mongodb://localhost:27017/redisdemo',{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection
        .once('open', ()=>console.log('connected to database'))
        .on('error',(err)=>console.log("connection to database failed!!",err))

const motercycle = require('./models/motercycles');

require('./services/cache')

app.use(upload.array()); 
app.use(express.static('public'));

// ROUTES

// motercycle routes
app.post('/motercycle',(req,res)=>{
    new motercycle(req.body)
        .save()
        .then((mc_data)=>{
            console.log(mc_data);
            res.json({save: true})
        })
        .catch((err)=>{
            console.log(err)
            res.json({save: false})
        })
})

app.get('/motercycle/:sno', (req,res)=>{
    motercycle.find({serialno: req.params.sno})
                .cache()
                .then((data)=>{
                    if(data){
                        res.json({found: true, data: data})
                    }else{
                        res.json({found: false, data: null})
                    }
                })
                .catch((err)=>{
                    console.log(err)
                    res.json({found: false, data: null})
                })
})

app.listen(3000,()=>console.log("server started at port:3000"))