import dotenv from "dotenv"
import connectdb from "./db/index.js";
import app from "./app.js";
const port = process.env.PORT || 8000;


dotenv.config({ path : "./.env"})

connectdb()
.then( () => {
    app.listen( port  ,() => { 
        console.log(`serve at http://localhost:${port}/`);
    })
})
.catch((err) => {
    console.log(`error in database ${err}`);
})