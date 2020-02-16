const   express     = require("express"),
        app         = express(),
        mongoose    = require("mongoose"),
        bodyParser  = require("body-parser"),
        multer      = require("multer"),
        upload      = multer(),
        clearHash   = require('./services/cache')

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

const vehicle = require('./models/vehicle');

require('./services/cache')

app.use(upload.array()); 
app.use(express.static('public'));

// ROUTES

app.get('/',(req,res)=>{
    vehicle.find({})
            .then((data)=>{
                res.json({found: true, data: data});
            })
            .catch((err)=>{
                console.log(err)
                res.json({found: false, data: null});
            })
})

app.post('/vehicle',(req,res)=>{
    new vehicle(req.body)
        .save()
        .then((v_data)=>{
            console.log(v_data);
            res.json({save: true})
            clearHash(v_data.vehicleType)
        })
        .catch((err)=>{
            console.log(err)
            res.json({save: false})
        })
})

app.get('/:vehicleType/', (req,res)=>{
    vehicle.find({vehicleType: req.params.vehicleType})
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

app.get('/:vehicleType/:sno', (req,res)=>{
    vehicle.find({serialno: req.params.sno,vehicleType: req.params.vehicleType})
                .cache({key: req.params.vehicleType})
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