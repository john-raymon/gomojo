import mongoose from 'mongoose';
const mongodbUri = process.env.MONGODB_URI_DEV;
const isProduction = process.env.NODE_ENV !== 'development';

/**
 * MongoDB connection pooling with serverless functions
 * https://github.com/vercel/next.js/discussions/12229
 */
export default (req, res, next) => {
  console.log('getting connection')
  // Set up Mongodb
  if (isProduction) {
    return mongoose
      .connect(mongodbUri)
      .then(() => {
        return next();
      })
  } else {
    return mongoose
      .connect(mongodbUri, { useUnifiedTopology: true, useNewUrlParser: true })
      .then(() => {
        return next();
      })
      .catch((error) => {
        console.log("Mongodb crashed ERROR:", error);
      });
    mongoose.set("debug", true);
  }
};