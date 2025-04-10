# Spotify AutoPilot Chrome Extension

A Chrome extension that helps you discover new music on Spotify based on your interests and existing playlists.

## Features

- Get song recommendations based on your preferred genres
- Use existing playlists as a basis for recommendations
- Adjust recommendations based on mood
- Automatically create new playlists from recommendations
- Modern and user-friendly interface

## Setup Instructions

1. Clone this repository or download the files
2. Create a Spotify Developer account and register your application:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new application
   - Add `chrome-extension://<your-extension-id>/` to the Redirect URIs
   - Note down your Client ID

3. Update the extension with your Spotify Client ID:
   - Open `extension/js/background.js`
   - Replace `YOUR_SPOTIFY_CLIENT_ID` with your actual Spotify Client ID

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `extension` folder

## Usage

1. Click the extension icon in Chrome
2. Log in with your Spotify account
3. Enter your preferences:
   - Type in your preferred genres (comma-separated)
   - Optionally, enter a Spotify playlist ID to base recommendations on
   - Select your desired mood
4. Click "Get Recommendations" to see suggested songs
5. Click "Create Playlist" to save the recommendations as a new Spotify playlist

## Getting Playlist IDs

To get a playlist ID:
1. Open the playlist in Spotify
2. Click the "..." menu
3. Go to "Share" > "Copy link to playlist"
4. The ID is the string of characters after "playlist/" in the URL

## Development

The extension is built using:
- HTML/CSS/JavaScript
- Chrome Extension Manifest V3
- Spotify Web API

## File Structure

```
extension/
├── manifest.json
├── html/
│   └── popup.html
├── css/
│   └── popup.css
└── js/
    ├── background.js
    └── popup.js
```

## Contributing

Feel free to submit issues and enhancement requests!