const playButton = document.getElementById('play-button');
const keyChoicesContainer = document.getElementById('key-choices');
const feedback = document.getElementById('feedback');
const scoreValue = document.getElementById('score-value');

let currentSong = null;
let audio = null;
let score = 0;

// Define display names and corresponding file names
const displayKeys = [
  { major: 'C', minor: 'Am' },
  { major: 'Db', minor: 'Bbm' },
  { major: 'D', minor: 'Bm' },
  { major: 'Eb', minor: 'Cm' },
  { major: 'E', minor: 'Dbm' },
  { major: 'F', minor: 'Dm' },
  { major: 'Gb', minor: 'Ebm' },
  { major: 'G', minor: 'Em' },
  { major: 'Ab', minor: 'Fm' },
  { major: 'A', minor: 'Gbm' },
  { major: 'Bb', minor: 'Gm' },
  { major: 'B', minor: 'Abm' },
];

const originalSongs = ['Am', 'B']; //, 'C', 'Cm'];

// Generate song variations
const songs = originalSongs.flatMap((original) =>
  displayKeys.flatMap(({ major, minor }) => {
    const variations = [];
    if (original.endsWith('m')) {
      // If the original song is minor
      variations.push({
        originalSong: original,
        key: minor,
        audioFile: `song/${original}_${minor}.mp3`,
      });
    } else {
      // If the original song is major
      variations.push({
        originalSong: original,
        key: major,
        audioFile: `song/${original}_${major}.mp3`,
      });
    }
    return variations;
  })
);

function getRandomSong() {
  return songs[Math.floor(Math.random() * songs.length)];
}

function displayKeyChoices() {
  keyChoicesContainer.innerHTML = '';
  displayKeys.forEach(({ major, minor }) => {
    const majorButton = document.createElement('button');
    majorButton.textContent = major;
    majorButton.classList.add('key-button');
    majorButton.addEventListener('click', () => checkAnswer(major, 'major'));
    keyChoicesContainer.appendChild(majorButton);

    const minorButton = document.createElement('button');
    minorButton.textContent = minor;
    minorButton.classList.add('key-button');
    minorButton.addEventListener('click', () => checkAnswer(minor, 'minor'));
    keyChoicesContainer.appendChild(minorButton);
  });
}

function showFeedback(isCorrect) {
  feedback.textContent = isCorrect
    ? 'Correct!'
    : `Incorrect. The correct key was ${currentSong.key}.`;
  feedback.style.color = isCorrect ? 'green' : 'red';
}

function checkAnswer(selectedKey, selectedType) {
  const isCorrect =
    (selectedType === 'major' && currentSong.key === selectedKey) ||
    (selectedType === 'minor' && currentSong.key === selectedKey);

  showFeedback(isCorrect);

  if (isCorrect) {
    score++;
    scoreValue.textContent = score;
  }

  setTimeout(() => {
    feedback.textContent = '';
    startNewRound();
  }, 2000);
}

function startNewRound() {
  currentSong = getRandomSong();
  playButton.textContent = 'Play Snippet';
  // Load the new audio file
  if (audio) {
    audio.pause();
  }
  audio = new Audio(currentSong.audioFile);
  /*
  console.log(
    `Debug: Playing ${currentSong.originalSong} transposed to ${currentSong.key}`
  ); // For debugging*/
}

playButton.addEventListener('click', () => {
  if (playButton.textContent === 'Play Snippet') {
    audio
      .play()
      .then(() => {
        //console.log(`Debug: Playing ${currentSong.audioFile}`); // For debugging
      })
      .catch((error) => {
        console.error('Error playing audio:', error);
      });
    playButton.textContent = 'Stop';
  } else {
    audio.pause();
    playButton.textContent = 'Play Snippet';
  }
  audio.addEventListener('error', function () {
    console.error('Failed to load audio:', currentSong.audioFile);
  });

  audio.addEventListener('canplaythrough', function () {
    console.log('Audio can play through.');
  });
});

// Initialize the quiz
displayKeyChoices();
startNewRound();
