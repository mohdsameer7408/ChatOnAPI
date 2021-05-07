import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    messages: [
      {
        text: String,
        imageUrl: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ChatRoom", chatRoomSchema);
