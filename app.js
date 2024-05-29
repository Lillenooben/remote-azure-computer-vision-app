import { classifyImage } from './imageurl'
const express = require('express')
const app = express()
const port = 3000

app.get("/", (req, res) => {
    res.send('Hello World!')
})

app.get("/classification/:uuid", (req, res) => {
    var token = req.get("Authorization")
    token = token.split(" ")[1]
    const uuid = req.params.uuid
    
    console.log(`Token: ${token}`)
    console.log(`uuid: ${uuid}`)

    var classification = classifyImage(token, uuid).catch((err) => console.error(err));

    console.log(`${classification}`)

    res.send(`${classification}`)

    
})

app.listen(port, () =>{
    console.log(`Example app listening on port ${port}`)
})