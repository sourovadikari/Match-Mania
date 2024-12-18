// DOM elements
const gameContainer = document.getElementById('gameContainer');
const resetButton = document.getElementById('resetButton');

// Game variables
const symbols = ['🍎', '🍓', '🍇', '🍅', '🥥', '🫐', '🍊', '🥭', '🍑', '🍉'];
let shuffledSymbols = [...symbols, ...symbols].sort(() => 0.5 - Math.random());
let flippedCards = [];
const gameState = {
  matchedCards: 0,
  boardLocked: false,
  showingMessage: false,
  timer: null,
  seconds: 0,
  bestTime: null,
  timerDisplay: null
};

// Display messages
const displayMessage = (message) => {
  gameState.showingMessage = true; // Set flag to disable card flips
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'success');
  messageDiv.textContent = message;
  gameContainer.appendChild(messageDiv);

  resetButton.disabled = true;

  setTimeout(() => {
    messageDiv.remove();
    gameState.showingMessage = false; // Reset the flag after the message disappears
    resetButton.disabled = false;
  }, 2000);
};

// Create and shuffle board
const createBoard = () => {
  gameContainer.innerHTML = '';
  shuffledSymbols.forEach((symbol) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    gameContainer.appendChild(card);
  });
};

// Reset game
const resetGame = (showResetMessage = true) => {
  shuffledSymbols = [...symbols, ...symbols].sort(() => 0.5 - Math.random());
  flippedCards = [];
  gameState.matchedCards = 0;
  gameState.boardLocked = false;

  createBoard();
  stopTimer();

  if (showResetMessage) {
    displayMessage('Game Reset! Start Matching!');
    setTimeout(() => {
      gameState.seconds = 0;
      updateTimerDisplay();
      startTimer();
    }, 2000);
  } else {
    startTimer();
  }
};

// Flip card
const flipCard = (card) => {
  if (gameState.boardLocked || gameState.showingMessage || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  card.textContent = card.dataset.symbol;
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    gameState.boardLocked = true;
    setTimeout(checkMatch, 500);
  }
};

// Check if cards match
const checkMatch = () => {
  const [card1, card2] = flippedCards;

  if (!card1 || !card2) {
    flippedCards = [];
    gameState.boardLocked = false;
    return;
  }

  if (card1.dataset.symbol === card2.dataset.symbol) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    gameState.matchedCards += 2;

    // Check if all cards are matched (game won)
    if (gameState.matchedCards === shuffledSymbols.length) {
      stopTimer();

      // Check if it's a new best time and show popup
      const isNewBestTime = updateBestTimeDisplay();
      setTimeout(() => createWelcomeMessage(isNewBestTime), 500);
    }
  } else {
    card1.classList.remove('flipped');
    card2.classList.remove('flipped');
    card1.textContent = '';
    card2.textContent = '';
  }

  flippedCards = [];
  gameState.boardLocked = false;
};

// Timer functions
const startTimer = () => {
  if (gameState.timer) clearInterval(gameState.timer);
  gameState.seconds = 0;
  updateTimerDisplay();
  gameState.timer = setInterval(() => {
    gameState.seconds++;
    updateTimerDisplay();
  }, 1000);
};

const stopTimer = () => {
  clearInterval(gameState.timer);
  gameState.timer = null;
};

const updateTimerDisplay = () => {
  if (gameState.timerDisplay) gameState.timerDisplay.textContent = `Time: ${gameState.seconds}s`;
};

const updateBestTimeDisplay = () => {
  const isNewBestTime = gameState.bestTime === null || gameState.seconds < gameState.bestTime;

  if (isNewBestTime) {
    gameState.bestTime = gameState.seconds;
    document.getElementById('bestTime').textContent = `Best Time: ${gameState.bestTime}s`;
  }

  return isNewBestTime;
};

// Find cards in container
const findCardsinContainer = () => {
  gameContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('card')) flipCard(e.target);
  });
  resetButton.addEventListener('click', () => resetGame(true));
};

// Create disclaimer content popup
const disclaimerContent = () => {
  const rulesPopup = document.createElement('div');
  rulesPopup.classList.add('rules-popup');
  rulesPopup.innerHTML = `
    <div class="rules-content">
      <h2>Disclaimer</h2>
      <p>Welcome to the <span>Match Mania</span>! The goal of the game is to match all the pairs of cards as quickly as possible.</p>
      <h2>Game Instructions:</h2>
      <p>1️⃣ Click on a card to flip it over.</p>
      <p>2️⃣ Try to find a matching pair of cards.</p>
      <p>3️⃣ If the two flipped cards match, they will stay face up.</p>
      <p>4️⃣ If they don’t match, they will flip back over.</p>
      <p>5️⃣ Repeat until all cards are matched.</p>
      <p>6️⃣ The timer starts as soon as you start the game. The goal is to match all the pairs in the shortest amount of time.</p>
      <button class="start-button" id="startGameButton">Start Game</button>
    </div>
  `;
  document.body.prepend(rulesPopup);
  document.getElementById('startGameButton').addEventListener('click', () => {
    rulesPopup.remove();
    initGame();
  });
};

