document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const mainSection = document.getElementById('main-section');
    const loginButton = document.getElementById('login-button');
    const getRecommendationsButton = document.getElementById('get-recommendations');
    const createPlaylistButton = document.getElementById('create-playlist');
    const recommendationsList = document.getElementById('recommendations-list');
    const songsList = document.getElementById('songs-list');

    let currentRecommendations = [];

    // Check if user is already logged in
    chrome.storage.local.get(['spotifyToken'], (result) => {
        if (result.spotifyToken) {
            showMainSection();
        }
    });

    loginButton.addEventListener('click', async () => {
        const response = await chrome.runtime.sendMessage({ type: 'LOGIN' });
        if (response.success) {
            chrome.storage.local.set({ spotifyToken: response.token });
            showMainSection();
        } else {
            alert('Login failed. Please try again.');
        }
    });

    getRecommendationsButton.addEventListener('click', async () => {
        const genres = document.getElementById('genres').value;
        const playlistId = document.getElementById('playlist-id').value;
        const mood = document.getElementById('mood').value;

        if (!genres && !playlistId) {
            alert('Please enter either genres or a playlist ID');
            return;
        }

        getRecommendationsButton.disabled = true;
        getRecommendationsButton.textContent = 'Loading...';

        const response = await chrome.runtime.sendMessage({
            type: 'GET_RECOMMENDATIONS',
            data: {
                genres: genres.split(',').map(g => g.trim()).join(','),
                playlistId,
                mood
            }
        });

        getRecommendationsButton.disabled = false;
        getRecommendationsButton.textContent = 'Get Recommendations';

        if (response.success) {
            currentRecommendations = response.recommendations;
            displayRecommendations(response.recommendations);
        } else {
            alert('Failed to get recommendations. Please try again.');
        }
    });

    createPlaylistButton.addEventListener('click', async () => {
        if (!currentRecommendations.length) {
            alert('No recommendations to create playlist from');
            return;
        }

        createPlaylistButton.disabled = true;
        createPlaylistButton.textContent = 'Creating...';

        const response = await chrome.runtime.sendMessage({
            type: 'CREATE_PLAYLIST',
            data: {
                tracks: currentRecommendations
            }
        });

        createPlaylistButton.disabled = false;
        createPlaylistButton.textContent = 'Create Playlist from These Songs';

        if (response.success) {
            alert('Playlist created successfully!');
        } else {
            alert('Failed to create playlist. Please try again.');
        }
    });

    function showMainSection() {
        loginSection.classList.add('hidden');
        mainSection.classList.remove('hidden');
    }

    function displayRecommendations(tracks) {
        songsList.innerHTML = '';
        tracks.forEach(track => {
            const li = document.createElement('li');
            li.textContent = `${track.name} - ${track.artists.map(a => a.name).join(', ')}`;
            songsList.appendChild(li);
        });
        recommendationsList.classList.remove('hidden');
    }
}); 