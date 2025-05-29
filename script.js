document.addEventListener('DOMContentLoaded', () => {
    // --- Background Film Noise Canvas Effect ---
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');
    let noiseData;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        generateNoise();
    }

    function generateNoise() {
        noiseData = ctx.createImageData(canvas.width, canvas.height);
        const buffer = new Uint32Array(noiseData.data.buffer);

        for (let i = 0; i < buffer.length; i++) {
            const value = Math.floor(Math.random() * 255);
            const alpha = Math.floor(Math.random() * 20) + 5;
            buffer[i] = (alpha << 24) | (value << 16) | (value << 8) | value;
        }
    }

    function animateNoise() {
        ctx.putImageData(noiseData, 0, 0);
        generateNoise();
        requestAnimationFrame(animateNoise);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    resizeCanvas();
    animateNoise();

    // --- Custom Cursor ---
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 20 + 'px';
        cursor.style.top = e.clientY - 20 + 'px';
    });

    document.querySelectorAll('a, button, .top-song-item, .music-table-row').forEach(element => {
        element.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        element.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    // --- Smooth Scrolling for Navigation Links ---
    document.querySelectorAll('.footer-nav a, .hero-full-album-button').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Audio Player Functionality ---
    const audioSource = document.getElementById('audio-source');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const loopBtn = document.getElementById('loop-btn');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongArtist = document.getElementById('current-song-artist');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const topSongItems = document.querySelectorAll('.top-song-item');

    let playlist = [
        { title: 'Sakchu ra', artist: 'THASINN69', src: 'src/Sakchu ra.mp3' },
        { title: 'Navanerai', artist: 'THASINN69', src: 'src/Navanerai.mp3' },
        { title: 'Pardaina', artist: 'THASINN69', src: 'src/pardaina.mp3' },
        { title: 'Maya', artist: 'THASINN69', src: 'src/Maya.wav' },
        { title: 'Mitho samjhana', artist: 'THASINN69', src: 'src/Mithosamjhana.mp3' },
        { title: 'Dhilo', artist: 'THASINN69', src: 'src/Dhilo.mp3' }
    ];

    let currentSongIndex = 0;
    let isPlaying = false;
    let isShuffling = false;
    let isLooping = false;
    let shuffledPlaylist = [];

    function loadSong(songIndex) {
        currentSongIndex = songIndex;
        const song = isShuffling && shuffledPlaylist.length > 0 ? shuffledPlaylist[currentSongIndex] : playlist[currentSongIndex];
        audioSource.src = song.src;
        currentSongTitle.textContent = song.title;
        currentSongArtist.textContent = song.artist;
        audioSource.load();
    }

    function playSong() {
        isPlaying = true;
        playPauseBtn.querySelector('i').classList.remove('fa-play');
        playPauseBtn.querySelector('i').classList.add('fa-pause');
        audioSource.play();
    }

    function pauseSong() {
        isPlaying = false;
        playPauseBtn.querySelector('i').classList.remove('fa-pause');
        playPauseBtn.querySelector('i').classList.add('fa-play');
        audioSource.pause();
    }

    function nextSong() {
        if (isShuffling) {
            currentSongIndex = (currentSongIndex + 1) % shuffledPlaylist.length;
        } else {
            currentSongIndex = (currentSongIndex + 1) % playlist.length;
        }
        loadSong(currentSongIndex);
        playSong();

        // Update active album
        updateActiveAlbum(currentSongIndex);
    }

    function prevSong() {
        if (isShuffling) {
            currentSongIndex = (currentSongIndex - 1 + shuffledPlaylist.length) % shuffledPlaylist.length;
        } else {
            currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        }
        loadSong(currentSongIndex);
        playSong();

        // Update active album
        updateActiveAlbum(currentSongIndex);
    }

    function toggleShuffle() {
        isShuffling = !isShuffling;
        shuffleBtn.classList.toggle('active', isShuffling);
        if (isShuffling) {
            shuffledPlaylist = [...playlist].sort(() => Math.random() - 0.5);
            const currentPlayingSong = playlist[currentSongIndex];
            currentSongIndex = shuffledPlaylist.findIndex(song => song.title === currentPlayingSong.title);
        } else {
            const currentPlayingSong = shuffledPlaylist[currentSongIndex];
            currentSongIndex = playlist.findIndex(song => song.title === currentPlayingSong.title);
        }
        loadSong(currentSongIndex);
        if (isPlaying) playSong();

        // Update active album
        updateActiveAlbum(currentSongIndex);
    }

    function toggleLoop() {
        isLooping = !isLooping;
        audioSource.loop = isLooping;
        loopBtn.classList.toggle('active', isLooping);
    }

    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }

    function setProgressBar(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioSource.duration;
        audioSource.currentTime = (clickX / width) * duration;
    }

    playPauseBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    shuffleBtn.addEventListener('click', toggleShuffle);
    loopBtn.addEventListener('click', toggleLoop);
    audioSource.addEventListener('timeupdate', updateProgress);
    progressContainer.addEventListener('click', setProgressBar);

    audioSource.addEventListener('ended', () => {
        if (!isLooping) {
            nextSong();
        } else {
            playSong();
        }
    });

    // --- Music Section Functionality ---
    const albumData = [
        {
            artist: 'THASINN69',
            title: 'Sakchu ra',
            genreLabel: 'Pop / Independent',
            year: '2024',
            cover: 'src/Sakchu ra.jpg'
        },
        {
            artist: 'THASINN69',
            title: 'Navanerai',
            genreLabel: 'R&B / Independent',
            year: '2023',
            cover: 'https://placehold.co/120x80/2a2a2a/FFF?text=ALBUM+2'
        },
        {
            artist: 'THASINN69',
            title: 'Pardaina',
            genreLabel: 'Soul / Independent',
            year: '2022',
            cover: 'src/pardina.wav'
        },
        {
            artist: 'THASINN69',
            title: 'Maya',
            genreLabel: 'Acoustic / Independent',
            year: '2021',
            cover: 'https://placehold.co/120x80/4a4a4a/FFF?text=ALBUM+4'
        },
        {
            artist: 'THASINN69',
            title: 'Mitho samjhana',
            genreLabel: 'Folk / Independent',
            year: '2020',
            cover: 'https://placehold.co/120x80/5a5a5a/FFF?text=ALBUM+5'
        },
        {
            artist: 'THASINN69',
            title: 'Dhilo',
            genreLabel: 'Ballad / Independent',
            year: '2019',
            cover: 'https://placehold.co/120x80/6a6a6a/FFF?text=ALBUM+6'
        }
    ];

    const musicTableBody = document.querySelector('.music-table-body');

    // Dynamically generate table rows
    function generateMusicTable() {
        musicTableBody.innerHTML = ''; // Clear existing rows
        albumData.forEach((album, index) => {
            const row = document.createElement('tr');
            row.classList.add('music-table-row');
            row.dataset.index = index;

            // Initially, the first row is active
            if (index === 0) {
                row.classList.add('active-row');
                row.innerHTML = `
                    <td class="music-table-td">
                        <div class="image-cell">
                            <div class="album-cover-container" data-index="${index}">
                                <img src="${album.cover}" alt="Album Cover ${index + 1}" class="album-cover-img">
                                <div class="album-cover-overlay">
                                    <span class="overlay-artist">${album.artist}</span>
                                    <span class="overlay-title">${album.title}</span>
                                    <span class="overlay-genre-label">${album.genreLabel}</span>
                                    <span class="overlay-year">${album.year}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td class="music-table-td">
                        <span class="inactive-album-title">${album.title}</span>
                    </td>
                `;
            }

            musicTableBody.appendChild(row);
        });
    }

    // Update the active album
    function updateActiveAlbum(index) {
        const rows = document.querySelectorAll('.music-table-row');
        rows.forEach((row, rowIndex) => {
            row.classList.remove('active-row');
            const album = albumData[rowIndex];
            if (rowIndex === index) {
                row.classList.add('active-row');
                row.innerHTML = `
                    <td class="music-table-td">
                        <div class="image-cell">
                            <div class="album-cover-container" data-index="${rowIndex}">
                                <img src="${album.cover}" alt="Album Cover ${rowIndex + 1}" class="album-cover-img">
                                <div class="album-cover-overlay">
                                    <span class="overlay-artist">${album.artist}</span>
                                    <span class="overlay-title">${album.title}</span>
                                    <span class="overlay-genre-label">${album.genreLabel}</span>
                                    <span class="overlay-year">${album.year}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td class="music-table-td">
                        <span class="inactive-album-title">${album.title}</span>
                    </td>
                `;
            }
        });
    }

    // Initial table generation
    generateMusicTable();

    // Handle clicks on table rows
    musicTableBody.addEventListener('click', (e) => {
        const row = e.target.closest('.music-table-row');
        if (row) {
            const index = parseInt(row.dataset.index);
            currentSongIndex = index; // Sync with audio player
            loadSong(index);
            playSong();
            updateActiveAlbum(index);
        }
    });

    // Sync with top songs section
    topSongItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            loadSong(index);
            playSong();
            updateActiveAlbum(index % albumData.length); // Map to album data
        });
    });

    // Initial load
    loadSong(0);
});