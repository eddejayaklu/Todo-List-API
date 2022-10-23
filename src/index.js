const express = require('express')
require('./db/mongoose')

const path =  require('path')
const app = express()

const port = process.env.PORT || 8000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDirectoryPath))
app.use(express.json())



app.listen(port,()=>{
    console.log("server is up",port)
})

