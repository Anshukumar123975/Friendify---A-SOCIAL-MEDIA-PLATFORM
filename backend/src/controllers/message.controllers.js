import mongoose from "mongoose";
import { Message } from "../models/message.models.js"; // Import the Message model

// Controller to get all messages in a room
export const getMessages = async (req, res) => {
  try {
    const { room } = req.params; // Get room ID from the URL parameter
    const messages = await Message.find({ room }).sort({ timestamp: 1 }); // Fetch messages sorted by timestamp
    if (!messages.length) {
        return res.status(404).json({ message: 'No messages found in this room' });
    }
    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

// Controller to save a new message
export const sendMessage = async (data) => {
    try {
      const { room, sender, message } = data; // Extract data from the input
      console.log("Saving message:", { room, sender, message });
  
      // Create a new message instance
      const newMessage = new Message({
        room,
        sender,
        message,
      });
  
      // Save the message to the database
      const savedMessage = await newMessage.save();
  
      return savedMessage; // Return the saved message so it can be emitted
    } catch (error) {
      console.error("Error saving message:", error);
      throw new Error('Failed to save message');
    }
  };

export const createRoom = async(req, res) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).send('UserId and FriendId are required.');
    }

    // Search for an existing room where both userId and friendId are present
    let room = await Message.findOne({
      room: { $in: [`${userId}-${friendId}`, `${friendId}-${userId}`] }
    });

    // If no room exists, create a new one
    if (!room) {
      const newRoomId = `${userId}-${friendId}`;
      const newMessage = new Message(
       { 
        room: newRoomId,
        sender: userId,
        message: "Hi",
       }
      );
      await newMessage.save();
      console.log("Room created with ID:", newRoomId);
    }
    if(room){
      console.log("Room found");
    }

    res.status(200).json({ roomId: room.room});
  } catch (err) {
    console.error("Error finding or creating room:", err);
    res.status(500).send('Internal Server Error');
  }
}