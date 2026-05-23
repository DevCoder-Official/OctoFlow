import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';

export const getChannelMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({ channel: channelId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .exec();

    res.json(messages.reverse());
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, channelId, serverId } = req.body;
    const authorId = (req as any).user?.userId;

    if (!content || !channelId || !serverId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const message = new Message({
      content,
      author: authorId,
      channel: channelId,
      server: serverId,
    });

    await message.save();
    await message.populate('author', 'username avatar');

    res.status(201).json(message);
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const editMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).user?.userId;

    const message = await Message.findById(id);

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (message.author.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized to edit this message' });
      return;
    }

    message.content = content;
    message.edited = true;

    await message.save();

    res.json(message);
  } catch (error) {
    console.error('❌ Edit message error:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const message = await Message.findById(id);

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (message.author.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this message' });
      return;
    }

    message.deletedAt = new Date();

    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('❌ Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

export const addReaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = (req as any).user?.userId;

    const message = await Message.findById(id);

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (!message.reactions) {
      message.reactions = new Map();
    }

    if (!message.reactions.has(emoji)) {
      message.reactions.set(emoji, []);
    }

    const emojiReactions = message.reactions.get(emoji) as any[];
    if (!emojiReactions.includes(userId)) {
      emojiReactions.push(userId);
    }

    await message.save();

    res.json(message);
  } catch (error) {
    console.error('❌ Add reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
};