// Update copyright year dynamically
const updateYear = () => {
  const currentYear = new Date().getFullYear();
  document.getElementById('current-year').textContent = currentYear;
};

// Function to create the congratulatory popup message when a new best time is achieved
const createWelcomeMessage = (isNewBestTime) => {
  const winningTime = gameState.seconds; // Get the winning time
  const popup = document.createElement('div'); // Create a popup element
  popup.classList.add('popup');

  // Add HTML content for the popup
  popup.innerHTML = `
    <div class="popup-content">
      <h2>🥳 Congratulations 🎉</h2>
      <img src="/assets/trophy.png" loading="lazy">
      <p>You matched all cards in <strong>${winningTime}s</strong>!</p>
      <div class="congratulation-button-container">
        <button class="close-popup-button" id="closePopupButton">Close</button>
        ${isNewBestTime ? '<button class="share-score-button" id="shareScoreButton">Share</button>' : ''}
      </div>
    </div>
  `;

  document.body.appendChild(popup); // Append the popup to the body

  setTimeout(() => popup.classList.add('show'), 100); // Show the popup after a short delay

  resetButton.disabled = true; // Disable the reset button during the popup

  // Close popup event listener
  document.getElementById('closePopupButton').addEventListener('click', () => {
    popup.classList.remove('show');
    /*popup.addEventListener(
      'transitionend',
      () => {
        popup.remove();
        resetButton.disabled = false; // Enable reset button after popup is closed
        resetGame(false); // Reset the game
      }, { once: true }
    );*/
    popup.classList.remove('show');

setTimeout(() => {
  popup.remove();
  resetButton.disabled = false; // Enable reset button after popup is closed
  resetGame(false); // Reset the game
}, 500); // Match the transition duration (0.5s = 500ms)
  });

  // Share button event listener (only if it's a new best time)
  if (isNewBestTime) {
    const shareButton = document.getElementById('shareScoreButton');

    shareButton.addEventListener('click', () => {
      shareButton.disabled = true; // Disable the share button

      const userName = sessionStorage.getItem('userName');
      const userEmail = sessionStorage.getItem('userEmail');

      // Check if player info is in sessionStorage
      if (!userName || !userEmail) {
        createPlayerInfoForm(shareButton); // Ask for player info and re-enable share button later
      } else {
        attemptToShare(winningTime, shareButton); // Proceed to share
      }
    });
  }
};

// Function to create a form to collect player name and email
function createPlayerInfoForm(shareButton) {
  if (document.querySelector('.form-container')) return; // Avoid multiple forms

  const formContainer = document.createElement('div');
  formContainer.classList.add('form-container');

  formContainer.innerHTML = `
  <div class="form-content player-info-form">
    <h3>Enter your information to share your score</h3>
    <form id="playerInfoForm">
      <label for="playerName">Name: </label>
      <input type="text" id="playerName" name="name" required placeholder="Enter your name">
      <label for="playerEmail">Email: </label>
      <input type="email" id="playerEmail" name="email" required placeholder="Enter your email">
      <button type="submit">Submit</button>
    </form>
  </div>
  `;

  document.body.appendChild(formContainer);

  // Handle form submission
  document.getElementById('playerInfoForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const playerName = document.getElementById('playerName').value;
    const playerEmail = document.getElementById('playerEmail').value.toLowerCase();

    // Validate Name (no numbers, symbols, or emojis)
    const nameRegex = /^[a-zA-Z ]+$/; // Only letters and spaces
    if (!nameRegex.test(playerName)) {
      alert('Invalid name! Please use only letters and spaces. Symbols, numbers, and emojis are not allowed.');
      return; // Stop form submission
    }

    // Validate Email (no special characters like symbols)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // This regex only allows the standard characters allowed in email addresses, such as letters, numbers, dots, underscores, and plus signs
    if (!emailRegex.test(playerEmail)) {
      alert('Invalid email! Please enter a valid email address (e.g., user@example.com)');
      return; // Stop form submission
    }

    // Store player info in sessionStorage
    sessionStorage.setItem('userName', playerName);
    sessionStorage.setItem('userEmail', playerEmail);

    formContainer.remove(); // Remove the form
    shareButton.disabled = false; // Re-enable the share button

    attemptToShare(gameState.seconds, shareButton); // Proceed with sharing
  });
}

