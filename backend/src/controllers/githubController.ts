import { Request, Response } from 'express';
import {
  getUserRepos,
  getOrgRepos,
  getOrgMembers,
  createRepository,
  getRepositoryDetails,
} from '../utils/githubClient';
import { Repository } from '../models/Repository';

export const fetchUserRepositories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const user = await require('../models/User').User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const repos = await getUserRepos(user.githubAccessToken);

    res.json(repos);
  } catch (error) {
    console.error('❌ Fetch user repositories error:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

export const fetchOrgRepositories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { org } = req.params;
    const userId = (req as any).user?.userId;
    const user = await require('../models/User').User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const repos = await getOrgRepos(user.githubAccessToken, org);

    res.json(repos);
  } catch (error) {
    console.error('❌ Fetch org repositories error:', error);
    res.status(500).json({ error: 'Failed to fetch organization repositories' });
  }
};

export const fetchOrgMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { org } = req.params;
    const userId = (req as any).user?.userId;
    const user = await require('../models/User').User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const members = await getOrgMembers(user.githubAccessToken, org);

    res.json(members);
  } catch (error) {
    console.error('❌ Fetch org members error:', error);
    res.status(500).json({ error: 'Failed to fetch organization members' });
  }
};

export const createNewRepository = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repoName, description, isPrivate } = req.body;
    const userId = (req as any).user?.userId;
    const user = await require('../models/User').User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newRepo = await createRepository(user.githubAccessToken, repoName, description, isPrivate);

    // Save to OctoFlow database
    const savedRepo = new Repository({
      repoName: newRepo.name,
      owner: newRepo.owner.login,
      url: newRepo.html_url,
      description: newRepo.description,
      language: newRepo.language,
      stars: newRepo.stargazers_count,
      forks: newRepo.forks_count,
      sharedBy: userId,
    });

    await savedRepo.save();

    res.status(201).json(newRepo);
  } catch (error) {
    console.error('❌ Create repository error:', error);
    res.status(500).json({ error: 'Failed to create repository' });
  }
};

export const shareRepository = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repoName, owner, serverId } = req.body;
    const userId = (req as any).user?.userId;
    const user = await require('../models/User').User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const repoDetails = await getRepositoryDetails(user.githubAccessToken, owner, repoName);

    const sharedRepo = new Repository({
      repoName: repoDetails.name,
      owner: repoDetails.owner.login,
      url: repoDetails.html_url,
      description: repoDetails.description,
      language: repoDetails.language,
      stars: repoDetails.stargazers_count,
      forks: repoDetails.forks_count,
      sharedBy: userId,
      server: serverId,
    });

    await sharedRepo.save();

    res.status(201).json(sharedRepo);
  } catch (error) {
    console.error('❌ Share repository error:', error);
    res.status(500).json({ error: 'Failed to share repository' });
  }
};

export const getSharedRepositories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serverId } = req.query;

    let query: any = {};
    if (serverId) query.server = serverId;

    const repos = await Repository.find(query)
      .populate('sharedBy', 'username avatar')
      .sort({ createdAt: -1 })
      .exec();

    res.json(repos);
  } catch (error) {
    console.error('❌ Get shared repositories error:', error);
    res.status(500).json({ error: 'Failed to fetch shared repositories' });
  }
};
