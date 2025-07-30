document.addEventListener('DOMContentLoaded', () => {
    const username = 'thippeswammy';
    const repoContainer = document.getElementById('repo-container');

    fetch(`https://api.github.com/users/${username}/repos?sort=updated&direction=desc`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(repos => {
            if (repos.length === 0) {
                repoContainer.innerHTML = '<p>No public repositories found.</p>';
                return;
            }

            repos.forEach(repo => {
                const repoEl = document.createElement('div');
                repoEl.classList.add('repo');

                const repoLink = document.createElement('a');
                repoLink.href = repo.html_url;
                repoLink.target = '_blank';
                repoLink.textContent = repo.name;

                const repoName = document.createElement('h3');
                repoName.appendChild(repoLink);

                const repoDescription = document.createElement('p');
                repoDescription.textContent = repo.description || 'No description available.';

                repoEl.appendChild(repoName);
                repoEl.appendChild(repoDescription);

                if (repo.language) {
                    const repoLanguage = document.createElement('p');
                    repoLanguage.innerHTML = `<strong>Language:</strong> ${repo.language}`;
                    repoEl.appendChild(repoLanguage);
                }

                repoContainer.appendChild(repoEl);
            });
        })
        .catch(error => {
            console.error('Error fetching repositories:', error);
            repoContainer.innerHTML = '<p>Error loading repositories. Please try again later.</p>';
        });
});