// Function to attempt sharing using Web Share API or download image
function attemptToShare(winningTime, shareButton) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1200;
  canvas.height = 630;

  // Disable the share button while processing
  shareButton.disabled = true;

  const userName = sessionStorage.getItem('userName');
  const userEmail = sessionStorage.getItem('userEmail');

  if (!userName || !userEmail) {
    createPlayerInfoForm(shareButton);
    return; // Prevent further execution if player info is missing
  }

  // Fetch user's IP address
  fetch('https://api.ipify.org?format=json')
    .then((response) => response.json())
    .then((data) => {
      const userIP = data.ip;

      // Load background image
      const backgroundImage = new Image();
      backgroundImage.src = '/assets/media-preview.jpg'; // Background image path

      backgroundImage.onload = () => {
        // Draw blurred background
        ctx.filter = 'blur(10px)';
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // Add gradient overlay
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#cc2b5e');
        gradient.addColorStop(1, '#753a88');
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;

        // Add watermark email
        ctx.globalAlpha = 0.3;
        ctx.font = 'bold 35px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(userEmail, canvas.width - 20, 40);
        ctx.fillText(userEmail, canvas.width - 20, 40);
        ctx.globalAlpha = 1.0;

        // Add stars (optional)
        drawStars(ctx, canvas.width, canvas.height);

        // Load signature image
        const signature = new Image();
        signature.src = '/assets/signature.png'; // Signature image path

        signature.onload = () => {
          ctx.globalAlpha = 0.2;
          const signatureSize = 100;
          const spacing = 130;

          for (let y = 0; y < canvas.height; y += spacing) {
            for (let x = 0; x < canvas.width; x += spacing) {
              ctx.save();
              ctx.translate(x + signatureSize / 2, y + signatureSize / 2);
              ctx.rotate(-Math.PI / 4);
              ctx.drawImage(signature, -signatureSize / 2, -signatureSize / 2, signatureSize, signatureSize);
              ctx.restore();
            }
          }

          ctx.globalAlpha = 1.0;

          // Load trophy image
          const trophy = new Image();
          trophy.src = '/assets/trophy.png';

          trophy.onload = () => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const circleRadius = 240;

            // Add golden circle
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.lineWidth = 8;
            ctx.strokeStyle = 'gold';
            ctx.stroke();

            // Add trophy
            const trophySize = 450;
            ctx.drawImage(trophy, centerX - trophySize / 2, centerY - trophySize / 2, trophySize, trophySize);
            ctx.globalAlpha = 1.0;

            // Load logo image
            const logo = new Image();
            logo.src = '/assets/logo.png';

            logo.onload = () => {
              ctx.drawImage(logo, 20, 20, 80, 80);
              ctx.font = 'bold 40px Arial';
              ctx.fillStyle = 'dodgerblue';
              ctx.textAlign = 'left';
              ctx.fillText('Match', 120, 53);
              ctx.fillText('Mania', 120, 95);

              // Load author details
              const authorImage = new Image();
              authorImage.src = '/assets/author.png';

              authorImage.onload = () => {
                const authorImgSize = 80;
                const authorImgX = canvas.width / 2 - 200;
                const authorImgY = canvas.height - 100; // Adjusted Y position for better spacing

                // Clip and draw author image
                ctx.save();
                ctx.beginPath();
                ctx.arc(authorImgX + authorImgSize / 2, authorImgY + authorImgSize / 2, authorImgSize / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(authorImage, authorImgX, authorImgY, authorImgSize, authorImgSize);
                ctx.restore();

                // Add author name and tag
                ctx.font = 'bold 30px Arial'; // Larger font size for the name
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.fillText('Sourov Chandra Adikari', authorImgX + authorImgSize + 15, authorImgY + 35);

                ctx.font = '25px Arial'; // Smaller font size for the tag
                ctx.fillStyle = '#ffffff';
                ctx.fillText('Developer & Designer', authorImgX + authorImgSize + 15, authorImgY + 66);

                // Add congratulations and user details with increased size and gap
                const congratsYStart = canvas.height / 6;
                const centerX = canvas.width / 2;

                ctx.font = 'bold 40px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText('🥳 Congratulations 🎉', centerX, congratsYStart);

                ctx.font = 'bold 35px Arial';
                ctx.fillText(`I matched all cards in ${winningTime} seconds!`, centerX, congratsYStart + 70);

                ctx.font = '35px Arial';
                const detailGap = 50;
                let detailsY = congratsYStart + 140;

                ctx.fillText(`Name: ${userName}`, centerX, detailsY);
                detailsY += detailGap;

                ctx.fillText(`Email: ${userEmail}`, centerX, detailsY);
                detailsY += detailGap;

                const currentDate = new Date();
                const date = currentDate.toLocaleDateString('en-US');
                const time = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const day = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

                ctx.fillText(`Date: ${date}`, centerX, detailsY);
                detailsY += detailGap;

                ctx.fillText(`Time: ${time}`, centerX, detailsY);
                detailsY += detailGap;

                ctx.fillText(`Day: ${day}`, centerX, detailsY);
                detailsY += detailGap;

                ctx.fillText(`IP: ${userIP}`, centerX, detailsY);

                const filename = `match-mania-${Date.now()}.png`;
                const canvasDataURL = canvas.toDataURL('image/png');
                const shareFile = new File([dataURLtoBlob(canvasDataURL)], filename, { type: 'image/png' });

                const shareData = {
                  title: 'Match Mania - New High Score!',
                  text: `I matched all the cards in ${winningTime} seconds. Can you beat my score?`,
                  files: [shareFile]
                };

                if (navigator.canShare && navigator.canShare({ files: shareData.files })) {
                  navigator.share(shareData)
                    .then(() => {
                      shareButton.disabled = false;
                    })
                    .catch(() => {
                      createDownloadForm(canvas, shareButton);
                    });
                } else {
                  createDownloadForm(canvas, shareButton);
                }
              };
            };
          };
        };
      };
    })
    .catch(() => {
      shareButton.disabled = false;
    });
}

