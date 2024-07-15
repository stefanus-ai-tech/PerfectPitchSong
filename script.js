const playButton = document.getElementById('play-button');
const keyChoicesContainer = document.getElementById('key-choices');
const feedback = document.getElementById('feedback');
const scoreValue = document.getElementById('score-value');
const correctCount = document.getElementById('correct-count');
const incorrectCount = document.getElementById('incorrect-count');

let currentSong = null;
let audio = null;
let score = 0;
let correct = 0;
let incorrect = 0;
let snippetPlayed = false;

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

const originalSongs = ['Am', 'B']; // Add more songs as needed

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
    majorButton.addEventListener('click', () =>
      handleKeyChoice(major, 'major')
    );
    keyChoicesContainer.appendChild(majorButton);

    const minorButton = document.createElement('button');
    minorButton.textContent = minor;
    minorButton.classList.add('key-button');
    minorButton.addEventListener('click', () =>
      handleKeyChoice(minor, 'minor')
    );
    keyChoicesContainer.appendChild(minorButton);
  });
  setButtonsAvailability(false);
}

function setButtonsAvailability(available) {
  const buttons = keyChoicesContainer.getElementsByTagName('button');
  for (let button of buttons) {
    button.disabled = !available;
    button.style.opacity = available ? '1' : '0.5';
  }
}

function handleKeyChoice(selectedKey, selectedType) {
  if (!snippetPlayed) {
    feedback.textContent = 'Please play the snippet first!';
    feedback.style.color = 'orange';
    return;
  }
  checkAnswer(selectedKey, selectedType);
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
    correct++;
    scoreValue.textContent = score;
    correctCount.textContent = correct;
    correctCount.style.color = 'green';
  } else {
    incorrect++;
    incorrectCount.textContent = incorrect;
    incorrectCount.style.color = 'red';
  }

  setTimeout(() => {
    feedback.textContent = '';
    startNewRound();
  }, 2000);
}

function startNewRound() {
  currentSong = getRandomSong();
  playButton.textContent = 'Play Snippet';
  snippetPlayed = false;
  setButtonsAvailability(false);
  // Load the new audio file
  if (audio) {
    audio.pause();
  }
  audio = new Audio(currentSong.audioFile);
}

playButton.addEventListener('click', () => {
  if (playButton.textContent === 'Play Snippet') {
    audio
      .play()
      .then(() => {
        snippetPlayed = true;
        setButtonsAvailability(true);
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
