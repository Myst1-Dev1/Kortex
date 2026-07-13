'use server';

const API_URL = process.env.API_URL;

type ProjectState = {
  success: boolean;
  error?: string;
};

