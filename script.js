// DOM elements
const gameContainer = document.getElementById('gameContainer');
const resetButton = document.getElementById('resetButton');

// Game variables
const symbols = ['🍎', '🍓', '🍏', '🍈', '🥥', '🫐', '🍊', '🥭', '🍑', '🍉'];
let shuffledSymbols = [...symbols, ...symbols].sort(() => 0.5 - Math.random());
let flippedCards = [];
const gameState = {
  matchedCards: 0,
  boardLocked: false,
  timer: null,
  seconds: 0,
  bestTime: null,
  timerDisplay: null
};

// Create and shuffle board
const createBoard = () => {
  gameContainer.innerHTML = '';
  shuffledSymbols.forEach((symbol) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    gameContainer.appendChild(card);
    card.addEventListener('click', () => {
      flipCard(card)
    })
  });
};

// Flip cards
const flipCard = (card) => {
  if (gameState.boardLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;

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
      const newBestTimeScore = updateBestTimeScore();
      setTimeout(() => congratulationsContent(newBestTimeScore), 500);
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

const updateBestTimeScore = () => {
  const newBestTimeScore = gameState.bestTime === null || gameState.seconds < gameState.bestTime;

  if (newBestTimeScore) {
    gameState.bestTime = gameState.seconds;
    document.getElementById('bestTime').textContent = `Best Time: ${gameState.bestTime}s`;
  }

  return newBestTimeScore;
};

// Create rules content popup
const createRules = () => {
  const rulesPopup = document.createElement('div');
  rulesPopup.classList.add('rules-popup');
  rulesPopup.innerHTML = `
    <div class="container rules-content">
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
    rulesPopup.style.opacity = '0';
    setTimeout(() => {
      rulesPopup.remove();
      initGame();
    }, 500)
  });
};

// Update copyright year dynamically
const updateYear = () => {
  const currentYear = new Date().getFullYear();
  document.getElementById('current-year').textContent = currentYear;
};

// Utility: Display a temporary message
const displayMessage = (message, duration = 2000) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.textContent = message;
  gameContainer.appendChild(messageDiv);

  // Temporarily disable interactions
  gameState.boardLocked = true;
  resetButton.disabled = true;

  // Remove the message after a delay
  setTimeout(() => {
    messageDiv.remove();
    resetButton.disabled = false;
    gameState.boardLocked = false;
  }, duration);
};

// Reset the game
const resetGame = (showMessage = true) => {
  // Lock the board during reset
  gameState.boardLocked = true;

  // Shuffle symbols and reset state
  shuffledSymbols = symbols.concat(symbols).sort(() => Math.random() - 0.5);
  flippedCards = [];
  gameState.matchedCards = 0;

  // Reset timer
  stopTimer();
  gameState.seconds = 0;
  updateTimerDisplay();

  // Recreate the board
  createBoard();

  if (showMessage) {
    // Show reset message and start timer after it disappears
    displayMessage('Game Reset! Start Matching!', 2000);
    setTimeout(startTimer, 2000);
  } else {
    // Unlock the board and start timer immediately
    gameState.boardLocked = false;
    startTimer();
  }
};

// Function to create the congratulatory popup message when a new best time is achieved
const congratulationsContent = (newBestTimeScore) => {
  const winningTime = gameState.seconds; // Get the winning time
  const popup = document.createElement('div'); // Create a popup element
  popup.classList.add('congratulations-popup');

  // Add HTML content for the popup
  popup.innerHTML = `
    <div class="container congratulations-content">
      <img src="/assets/victory.png" loading="lazy">
      <h2>🥳 Congratulations 🎉</h2>
      <p>You matched all cards in <strong>${winningTime}s</strong>!</p>
      <div class="button-container">
        <button class="close-popup-button" id="closePopupButton">Close</button>
        ${newBestTimeScore ? '<button class="share-score-button" id="shareScoreButton">Share</button>' : ''}
      </div>
    </div>
  `;

  document.body.appendChild(popup); // Append the popup to the body

  setTimeout(() => popup.classList.add('display'), 500); // Show the popup after a short delay

  resetButton.disabled = true; // Disable the reset button during the popup
  gameState.boardLocked = true;
  // Close popup event listener
  document.getElementById('closePopupButton').addEventListener('click', () => {
    popup.classList.toggle('display');

    setTimeout(() => {
      popup.remove();
      gameState.boardLocked = false;
      resetButton.disabled = false; // Enable reset button after popup is closed
      resetGame(false); // Reset the game
    }, 500); // Match the transition duration (0.5s = 500ms)
  });

  // Share button event listener (only if it's a new best time)
  if (newBestTimeScore) {
    const closePopupButton = document.getElementById('closePopupButton');
    const shareButton = document.getElementById('shareScoreButton');

    shareButton.addEventListener('click', () => {
      const userName = sessionStorage.getItem('userName');
      const userEmail = sessionStorage.getItem('userEmail');
      const userImage = sessionStorage.getItem('userImage');

      // Check if player info is in sessionStorage
      if (!userName || !userEmail || !userImage) {
        createPlayerInfoForm(closePopupButton, shareButton); // Ask for player info and re-enable share button later
      } else {
        createCanvas(winningTime, closePopupButton, shareButton); // Proceed to share
      }
    });
  }
};

// Create a form to ask user their name email and photo
const createPlayerInfoForm = (closePopupButton, shareButton) => {
  // Disable close and share buttons while displaying the form
  closePopupButton.disabled = true;
  shareButton.disabled = true;
  gameState.boardLocked = true;

  if (document.querySelector('.form-container')) return; // Avoid multiple forms

  const formContainer = document.createElement('div');
  formContainer.classList.add('form-container');

  formContainer.innerHTML = `
    <div class="container player-info-form">
      <h2>Enter your information to share your score</h2>
      <form id="playerInfoForm">
        <div class="input-section">
          <input type="text" id="playerName" name="name" placeholder="Enter your Name">
        </div>
        <div class="input-section">
          <input type="email" id="playerEmail" name="email" placeholder="Enter your email">
        </div>
        <div class="input-img-section">
          <input type="file" id="playerImage" name="image" accept="image/*">
          <label for="playerImage"><i class="sca-upload-cloud-2-line"></i>Upload image</label>
        </div>
        <div class="button-container">
          <button type="button" class="close-form-button" id="closeFormButton">Cancel</button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(formContainer);

  setTimeout(() => formContainer.classList.add('display'), 500); // Show the popup with animation

  const playerNameInput = document.getElementById('playerName');
  const playerEmailInput = document.getElementById('playerEmail');
  const playerImageInput = document.getElementById('playerImage');

  // Add listeners to dynamically remove error messages
  playerNameInput.addEventListener('input', () => removeError(playerNameInput));
  playerEmailInput.addEventListener('input', () => removeError(playerEmailInput));
  playerImageInput.addEventListener('change', () => removeError(playerImageInput));

  document.getElementById('playerInfoForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const playerName = playerNameInput.value.trim();
    const playerEmail = playerEmailInput.value.trim();
    const file = playerImageInput.files[0];

    // Sequential validation
    if (!validateName(playerName, playerNameInput)) return;
    if (!validateEmail(playerEmail, playerEmailInput)) return;
    if (!validateImage(file, playerImageInput)) return;

    compressImage(file, 800, 800, (compressedImage) => {
      // Store player info in sessionStorage
      sessionStorage.setItem('userName', playerName);
      sessionStorage.setItem('userEmail', playerEmail);
      sessionStorage.setItem('userImage', compressedImage);

      formContainer.classList.toggle('display');

      setTimeout(() => {
        formContainer.remove();
        closePopupButton.disabled = false;
        shareButton.disabled = false;
        createCanvas(gameState.seconds, closePopupButton, shareButton); // Proceed with sharing
      }, 500);
    });
  });

  // Handle form cancellation
  document.getElementById('closeFormButton').addEventListener('click', () => {
    formContainer.classList.toggle('display');
    setTimeout(() => {
      formContainer.remove();
      closePopupButton.disabled = false;
      shareButton.disabled = false;
    }, 500);
  });

  // Compress the image
  const compressImage = (file, maxWidth, maxHeight, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to 70% quality
        const compressedImage = canvas.toDataURL(file.type, 0.7);
        callback(compressedImage);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Helper functions
  const validateName = (name, inputElement) => {
    if (!name) {
      showError(inputElement, "Name is required.");
      return false;
    }
    const nameRegex = /^[a-zA-Z ]+$/; // Only letters and spaces
    if (!nameRegex.test(name)) {
      showError(inputElement, "Invalid name!");
      return false;
    }
    return true;
  };

  const validateEmail = (email, inputElement) => {
    if (!email) {
      showError(inputElement, "Email is required.");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      showError(inputElement, "Invalid email!");
      return false;
    }
    return true;
  };

  const validateImage = (file, inputElement) => {
    if (!file) {
      showErrorMessage(inputElement, "Image is required.");
      return false;
    }
    return true;
  };

  const showError = (inputElement, message) => {
    inputElement.classList.add("error");
    removeErrorMessage(inputElement);

    const errorElement = document.createElement("p");
    errorElement.textContent = message;
    errorElement.className = "dynamic-error";

    const parent = inputElement.closest(".input-section");
    parent.appendChild(errorElement);
  };

  const showErrorMessage = (inputElement, message) => {
    removeErrorMessage(inputElement);

    const errorElement = document.createElement("p");
    errorElement.textContent = message;
    errorElement.className = "dynamic-error";

    const parent = inputElement.closest(".input-img-section");
    parent.appendChild(errorElement);
  };

  const removeError = (inputElement) => {
    inputElement.classList.remove("error");
    removeErrorMessage(inputElement);
  };

 const removeErrorMessage = (inputElement) => {
    const parent = inputElement.closest(".input-section, .input-img-section");
    const errorElement = parent.querySelector(".dynamic-error");
    if (errorElement) errorElement.remove();
  };
};

// Function to create canvas & sharing using Web Share API or download image
const createCanvas = (winningTime, closePopupButton, shareButton) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1200;
  canvas.height = 630;

  closePopupButton.disabled = true;
  shareButton.disabled = true;

  const userName = sessionStorage.getItem('userName');
  const userEmail = sessionStorage.getItem('userEmail');
  const userImage = sessionStorage.getItem('userImage');

  if (!userName || !userEmail || !userImage) {
    createPlayerInfoForm(closePopupButton, shareButton);
    return;
  }

  fetchUserIP().then((userIP) => {
    drawBackground(ctx, canvas, () => {
      drawUserDetails(ctx, canvas, userEmail);
      drawStars(ctx, canvas.width, canvas.height);

      drawGoldenCircle(ctx, canvas, userImage, () => {
        drawLogo(ctx, canvas, () => {
          drawAuthorInfo(ctx, canvas, () => {
            drawCongratulations(ctx, canvas, winningTime, userName, userEmail, userIP);
            finalizeCanvas(ctx, canvas, winningTime, closePopupButton, shareButton);
          });
        });
      });
    });
  });
};
const fetchUserIP = () => {
  return fetch('https://api.ipify.org?format=json')
    .then((response) => response.json())
    .then((data) => data.ip)
    .catch(() => 'IP Not Available');
};
const drawBackground = (ctx, canvas, callback) => {
  const backgroundImage = new Image();
  backgroundImage.src = '/assets/media-preview.jpg';

  backgroundImage.onload = () => {
    ctx.filter = 'blur(5px)';
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#cc2b5e');
    gradient.addColorStop(1, '#753a88');
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

    callback();
  };
};
const drawUserDetails = (ctx, canvas, userEmail) => {
  ctx.globalAlpha = 0.3;
  ctx.font = 'bold 35px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeText(userEmail, canvas.width - 20, 40);
  ctx.fillText(userEmail, canvas.width - 20, 40);
  ctx.globalAlpha = 1.0;
};
const drawStars = (ctx, canvasWidth, canvasHeight) => {
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
};
const drawGoldenCircle = (ctx, canvas, userImage, callback) => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const circleRadius = 300;

  // Draw golden circle
  ctx.globalAlpha = 0.4; // Opacity for the golden circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'dodgerblue';
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Draw user image with reduced opacity
  const playerImage = new Image();
  playerImage.src = userImage;

  playerImage.onload = () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.globalAlpha = 0.5; // Reduce opacity of the user image
    const imageSize = circleRadius * 2; // Ensure image fits within the circle
    ctx.drawImage(
      playerImage,
      centerX - imageSize / 2,
      centerY - imageSize / 2,
      imageSize,
      imageSize
    );

    ctx.restore();
    ctx.globalAlpha = 1.0; // Reset opacity back to normal

    // Draw signature grid
    const signature = new Image();
    signature.src = '/assets/signature.png'; // Directly specifying the signature image

    signature.onload = () => {
      ctx.globalAlpha = 0.3; // Set opacity for the signature grid
      const signatureSize = 100; // Size of each signature
      const spacing = 130; // Spacing between signatures

      for (let y = 0; y < canvas.height; y += spacing) {
        for (let x = 0; x < canvas.width; x += spacing) {
          ctx.save();
          ctx.translate(x + signatureSize / 2, y + signatureSize / 2);
          ctx.rotate(-Math.PI / 4); // Rotate the signature
          ctx.drawImage(signature, -signatureSize / 2, -signatureSize / 2, signatureSize, signatureSize);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1.0; // Reset opacity for other drawings
      callback(); // Call the next step in the drawing pipeline
    };
  };
};
const drawLogo = (ctx, canvas, callback) => {
  const logo = new Image();
  logo.src = '/assets/logo.png';

  logo.onload = () => {
    ctx.drawImage(logo, 20, 20, 80, 80);
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = 'dodgerblue';
    ctx.textAlign = 'left';
    ctx.fillText('Match', 120, 53);
    ctx.fillText('Mania', 120, 95);
    callback();
  };
};
const drawAuthorInfo = (ctx, canvas, callback) => {
  const authorImage = new Image();
  authorImage.src = '/assets/author.png';

  authorImage.onload = () => {
    const authorImgSize = 80;
    const authorImgX = canvas.width / 2 - 200;
    const authorImgY = canvas.height - 100;

    ctx.save();
    ctx.beginPath();
    ctx.arc(authorImgX + authorImgSize / 2, authorImgY + authorImgSize / 2, authorImgSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(authorImage, authorImgX, authorImgY, authorImgSize, authorImgSize);
    ctx.restore();

    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('Sourov Chandra Adikari', authorImgX + authorImgSize + 15, authorImgY + 35);

    ctx.font = '25px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Developer & Designer', authorImgX + authorImgSize + 15, authorImgY + 66);

    callback();
  };
};
const drawCongratulations = (ctx, canvas, winningTime, userName, userEmail, userIP) => {
  const centerX = canvas.width / 2;
  const congratsYStart = canvas.height / 6;

  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('🥳 New High Score 🎉', centerX, congratsYStart);

  ctx.font = 'bold 35px Arial';
  ctx.fillText(`I matched all cards in ${winningTime} seconds!`, centerX, congratsYStart + 70);

  const detailGap = 50;
  let detailsY = congratsYStart + 140;

  const currentDate = new Date();
  const date = currentDate.toLocaleDateString('en-US');
  const time = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const day = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  ctx.fillText(`Name: ${userName}`, centerX, detailsY);
  detailsY += detailGap;

  ctx.fillText(`Email: ${userEmail}`, centerX, detailsY);
  detailsY += detailGap;

  ctx.fillText(`Date: ${date}`, centerX, detailsY);
  detailsY += detailGap;

  ctx.fillText(`Time: ${time}`, centerX, detailsY);
  detailsY += detailGap;

  ctx.fillText(`Day: ${day}`, centerX, detailsY);
  detailsY += detailGap;

  ctx.fillText(`IP: ${userIP}`, centerX, detailsY);
};
const finalizeCanvas = (ctx, canvas, winningTime, closePopupButton, shareButton) => {
  const filename = `match-mania-${Date.now()}.png`;
  const canvasDataURL = canvas.toDataURL('image/png');
  const shareFile = new File([dataURLtoBlob(canvasDataURL)], filename, { type: 'image/png' });

  const shareData = {
    title: 'Match Mania - New High Score!',
    text: `I matched all the cards in ${winningTime} seconds. Can you beat my score?`,
    files: [shareFile],
  };


  if (navigator.canShare && navigator.canShare(shareData)) {
    // Full sharing: Title, text, and file
    navigator.share({
        title: shareData.title,
        text: shareData.text,
        files: shareData.files,
      })
      .then(() => {
        closePopupButton.disabled = false;
        shareButton.disabled = false;
      })
      .catch(() => {
        createDownloadForm(canvas, closePopupButton, shareButton);
      });
  } else if (navigator.canShare && navigator.canShare({ files: shareData.files })) {
    // File-only sharing
    navigator.share({ files: shareData.files })
      .then(() => {
        closePopupButton.disabled = false;
        shareButton.disabled = false;
      })
      .catch(() => {
        createDownloadForm(canvas, closePopupButton, shareButton);
      });
  } else {
    // Fallback to download
    createDownloadForm(canvas, closePopupButton, shareButton);
  }


};

// Create a form to ask if the user wants to download the image
const createDownloadForm = (canvas, closePopupButton, shareButton) => {
  // Disable the share button as soon as the download form is triggered
  closePopupButton.disabled = true;
  shareButton.disabled = true;
  gameState.boardLocked = true;

  if (document.querySelector('.form-container')) return; // Avoid multiple forms

  const formContainer = document.createElement('div');
  formContainer.classList.add('form-container');

  formContainer.innerHTML = `
    <div class="container download-form">
      <h2>Sharing failed!</h2>
      <p>Would you like to process sharing?</p>
      <form class="button-container" id="downloadForm">
        <button type="submit" id="downloadYes">Yes</button>
        <button type="button" id="downloadNo">No</button>
      </form>
    </div>
  `;

  document.body.appendChild(formContainer);

  setTimeout(() => formContainer.classList.add('display'), 500); // Show the popup after a short delay

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
    formContainer.classList.toggle('display');
    setTimeout(() => {
      downloadCanvas(canvas, filename); // Trigger the download
      formContainer.remove();
      // Re-enable close and share button after download or close
      closePopupButton.disabled = false;
      shareButton.disabled = false;
    }, 500);
  });

  document.getElementById('downloadNo').addEventListener('click', function() {
    formContainer.classList.toggle('display');
    setTimeout(() => {
      formContainer.remove(); // Remove the form if the user declines
      // Re-enable close and share button after closing form
      closePopupButton.disabled = false;
      shareButton.disabled = false;
    }, 500);
  });
};

