document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js loaded');

    const generateBtn = document.getElementById('generate-btn');
    const usernameInput = document.getElementById('github-username');
    const sidebarContainer = document.getElementById('sidebar-container');
    const projectsContainer = document.getElementById('projects-container');

    console.log('DOM Elements - generateBtn:', generateBtn);
    console.log('DOM Elements - usernameInput:', usernameInput);
    console.log('DOM Elements - sidebarContainer:', sidebarContainer);
    console.log('DOM Elements - projectsContainer:', projectsContainer);

    if (!generateBtn || !usernameInput || !sidebarContainer || !projectsContainer) {
        console.error('One or more DOM elements are missing:', {
            generateBtn, usernameInput, sidebarContainer, projectsContainer
        });
        return;
    }

    generateBtn.addEventListener('click', async () => {
        console.log('Button clicked!');
        const username = usernameInput.value.trim();
        
        if (!username) {
            alert('Please enter a GitHub Username!');
            return;
        }

        // Create and initialize output divs dynamically
        const outputPersonalDiv = document.createElement('div');
        outputPersonalDiv.id = 'portfolio-output-personal';
        outputPersonalDiv.classList.add('hidden');
        sidebarContainer.appendChild(outputPersonalDiv);

        const outputProjectsDiv = document.createElement('div');
        outputProjectsDiv.id = 'portfolio-output-projects';
        outputProjectsDiv.classList.add('hidden');
        projectsContainer.appendChild(outputProjectsDiv);

        const bioDiv = document.createElement('div');
        bioDiv.id = 'bio';
        const skillsDiv = document.createElement('div');
        skillsDiv.id = 'skills';
        const projectsDiv = document.createElement('div');
        projectsDiv.id = 'projects';

        outputPersonalDiv.appendChild(bioDiv);
        outputPersonalDiv.appendChild(skillsDiv);
        outputProjectsDiv.appendChild(projectsDiv);

        outputPersonalDiv.style.display = 'block';
        outputProjectsDiv.style.display = 'block';
        console.log('Loading state set for:', username);

        try {
            const BASE_URL = 'http://localhost:4000';

            console.log('Fetching user data for:', username);
            const userResponse = await fetch(`${BASE_URL}/api/user/${username}`);
            if (!userResponse.ok) throw new Error(`HTTP error! status: ${userResponse.status}`);
            const userData = await userResponse.json();
            console.log('User data received:', userData);

            console.log('Fetching repos for:', username);
            const reposResponse = await fetch(`${BASE_URL}/api/repos/${username}`);
            if (!reposResponse.ok) throw new Error(`HTTP error! status: ${reposResponse.status}`);
            const reposData = await reposResponse.json();
            console.log('Repos data received:', reposData);

            const skills = new Set();
            for (const repo of reposData) {
                console.log(`Fetching languages for repo: ${repo.name}`);
                const langResponse = await fetch(`${BASE_URL}/api/languages/${username}/${repo.name}`);
                if (langResponse.ok) {
                    const langData = await langResponse.json();
                    console.log(`Languages for ${repo.name}:`, langData);
                    Object.keys(langData).forEach(skill => skills.add(skill));
                } else {
                    console.warn(`Failed to fetch languages for ${repo.name}, status: ${langResponse.status}`);
                }
            }
            console.log('Skills set:', Array.from(skills));

            if (!userData || !reposData) {
                throw new Error('Incomplete data received from API');
            }

            // Set bio content
            console.log('Attempting to set bio:', { name: userData.name, bio: userData.bio, url: userData.html_url });
            bioDiv.innerHTML = `
                <div class="bio-header">
                    <h2 class="text-2xl font-semibold">Profile</h2>
                </div>
                <img src="${userData.avatar_url}" alt="${username} Avatar" class="w-24 h-24 rounded-full mb-4">
                <p class="text-gray-300">${userData.bio || 'No bio available'}</p>
                <p class="text-gray-400 mt-2">GitHub: <a href="${userData.html_url || '#'}" target="_blank" class="text-blue-400 hover:underline">${username}</a></p>
            `;
            console.log('Bio content set');

            // Set skills content
            console.log('Attempting to set skills:', Array.from(skills));
            skillsDiv.innerHTML = `
                <div class="bio-header">
                    <h2 class="text-2xl font-semibold">Skills</h2>
                </div>
                <div class="skills-list">
                    ${skills.size ? Array.from(skills).map(skill => `<span>${skill}</span>`).join('') : '<p class="text-gray-500">No skills detected</p>'}
                </div>
            `;
            console.log('Skills content set');

            // Set projects content
            console.log('Attempting to set projects:', reposData.map(r => r.name));
            projectsDiv.innerHTML = `
                <div class="bio-header">
                    <h2 class="text-2xl font-semibold">Projects</h2>
                </div>
                ${reposData.length ? reposData.map(repo => `
                    <div class="project-card">
                        <h4 class="font-semibold">${repo.name || 'Unnamed Project'}</h4>
                        <p class="text-gray-400">${repo.description || 'No description'}</p>
                        <a href="${repo.html_url || '#'}" target="_blank" class="text-blue-400 hover:underline">View on GitHub</a>
                    </div>
                `).join('') : '<p class="text-gray-500">No projects found</p>'}
            `;
            console.log('Projects content set');

            // Display the content
            outputPersonalDiv.classList.remove('hidden');
            outputPersonalDiv.classList.add('show');
            outputPersonalDiv.offsetHeight; // Force reflow

            outputProjectsDiv.classList.remove('hidden');
            outputProjectsDiv.classList.add('show');
            outputProjectsDiv.offsetHeight; // Force reflow

            console.log('Rebuilt and displayed personal and projects content');
            console.log('Final outputPersonalDiv content:', outputPersonalDiv.innerHTML);
            console.log('Final outputProjectsDiv content:', outputProjectsDiv.innerHTML);
        } catch (error) {
            console.error('Error caught:', error);
            outputPersonalDiv.innerHTML = `<p class="error text-red-500">Error: ${error.message}</p>`;
            outputProjectsDiv.innerHTML = `<p class="error text-red-500">Error: ${error.message}</p>`;
            outputPersonalDiv.classList.remove('hidden');
            outputPersonalDiv.classList.add('show');
            outputProjectsDiv.classList.remove('hidden');
            outputProjectsDiv.classList.add('show');
        }
    });
});