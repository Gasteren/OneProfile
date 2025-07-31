const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS to allow your frontend origin (e.g., http://localhost:5500)
app.use(cors({ origin: 'http://localhost:3000' })); // Adjust if your frontend port differs
app.use(express.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Store in .env file

// Root route for testing
app.get('/', (req, res) => {
    res.send('1-Click Portfolio Builder API is running. Use /api/user/:username, /api/repos/:username, or /api/languages/:owner/:repo');
});

// Get user data
app.get('/api/user/:username', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${req.params.username}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        if (status === 403 && message.includes('rate limit')) {
            res.status(403).json({ error: 'GitHub API rate limit exceeded. Please check your token or try again later.' });
        } else if (status === 404) {
            res.status(404).json({ error: 'GitHub user not found' });
        } else {
            res.status(status).json({ error: message });
        }
    }
});

// Get repositories
app.get('/api/repos/:username', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${req.params.username}/repos?sort=updated&per_page=5`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        if (status === 403 && message.includes('rate limit')) {
            res.status(403).json({ error: 'GitHub API rate limit exceeded. Please check your token or try again later.' });
        } else if (status === 404) {
            res.status(404).json({ error: 'Repositories not found for this user' });
        } else {
            res.status(status).json({ error: message });
        }
    }
});

// Get repository languages
app.get('/api/languages/:owner/:repo', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${req.params.owner}/${req.params.repo}/languages`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        if (status === 403 && message.includes('rate limit')) {
            res.status(403).json({ error: 'GitHub API rate limit exceeded. Please check your token or try again later.' });
        } else if (status === 404) {
            res.status(404).json({ error: 'Repository or languages not found' });
        } else {
            res.status(status).json({ error: message });
        }
    }
});

app.listen(4000, () => console.log('Server running on http://localhost:4000')); // Changed to port 4000