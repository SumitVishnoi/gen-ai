import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      // required: true
    },
    role: {
      type: String,
      enum: ["user", "ai", "system"],
    },
    content: {
      type: String,
      required: true,
    },
    files: [
      {
        url: String,
        fileName: String,
        mimeType: String,
        size: Number,
        data: {
          type: Buffer,
          select: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;
