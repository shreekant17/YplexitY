import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI;
//const MONGODB_URI ='mongodb://localhost:27017';

if (!MONGODB_URI) {
  console.log("Invalid URI");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { con: null, promise: null };

}

const connectMongoDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      //console.log("connection Successfull")
      return mongoose;
    })
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
};

export default connectMongoDB;