// Create a form to ask if the user wants to download the image
function createDownloadForm(canvas, shareButton) {
  // Disable the share button as soon as the download form is triggered
  shareButton.disabled = true;

  if (document.querySelector('.form-container')) return; // Avoid multiple forms

  const formContainer = document.createElement('div');
  formContainer.classList.add('form-container');

  formContainer.innerHTML = `
    <div class="form-content download-form">
      <h3>Sharing failed!</h3>
      <p>Would you like to process sharing?</p>
      <form id="downloadForm">
        <button type="submit" id="downloadYes">Yes</button>
        <button type="button" id="downloadNo">No</button>
      </form>
    </div>
  `;

  document.body.appendChild(formContainer);

  // Format the date and time for the filename
  function getFormattedDateTime() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    return `${day}${month}${year}${hours}${minutes}.png`;
  }

  const filename = getFormattedDateTime();

  document.getElementById('downloadYes').addEventListener('click', function(event) {
    event.preventDefault();
    downloadCanvas(canvas, filename); // Trigger the download
    formContainer.remove();
    // Re-enable share button after download or close
    shareButton.disabled = false;
  });

  document.getElementById('downloadNo').addEventListener('click', function() {
    formContainer.remove(); // Remove the form if the user declines
    // Re-enable share button after closing form
    shareButton.disabled = false;
  });
}

// Function to download the canvas as an image file
function downloadCanvas(canvas, filename) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click(); // Trigger the download
}

// Draw stars in the middle of canvas 
function drawStars(ctx, canvasWidth, canvasHeight) {
  const numStars = 300; // Total number of stars

  // Coordinates for the center of the canvas (user data area)
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Generate stars
  for (let i = 0; i < numStars; i++) {
    // Calculate random positions across the canvas
    let randomX = Math.random() * canvasWidth;
    let randomY = Math.random() * canvasHeight;

    // Increase probability of placing stars closer to the center (user information area)
    const distanceToCenter = Math.sqrt(Math.pow(randomX - centerX, 2) + Math.pow(randomY - centerY, 2));
    const centerWeight = Math.exp(-distanceToCenter / 200); // The closer to the center, the higher the weight

    if (Math.random() < centerWeight) {
      randomX = centerX + (Math.random() - 0.5) * canvasWidth / 4; // Spread stars more around center
      randomY = centerY + (Math.random() - 0.5) * canvasHeight / 4; // Spread stars more around center
    }

    const starSize = Math.random() * 4 + 2; // Random star size between 2px and 6px
    const opacity = Math.random() * 0.6 + 0.4; // Random opacity between 0.4 and 1

    // Random color for each star
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);

    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;

    // Draw the star
    ctx.beginPath();
    ctx.arc(randomX, randomY, starSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Helper: Convert data URL to Blob
function dataURLtoBlob(dataURL) {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

// Initialize the game
const initGame = () => {
  createBoard();
  findCardsinContainer();
  startTimer();
  // Directly reference the elements to display the timer
  gameState.timerDisplay = document.getElementById('timer'); // Timer display
};

// Start the app
const startApp = () => {
  disclaimerContent();
  updateYear();
};

startApp(); // Run the app
