const playButton = document.getElementById('play-button');
const shareButton = document.getElementById('share-button');
const circleContainer = document.getElementById('circle-of-fifths-container'); // Updated container ID
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

// Circle of Fifths Order (Major / Relative Minor)
// File names use 'b' for flat, 's' for sharp if needed, but display uses standard symbols.
// We need both display name and the key name used in the audio files.
const circleOfFifthsKeys = [
  { major: 'C', minor: 'Am' }, // 12 o'clock
  { major: 'G', minor: 'Em' }, // 1 o'clock
  { major: 'D', minor: 'Bm' }, // 2 o'clock
  { major: 'A', minor: 'Gbm' }, // 3 o'clock - Use Gbm for file consistency? Check filenames. Assuming F#m display, Gbm file? Let's stick to displayKeys convention for now. Need to verify filenames later. Using Abm/Gbm etc. as per original displayKeys
  { major: 'E', minor: 'Dbm' }, // 4 o'clock - C#m display, Dbm file?
  { major: 'B', minor: 'Abm' }, // 5 o'clock - G#m display, Abm file?
  { major: 'Gb', minor: 'Ebm' }, // 6 o'clock - F# display, Gb file? / D#m display, Ebm file?
  { major: 'Db', minor: 'Bbm' }, // 7 o'clock
  { major: 'Ab', minor: 'Fm' }, // 8 o'clock
  { major: 'Eb', minor: 'Cm' }, // 9 o'clock
  { major: 'Bb', minor: 'Gm' }, // 10 o'clock
  { major: 'F', minor: 'Dm' }, // 11 o'clock
];

// Use the keys defined above for song generation if needed, or keep original logic if filenames match displayKeys
// Let's keep the original song generation logic for now, assuming filenames align with the initial `displayKeys` structure.
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
const songs = originalSongs.flatMap((original) =>
  displayKeys.flatMap(({ major, minor }) => {
    const variations = [];
    if (original.endsWith('m')) {
      variations.push({
        originalSong: original,
        key: minor,
        audioFile: `song/${original}_${minor}.mp3`,
      });
    } else {
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
  // Make sure the random song's key exists in our circleOfFifthsKeys for selection
  let song;
  let keyExists = false;
  while (!keyExists) {
    song = songs[Math.floor(Math.random() * songs.length)];
    keyExists = circleOfFifthsKeys.some(
      (pair) => pair.major === song.key || pair.minor === song.key
    );
    if (!keyExists) {
      console.warn(
        `Generated song key ${song.key} not in circleOfFifthsKeys. Retrying...`
      );
      // If this happens often, review song generation or circleOfFifthsKeys list
    }
  }
  return song;
  // return songs[Math.floor(Math.random() * songs.length)]; // Original simple random pick
}

// Debounce function to limit resize calls
function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function displayCircleOfFifths() {
  circleContainer.innerHTML = ''; // Clear previous buttons

  // Get current dimensions
  const containerWidth = circleContainer.offsetWidth;
  const containerHeight = circleContainer.offsetHeight; // Assuming square, but use both for safety
  const baseSize = Math.min(containerWidth, containerHeight); // Use smaller dimension

  // Calculate dynamic sizes based on container size
  const outerRadius = (baseSize / 2) * 0.85; // Outer circle radius
  const innerRadius = outerRadius * 0.65; // Inner circle radius
  const buttonSize = baseSize * 0.15; // Button diameter (e.g., 15% of container size)
  const fontSize = baseSize * 0.04; // Font size (e.g., 4% of container size)

  const center = {
    x: containerWidth / 2,
    y: containerHeight / 2,
  };
  const totalKeys = circleOfFifthsKeys.length;

  circleOfFifthsKeys.forEach(({ major, minor }, index) => {
    const angle = (index / totalKeys) * 2 * Math.PI - Math.PI / 2; // Angle for this position

    // Calculate positions
    const xMaj = center.x + outerRadius * Math.cos(angle);
    const yMaj = center.y + outerRadius * Math.sin(angle);
    const xMin = center.x + innerRadius * Math.cos(angle);
    const yMin = center.y + innerRadius * Math.sin(angle);

    // Create Major Button
    const majorButton = createCircleKeyButton(
      major,
      'major',
      xMaj,
      yMaj,
      buttonSize,
      fontSize
    );
    circleContainer.appendChild(majorButton);

    // Create Minor Button
    const minorButton = createCircleKeyButton(
      minor,
      'minor',
      xMin,
      yMin,
      buttonSize,
      fontSize
    );
    circleContainer.appendChild(minorButton);
  });

  setButtonsAvailability(false); // Keep existing logic for enabling/disabling
}

function createCircleKeyButton(key, type, x, y, size, fontSize) {
  const button = document.createElement('button');
  button.textContent = key;
  button.classList.add('key-button', `${type}-key`);

  // Apply dynamic styles
  button.style.width = `${size}px`;
  button.style.height = `${size}px`;
  button.style.fontSize = `${fontSize}px`;
  // Adjust margin to center the button based on its dynamic size
  button.style.marginLeft = `-${size / 2}px`;
  button.style.marginTop = `-${size / 2}px`;
  // Set position
  button.style.left = `${x}px`;
  button.style.top = `${y}px`;

  button.addEventListener('click', () => handleKeyChoice(key, type)); // Reuse existing handler
  return button;
}

function setButtonsAvailability(available) {
  const buttons = circleContainer.getElementsByClassName('key-button'); // Select by class
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

// Debounced resize handler
const handleResize = debounce(() => {
  console.log('Resizing, redrawing circle...');
  displayCircleOfFifths();
  // Note: If buttons are disabled, they should remain disabled after redraw.
  // setButtonsAvailability needs to be called within displayCircleOfFifths
  // to ensure new buttons get the correct initial state.
}, 150); // Adjust debounce time (ms) as needed

// Add resize listener
window.addEventListener('resize', handleResize);

// Initialize the quiz
displayCircleOfFifths(); // Initial draw
startNewRound();
