import express from 'express';
import { Octokit } = require('@octokit/rest');

export const githubClient = (accessToken: string) => {
  return new Octokit({
    auth: accessToken,
  });
};

export const getUserRepos = async (accessToken: string) => {
  try {
    const octokit = githubClient(accessToken);
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated',
    });
    return data;
  } catch (error) {
    console.error('❌ Error fetching user repos:', error);
    throw error;
  }
};

export const getOrgRepos = async (accessToken: string, org: string) => {
  try {
    const octokit = githubClient(accessToken);
    const { data } = await octokit.repos.listForOrg({
      org,
      per_page: 100,
      sort: 'updated',
    });
    return data;
  } catch (error) {
    console.error('❌ Error fetching org repos:', error);
    throw error;
  }
};

export const getOrgMembers = async (accessToken: string, org: string) => {
  try {
    const octokit = githubClient(accessToken);
    const { data } = await octokit.orgs.listMembers({
      org,
      per_page: 100,
    });
    return data;
  } catch (error) {
    console.error('❌ Error fetching org members:', error);
    throw error;
  }
};

export const createRepository = async (
  accessToken: string,
  repoName: string,
  description: string,
  isPrivate: boolean = false
) => {
  try {
    const octokit = githubClient(accessToken);
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description,
      private: isPrivate,
    });
    return data;
  } catch (error) {
    console.error('❌ Error creating repository:', error);
    throw error;
  }
};

export const getRepositoryDetails = async (accessToken: string, owner: string, repo: string) => {
  try {
    const octokit = githubClient(accessToken);
    const { data } = await octokit.repos.get({
      owner,
      repo,
    });
    return data;
  } catch (error) {
    console.error('❌ Error fetching repository details:', error);
    throw error;
  }
};
