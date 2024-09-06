const playButton = document.getElementById('play-button');
const shareButton = document.getElementById('share-button');
const keyChoicesContainer = document.getElementById('key-choices-container');
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
  { major: 'C', minor: 'Cm' },
  { major: 'Db', minor: 'Dbm' },
  { major: 'D', minor: 'Dm' },
  { major: 'Eb', minor: 'Ebm' },
  { major: 'E', minor: 'Em' },
  { major: 'F', minor: 'Fm' },
  { major: 'Gb', minor: 'Gbm' },
  { major: 'G', minor: 'Gm' },
  { major: 'Ab', minor: 'Abm' },
  { major: 'A', minor: 'Am' },
  { major: 'Bb', minor: 'Bbm' },
  { major: 'B', minor: 'Bm' },
];

const originalSongs = ['Am', 'B', 'Bbm', 'A', 'A2']; // Add more songs as needed

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

// ... (keep your existing variable declarations and functions)

function displayKeyChoices() {
  const majorKeysColumn = document.querySelector('#major-keys .keys-column');
  const minorKeysColumn = document.querySelector('#minor-keys .keys-column');

  majorKeysColumn.innerHTML = '';
  minorKeysColumn.innerHTML = '';

  displayKeys.forEach(({ major, minor }) => {
    const majorButton = createKeyButton(major, 'major');
    const minorButton = createKeyButton(minor, 'minor');

    majorKeysColumn.appendChild(majorButton);
    minorKeysColumn.appendChild(minorButton);
  });

  setButtonsAvailability(false);
}

function createKeyButton(key, type) {
  const button = document.createElement('button');
  button.textContent = key;
  button.classList.add('key-button', `${type}-key`);
  button.addEventListener('click', () => handleKeyChoice(key, type));
  return button;
}

// ... (keep the rest of your existing code)

function createKeyButton(key, type) {
  const button = document.createElement('button');
  const span = document.createElement('span');
  span.textContent = key;
  button.appendChild(span);
  button.classList.add('key-button', `${type}-key`);
  button.addEventListener('click', () => handleKeyChoice(key, type));
  return button;
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

// Share button functionality
shareButton.addEventListener('click', () => {
  const shareLink = `https://stefanus-ai-tech.github.io/PerfectPitchSong`;
  navigator.clipboard
    .writeText(
      `My score is ${score}\nTrue ${correct}\nFalse ${incorrect}\nLet me know how you did on ${shareLink}`
    )
    .then(() => {
      alert('Achievement link copied to clipboard!');
    })
    .catch((error) => {
      console.error('Could not copy text: ', error);
    });
});

// Initialize the quiz
displayKeyChoices();
startNewRound();