// Function to download the canvas as an image file
const downloadCanvas = (canvas, filename) => {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = filename;
  link.click(); // Trigger the download
};

// Helper: Convert data URL to Blob
const dataURLtoBlob = (dataURL) => {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

// Initialize the game
const initGame = () => {
  resetButton.addEventListener('click', () => { resetGame(true) })
  startTimer();
  // Directly reference the elements to display the timer
  gameState.timerDisplay = document.getElementById('timer'); // Timer display
};

// Start the app
const startApp = () => {
  createRules();
  createBoard();
  updateYear();
};

startApp(); // Run the app

function preventLandscape() {
  const existingOverlay = document.getElementById("landscape-overlay");

  if (window.matchMedia("(orientation: landscape)").matches) {
    // Create the landscape overlay if it doesn't already exist
    if (!existingOverlay) {
      const overlay = document.createElement("div");
      overlay.id = "landscape-overlay";
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        color: white;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        overflow: hidden;
      `;
      overlay.innerHTML = `
        <div class="landscape-content">
          <h1>Please rotate your device to portrait mode.</h1>
          <p>This site is optimized for portrait mode.</p>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    document.body.style.overflowY = 'hidden';
  } else {
    // Remove the landscape overlay if it exists
    if (existingOverlay) {
      existingOverlay.remove();
    }
    document.body.style.overflowY = 'scroll';
  }
}

// Initialize
window.addEventListener("resize", preventLandscape);
preventLandscape(); // Initial check
