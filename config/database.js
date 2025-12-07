import mongoose from "mongoose";

const connectDatabase = ()=>{

    mongoose.connect(process.env.DB_URI)
    .then((data)=>{console.log(`Database Connected ${data}`);})
   

}

export default connectDatabase;