import { Request, Response } from 'express';
import { Server } from '../models/Server';
import { Channel } from '../models/Channel';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';

export const createServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const ownerId = (req as any).user?.userId;

    const inviteCode = uuidv4().substring(0, 8).toUpperCase();

    const server = new Server({
      name,
      description,
      owner: ownerId,
      inviteCode,
      members: [ownerId],
      roles: [
        {
          id: 'admin',
          name: 'Admin',
          permissions: ['MANAGE_CHANNELS', 'MANAGE_MEMBERS', 'DELETE_MESSAGES'],
          color: '#FF0000',
        },
        {
          id: 'moderator',
          name: 'Moderator',
          permissions: ['DELETE_MESSAGES', 'MANAGE_MEMBERS'],
          color: '#00FF00',
        },
        {
          id: 'member',
          name: 'Member',
          permissions: ['SEND_MESSAGES', 'READ_MESSAGES'],
          color: '#0000FF',
        },
      ],
    });

    await server.save();

    // Create default channels
    const generalChannel = new Channel({
      name: 'general',
      server: server._id,
      type: 'text',
      description: 'General discussion',
    });

    const announcementsChannel = new Channel({
      name: 'announcements',
      server: server._id,
      type: 'text',
      description: 'Important announcements',
    });

    await generalChannel.save();
    await announcementsChannel.save();

    server.channels = [generalChannel._id, announcementsChannel._id];
    await server.save();

    res.status(201).json(server);
  } catch (error) {
    console.error('❌ Create server error:', error);
    res.status(500).json({ error: 'Failed to create server' });
  }
};

export const joinServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { inviteCode } = req.body;
    const userId = (req as any).user?.userId;

    const server = await Server.findOne({ inviteCode });

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    if (server.members.includes(userId)) {
      res.status(400).json({ error: 'Already a member of this server' });
      return;
    }

    server.members.push(userId);
    await server.save();

    // Add server to user's servers list
    await User.findByIdAndUpdate(userId, { $push: { servers: server._id } });

    res.json(server);
  } catch (error) {
    console.error('❌ Join server error:', error);
    res.status(500).json({ error: 'Failed to join server' });
  }
};

export const getServerDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serverId } = req.params;

    const server = await Server.findById(serverId)
      .populate('members', 'username avatar')
      .populate('channels')
      .exec();

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    res.json(server);
  } catch (error) {
    console.error('❌ Get server details error:', error);
    res.status(500).json({ error: 'Failed to fetch server' });
  }
};

export const listUserServers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    const servers = await Server.find({ members: userId })
      .populate('owner', 'username avatar')
      .exec();

    res.json(servers);
  } catch (error) {
    console.error('❌ List servers error:', error);
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
};

export const updateServerSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serverId } = req.params;
    const { name, description, icon } = req.body;
    const userId = (req as any).user?.userId;

    const server = await Server.findById(serverId);

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    if (server.owner.toString() !== userId) {
      res.status(403).json({ error: 'Only server owner can update settings' });
      return;
    }

    server.name = name || server.name;
    server.description = description || server.description;
    server.icon = icon || server.icon;

    await server.save();

    res.json(server);
  } catch (error) {
    console.error('❌ Update server settings error:', error);
    res.status(500).json({ error: 'Failed to update server settings' });
  }
};

export const deleteServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serverId } = req.params;
    const userId = (req as any).user?.userId;

    const server = await Server.findById(serverId);

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    if (server.owner.toString() !== userId) {
      res.status(403).json({ error: 'Only server owner can delete server' });
      return;
    }

    // Delete all channels in server
    await Channel.deleteMany({ server: serverId });

    // Delete server
    await Server.findByIdAndDelete(serverId);

    res.json({ message: 'Server deleted successfully' });
  } catch (error) {
    console.error('❌ Delete server error:', error);
    res.status(500).json({ error: 'Failed to delete server' });
  }
};
