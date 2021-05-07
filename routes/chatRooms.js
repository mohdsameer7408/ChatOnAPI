import { Router } from "express";

import ChatRoom from "../models/ChatRoom.js";

const router = Router();

router.get("/fetch/chat-rooms", async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find().populate(
      "messages.user",
      "-password -__v -createdAt -updatedAt"
    );
    res.status(200).json(chatRooms);
  } catch (error) {
    res.status(500).json("Something went wrong and an error occured: ", error);
  }
});

router.post("/create/chat-room", async (req, res) => {
  const { title, imageUrl } = req.body;
  const chatRoom = new ChatRoom({ title, imageUrl, messages: [] });

  try {
    const createdChatRoom = await chatRoom.save();
    res.status(201).json(createdChatRoom);
  } catch (error) {
    res.status(500).json("Something went wrong and an error occured: ", error);
  }
});

router.delete("/delete/chat-room/:id", async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findByIdAndDelete(req.params.id);
    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(500).json("Something went wrong and an error occured: ", error);
  }
});

router.patch("/chat-room/create-message/:id", async (req, res) => {
  const { text, imageUrl, user, timestamp } = req.body;

  try {
    const chatRoom = await ChatRoom.findById(req.params.id);
    if (chatRoom) {
      chatRoom.messages = [
        { text, imageUrl, user, timestamp },
        ...chatRoom.messages,
      ];
      const updatedChatData = await chatRoom.save();
      res.status(200).json(updatedChatData);
    }
  } catch (error) {
    res.status(500).json("Something went wrong and an error occured: ", error);
  }
});

router.patch("/delete/chat-message/:id", async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.id);
    if (chatRoom) {
      chatRoom.messages = chatRoom.messages.filter(
        (message) => message._id.toString() !== req.body.messageId
      );
      const updatedChatData = await chatRoom.save();
      res.status(200).json(updatedChatData);
    }
  } catch (error) {
    res.status(500).json("Something went wrong and an error occured: ", error);
  }
});

export default router;
