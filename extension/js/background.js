const CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // User needs to replace this
const REDIRECT_URI = chrome.identity.getRedirectURL();
const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_API_ENDPOINT = 'https://api.spotify.com/v1';
let accessToken = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'LOGIN':
            initiateLogin().then(sendResponse);
            return true;
        case 'GET_RECOMMENDATIONS':
            getRecommendations(request.data).then(sendResponse);
            return true;
        case 'CREATE_PLAYLIST':
            createPlaylist(request.data).then(sendResponse);
            return true;
    }
});

async function initiateLogin() {
    const scope = 'user-read-private playlist-modify-public playlist-modify-private';
    const authUrl = `${SPOTIFY_AUTH_ENDPOINT}?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;

    try {
        const redirectUrl = await chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
        });

        if (redirectUrl) {
            const hash = redirectUrl.split('#')[1];
            const params = new URLSearchParams(hash);
            accessToken = params.get('access_token');
            return { success: true, token: accessToken };
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return { success: false, error: 'Authentication failed' };
    }
}

async function getRecommendations({ genres, playlistId, mood }) {
    if (!accessToken) return { success: false, error: 'Not authenticated' };

    try {
        let seedTracks = [];
        if (playlistId) {
            const playlistTracks = await fetch(`${SPOTIFY_API_ENDPOINT}/playlists/${playlistId}/tracks?limit=5`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }).then(res => res.json());
            
            seedTracks = playlistTracks.items.map(item => item.track.id).join(',');
        }

        const moodParams = getMoodParameters(mood);
        const response = await fetch(`${SPOTIFY_API_ENDPOINT}/recommendations?${new URLSearchParams({
            seed_genres: genres,
            seed_tracks: seedTracks,
            ...moodParams,
            limit: 20
        })}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const data = await response.json();
        return { success: true, recommendations: data.tracks };
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return { success: false, error: 'Failed to get recommendations' };
    }
}

async function createPlaylist({ tracks, name = 'AutoPilot Recommendations' }) {
    if (!accessToken) return { success: false, error: 'Not authenticated' };

    try {
        // Get user ID
        const userResponse = await fetch(`${SPOTIFY_API_ENDPOINT}/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const userData = await userResponse.json();

        // Create playlist
        const createResponse = await fetch(`${SPOTIFY_API_ENDPOINT}/users/${userData.id}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                description: 'Created by Spotify AutoPilot',
                public: false
            })
        });
        const playlistData = await createResponse.json();

        // Add tracks to playlist
        await fetch(`${SPOTIFY_API_ENDPOINT}/playlists/${playlistData.id}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: tracks.map(track => track.uri)
            })
        });

        return { success: true, playlistId: playlistData.id };
    } catch (error) {
        console.error('Error creating playlist:', error);
        return { success: false, error: 'Failed to create playlist' };
    }
}

function getMoodParameters(mood) {
    switch (mood) {
        case 'energetic':
            return {
                min_energy: 0.7,
                min_tempo: 120,
                target_valence: 0.8
            };
        case 'relaxed':
            return {
                max_energy: 0.4,
                max_tempo: 100,
                target_valence: 0.5
            };
        case 'happy':
            return {
                target_valence: 0.8,
                target_energy: 0.6
            };
        case 'melancholic':
            return {
                target_valence: 0.3,
                max_energy: 0.5
            };
        default:
            return {};
    }
} 