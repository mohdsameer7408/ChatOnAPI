import mongoose from "mongoose";
import GridFsStorge from "multer-gridfs-storage";
import multer from "multer";
import path from "path";
import Pusher from "pusher";

let gfs, upload;

const connectDB = async () => {
  const DBUri = `mongodb+srv://admin:${process.env.DB_PASS}@cluster0.4jjdb.mongodb.net/shoppable?retryWrites=true&w=majority`;

  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  };

  const pusher = new Pusher({
    appId: "1131208",
    key: "5fd6aca315e754980d30",
    secret: "ca8e8f5cc4b15cbd38bb",
    cluster: "ap2",
    useTLS: true,
  });

  try {
    const conn = await mongoose.connect(DBUri, dbOptions);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    const gfsConn = await mongoose.createConnection(DBUri, dbOptions);
    console.log(`MongoDB storage connected: ${gfsConn.host}`);

    gfs = new mongoose.mongo.GridFSBucket(gfsConn.db, { bucketName: "images" });

    const storage = new GridFsStorge({
      url: DBUri,
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      file: (req, file) =>
        new Promise((resolve, reject) => {
          const fileName = `IMG-${Date.now()}${path.extname(
            file.originalname
          )}`;
          const fileInfo = {
            filename: fileName,
            bucketName: "images",
          };
          resolve(fileInfo);
        }),
    });
    upload = multer({ storage });

    const changeStream = mongoose.connection.collection("chatrooms").watch();
    changeStream.on("change", (change) => {
      console.log("Change stream triggered!");
      console.log(change);

      if (change.operationType === "insert") {
        console.log("A chat room created!");
        const data = change.fullDocument;
        pusher.trigger("chatrooms", "inserted", data);
      } else if (change.operationType === "update") {
        console.log("A message was created!");
        pusher.trigger("chatrooms", "inserted", {});
      } else {
        pusher.trigger("chatrooms", "inserted", {});
        console.log("An unknown operation happened!");
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export { upload, gfs };
export default connectDB;
