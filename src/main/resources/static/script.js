document.addEventListener("DOMContentLoaded", () => {
  // --- Elements ---
  const startScreen = document.getElementById("start-screen");
  const loginScreen = document.getElementById("login-screen");
  const gameMenuScreen = document.getElementById("game-menu-screen");
  const gameContentScreen = document.getElementById("game-content-screen"); // Corrected ID

  const startGameButton = document.getElementById("start-game-button");
  const resumeGameButton = document.getElementById("resume-game-button");
  const newGameButton = document.getElementById("new-game-button");
  const settingsButton = document.getElementById("settings-button");
  const settingsButtonIngame = document.getElementById("settings-button-ingame");
  const backButton = document.getElementById("back-button");
  const loginForm = document.getElementById("login-form");
  const showSignupButton = document.getElementById("show-signup-button");

  const loggedOutView = document.getElementById("logged-out-view");
  const loggedInView = document.getElementById("logged-in-view");
  const loginNavButton = document.getElementById("login-nav-button");
  const profileButton = document.getElementById("profile-nav-button");
  const logoutButton = document.getElementById("logout-button");
  const muteButton = document.getElementById("mute-button");
  const aboutButton = document.getElementById("about-button");

  const profileDropdown = document.getElementById("profile-dropdown");
  const dropdownUsername = document.getElementById("dropdown-username");
  const xpLevelEl = document.getElementById("xp-level");
  const xpBarFill = document.getElementById("xp-bar-fill");
  const dropdownXpText = document.getElementById("dropdown-xp-text");
  const dropdownGold = document.getElementById("dropdown-gold");

  const dropdownAchievements = document.getElementById("dropdown-achievements");
  const achievementsScreen = document.getElementById("achievements-screen");
  const achievementsBackButton = document.getElementById("achievements-back-button");

  const newTaskInput = document.getElementById("new-task-input");
  const addTaskButton = document.getElementById("add-task-button");

  // --- NEW SHOOTER GAME ELEMENTS ---
  const shooterGameScreen = document.getElementById("shooter-game-screen");
  const gameCanvas = document.getElementById("game-canvas");
  const ctx = gameCanvas ? gameCanvas.getContext("2d") : null;
  const returnToTasksButton = document.getElementById("return-to-tasks-button");
  const startShooterButton = document.getElementById("start-shooter-button");

  let gameInterval = null;
  let keys = {}; // To track pressed keys for continuous movement

  // --- GAME STATE ---
  let playerShip = {};
  let asteroids = [];
  let lasers = [];
  let aliens = [];
  let score = 0;
  let gameOver = false;
  let lastSpawnTime = 0; // For controlling enemy spawn rate
  const INITIAL_HP = 3; // Base HP before level upgrades

  // --- GAME CONFIG (Level-Based Upgrades) ---
  const SHIP_CONFIG = (level) => {
      // Base stats (Level 1)
      let config = {
          speed: 5,
          hp: INITIAL_HP,
          fireRate: 200, // ms between shots
          laserCount: 1, // Lasers per shot
          laserSpeed: 10
      };

      // Apply Upgrades based on RPG Level
      if (level > 1) {
          config.speed += (level - 1) * 0.5; // +0.5 speed per level
      }
      if (level >= 5) {
          config.hp++; // +1 HP at level 5
      }
      if (level >= 10) {
          config.laserCount = 2; // Double laser at level 10
          config.fireRate = 150; // Faster fire rate
      }

      return config;
  };

  // --- Helper functions for intro/tutorial ---
  const delay = ms => new Promise(res => setTimeout(res, ms));

  async function startIntro() {
      const introText = document.getElementById('intro-text');

      // Hide all other main screens
      startScreen?.classList.add("hidden");
      gameMenuScreen?.classList.add("hidden");
      loginScreen?.classList.add("hidden");
      gameContentScreen?.classList.add('hidden');
      shooterGameScreen?.classList.add('hidden'); // Ensure shooter game is hidden initially

      // Show the intro screen
      document.getElementById('intro-screen')?.classList.remove('hidden');

      introText.textContent = "In the year 3025, the galaxy is ruled by procrastination...";
      await delay(3000);

      introText.textContent = "A lone pilot must rise to conquer the ultimate foe...";
      await delay(3000);

      introText.textContent = "The beast of the Unfinished Task List: ZY'GON.";
      await delay(4000);

      // Hide the intro and start the shooter game
      document.getElementById('intro-screen')?.classList.add('hidden');
      startGameShooter();
  }

  async function startTutorial() {
      const overlay = document.getElementById('tutorial-overlay');
      const step1 = document.getElementById('tutorial-step-1');
      const step2 = document.getElementById('tutorial-step-2');
      const step3 = document.getElementById('tutorial-step-3');

      overlay.classList.remove('hidden');
      step1.classList.remove('hidden');

      await new Promise(resolve => {
          step1.querySelector('.tutorial-next').onclick = resolve;
      });

      step1.classList.add('hidden');
      step2.classList.remove('hidden');

      await new Promise(resolve => {
          step2.querySelector('.tutorial-next').onclick = resolve;
      });

      step2.classList.add('hidden');
      step3.classList.remove('hidden');

      await new Promise(resolve => {
          step3.querySelector('.tutorial-finish').onclick = resolve;
      });

      overlay.classList.add('hidden');
      step3.classList.add('hidden');
      localStorage.setItem('questifyTutorialCompleted', 'true');
  }

  // --- Original helper functions ---
  function showDropdown() {
    if (!profileDropdown || !profileButton) return;
    profileDropdown.classList.add("show");
    profileButton.classList.add("active");
  }

  function showGameScreen() {
      // Show the task page
      startScreen?.classList.add("hidden");
      gameMenuScreen?.classList.add("hidden");
      shooterGameScreen?.classList.add("hidden"); // Ensure game is hidden
      gameContentScreen?.classList.remove("hidden");
      loadGameData();

      // Tutorial logic: show only after the first game session (if not completed)
      if (localStorage.getItem('questifyTutorialCompleted') !== 'true') {
          startTutorial();
      }
  }

  function hideDropdown() {
    if (!profileDropdown || !profileButton) return;
    profileDropdown.classList.remove("show");
    profileButton.classList.remove("active");
  }

  // ... (loadGameData function remains unchanged) ...
  async function loadGameData() {
      const playerString = localStorage.getItem("questifyPlayer");
      if (!playerString) return;
      const player = JSON.parse(playerString);

      // Part 1: Update Player Stats
      const playerName = document.getElementById("player-name");
      const playerLevel = document.getElementById("player-level");
      const playerXpText = document.getElementById("player-xp-text");
      const playerGold = document.getElementById("player-gold");
      const playerXpFill = document.getElementById("player-xp-fill");

      playerName.textContent = player.username;
      playerLevel.textContent = `Lvl ${player.level}`;
      playerGold.textContent = `Gold: ${player.gold}`;
      const xpNeeded = player.level * 100;
      playerXpText.textContent = `${player.xp} / ${xpNeeded} XP`;
      playerXpFill.style.width = `${(player.xp / xpNeeded) * 100}%`;

      dropdownUsername.textContent = player.username;
      xpLevelEl.textContent = `Lvl ${player.level}`;
      dropdownGold.textContent = `Gold: ${player.gold}`;
      dropdownXpText.textContent = `${player.xp} / ${xpNeeded} XP`;
      xpBarFill.style.width = `${(player.xp / xpNeeded) * 100}%`;

      // Part 2: Fetch BOTH Task Lists
      const taskList = document.getElementById("task-list");
      const questList = document.getElementById("quest-list");
      taskList.innerHTML = "<li>Loading...</li>";
      questList.innerHTML = "<li>Loading...</li>";

      try {
          const [myTasksResponse, questBoardResponse] = await Promise.all([
              fetch(`http://localhost:8080/api/tasks/player/${player.id}`),
              fetch(`http://localhost:8080/api/tasks/quest-board`)
          ]);

          if (!myTasksResponse.ok) throw new Error("Failed to fetch player tasks.");
          if (!questBoardResponse.ok) throw new Error("Failed to fetch quest board.");

          const myTasks = await myTasksResponse.json();
          const questBoardTasks = await questBoardResponse.json();

          // Display "My Tasks"
          taskList.innerHTML = "";
          if (myTasks.length === 0) {
              taskList.innerHTML = "<li>No active objectives. Input one below!</li>";
          } else {
              myTasks.forEach(task => {
                  const li = document.createElement("li");
                  li.className = 'task-item';
                  const taskText = document.createElement('span');
                  taskText.textContent = task.description;
                  const completeButton = document.createElement('button');
                  completeButton.textContent = '✓';
                  completeButton.className = 'complete-btn';
                  completeButton.addEventListener('click', async () => {
                      try {
                          const completeResponse = await fetch(`http://localhost:8080/api/tasks/${task.id}/complete`, {
                              method: 'POST'
                          });
                          if (!completeResponse.ok) throw new Error('Failed to complete objective.');
                          const updatedPlayer = await completeResponse.json();
                          localStorage.setItem('questifyPlayer', JSON.stringify(updatedPlayer));
                          loadGameData();
                      } catch (error) {
                          console.error('Error completing task:', error);
                          alert('Could not complete the objective.');
                      }
                   });
                  li.appendChild(taskText);
                  li.appendChild(completeButton);
                  taskList.appendChild(li);
              });
          }

          // Display "Quest Board"
          questList.innerHTML = "";
          if (questBoardTasks.length === 0) {
              questList.innerHTML = "<li>No missions available right now.</li>";
          } else {
              questBoardTasks.forEach(quest => {
                  const li = document.createElement("li");
                  li.className = 'task-item';
                  const questText = document.createElement('span');
                  questText.textContent = quest.description;
                  const acceptButton = document.createElement('button');
                  acceptButton.textContent = 'Accept';
                  acceptButton.className = 'accept-btn';
                  acceptButton.addEventListener('click', async () => {
                      const taskData = { description: quest.description };
                      const response = await fetch(`http://localhost:8080/api/tasks/player/${player.id}/create`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(taskData)
                      });
                      if (response.ok) {
                          loadGameData();
                      } else {
                          alert("Failed to accept mission.");
                      }
                  });
                  li.appendChild(questText);
                  li.appendChild(acceptButton);
                  questList.appendChild(li);
              });
          }
      } catch (error) {
          console.error("Error loading data:", error);
          taskList.innerHTML = "<li>Error loading objectives.</li>";
          questList.innerHTML = "<li>Error loading missions.</li>";
      }
  }


  // UI update based on localStorage
    function updateUI() {
        const playerString = localStorage.getItem("questifyPlayer");
        if (playerString) {
            const player = JSON.parse(playerString);

            if (player.level > 1) {
                // Player is returning, show the resume menu
                startScreen?.classList.add("hidden");
                gameMenuScreen?.classList.remove("hidden");
            } else {
                // Player is new or has no progress, show the start menu
                startScreen?.classList.remove("hidden");
                gameMenuScreen?.classList.add("hidden");
            }

            // The rest of the function remains the same
            loginScreen?.classList.add("hidden");
            loggedOutView?.classList.add("hidden");
            loggedInView?.classList.remove("hidden");

            dropdownUsername && (dropdownUsername.textContent = player.username ?? "Player");
            dropdownGold && (dropdownGold.textContent = `Gold: ${player.gold ?? 0}`);
            const level = player.level ?? 1;
            xpLevelEl && (xpLevelEl.textContent = `Lvl ${level}`);
            const xpNeeded = level * 100;
            const xp = player.xp ?? 0;
            const pct = Math.max(0, Math.min(100, (xp / xpNeeded) * 100));
            xpBarFill && (xpBarFill.style.width = `${pct}%`);
            dropdownXpText && (dropdownXpText.textContent = `${xp} / ${xpNeeded} XP`);

            hideDropdown();
        } else {
            // logged out state
            startScreen?.classList.remove("hidden");
            loginScreen?.classList.add("hidden");
            gameMenuScreen?.classList.add("hidden");
            loggedOutView?.classList.remove("hidden");
            loggedInView?.classList.add("hidden");
            hideDropdown();
        }
    }

  // --- SHOOTER GAME LOGIC ---

  function initializeShip() {
    const playerString = localStorage.getItem("questifyPlayer");
    const player = JSON.parse(playerString);
    const config = SHIP_CONFIG(player.level || 1); // Get upgraded stats

    playerShip = {
        x: gameCanvas.width / 2,
        y: gameCanvas.height - 50,
        width: 30,
        height: 30,
        color: '#00ff99', // Neon Green/Cyan
        ...config,
        lastShotTime: 0,
        currentHp: config.hp, // Use currentHp for in-game health
    };
    asteroids = [];
    aliens = [];
    lasers = [];
    score = 0;
  }

  function drawPixelBox(x, y, w, h, color) {
      if (!ctx) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
  }

  function drawShip() {
      // Simple pixelated spaceship (a block)
      drawPixelBox(playerShip.x - playerShip.width / 2, playerShip.y - playerShip.height / 2, playerShip.width, playerShip.height, playerShip.color);

      // Draw HP/Shields (as a simple pixel bar)
      const hpBarWidth = 8;
      const hpBarSpacing = 12;
      for (let i = 0; i < playerShip.currentHp; i++) {
          drawPixelBox(playerShip.x - (playerShip.hp * hpBarSpacing / 2) + (i * hpBarSpacing), playerShip.y + 20, hpBarWidth, 4, '#ff00ff');
      }
  }

  function drawGameObjects() {
      if (!ctx) return;
      ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

      // Draw Ship
      drawShip();

      // Draw Lasers
      lasers.forEach(l => drawPixelBox(l.x, l.y, 4, 10, '#ff00ff'));

      // Draw Asteroids (White)
      asteroids.forEach(a => drawPixelBox(a.x, a.y, a.size, a.size, '#ffffff'));

      // Draw Aliens (Red)
      aliens.forEach(a => drawPixelBox(a.x, a.y, 20, 20, '#e74c3c'));
  }

  function updateShip() {
      // ASWD Movement control
      if (keys['a']) playerShip.x = Math.max(playerShip.x - playerShip.speed, playerShip.width / 2);
      if (keys['d']) playerShip.x = Math.min(playerShip.x + playerShip.speed, gameCanvas.width - playerShip.width / 2);
      if (keys['w']) playerShip.y = Math.max(playerShip.y - playerShip.speed, playerShip.height / 2);
      if (keys['s']) playerShip.y = Math.min(playerShip.y + playerShip.speed, gameCanvas.height - playerShip.height / 2);

      // Firing logic
      if (keys[' '] && Date.now() > playerShip.lastShotTime + playerShip.fireRate) {
          // Player Ship Laser Firing
          for (let i = 0; i < playerShip.laserCount; i++) {
              let offset = 0;
              if (playerShip.laserCount > 1) {
                  offset = (i === 0) ? -8 : 8; // Offset for double lasers
              }
              lasers.push({
                  x: playerShip.x + offset,
                  y: playerShip.y - playerShip.height/2,
                  speed: playerShip.laserSpeed
              });
          }
          playerShip.lastShotTime = Date.now();
      }
  }

  function updateGameObjects() {
      // Move lasers
      lasers = lasers.filter(l => (l.y -= l.speed) > 0);

      // Simple Asteroid Spawning (and alien spawning logic can be added here)
      const now = Date.now();
      if (now > lastSpawnTime + 1000) { // Spawn every second
          if (Math.random() < 0.5) { // 50% chance for asteroid
              asteroids.push({
                  x: Math.random() * gameCanvas.width,
                  y: -20,
                  speed: Math.random() * 2 + 1,
                  size: 10 + Math.random() * 10
              });
          } else { // 50% chance for alien
              aliens.push({
                  x: Math.random() * gameCanvas.width,
                  y: -20,
                  speed: Math.random() * 1 + 0.5,
                  hp: 1
              });
          }
          lastSpawnTime = now;
      }

      // Move enemies/asteroids
      asteroids = asteroids.filter(a => (a.y += a.speed) < gameCanvas.height);
      aliens = aliens.filter(a => (a.y += a.speed) < gameCanvas.height);

      // --- Simple Collision Detection ---
      // 1. Lasers vs Aliens/Asteroids
      for (let i = lasers.length - 1; i >= 0; i--) {
          const laser = lasers[i];

          // Check for Alien hit
          for (let j = aliens.length - 1; j >= 0; j--) {
              const alien = aliens[j];
              // Basic rectangular collision check (replace with better logic in a full game)
              if (laser.x < alien.x + 20 && laser.x + 4 > alien.x &&
                  laser.y < alien.y + 20 && laser.y + 10 > alien.y) {

                  score += 10;
                  aliens.splice(j, 1); // Remove alien
                  lasers.splice(i, 1); // Remove laser
                  i--; // Adjust outer loop index after splice
                  break;
              }
          }

          // Check for Asteroid hit (if laser still exists)
          if (i >= 0) {
              for (let j = asteroids.length - 1; j >= 0; j--) {
                  const asteroid = asteroids[j];
                  if (laser.x < asteroid.x + asteroid.size && laser.x + 4 > asteroid.x &&
                      laser.y < asteroid.y + asteroid.size && laser.y + 10 > asteroid.y) {

                      asteroids.splice(j, 1); // Destroy asteroid
                      lasers.splice(i, 1); // Remove laser
                      i--; // Adjust outer loop index
                      break;
                  }
              }
          }
      }

      // 2. Ship vs Aliens/Asteroids (simple damage model)
      [...asteroids, ...aliens].forEach((enemy, index, array) => {
          // Ship collision
          if (playerShip.x - playerShip.width/2 < enemy.x + (enemy.size || 20) && playerShip.x + playerShip.width/2 > enemy.x &&
              playerShip.y - playerShip.height/2 < enemy.y + (enemy.size || 20) && playerShip.y + playerShip.height/2 > enemy.y) {

              playerShip.currentHp--; // Take damage
              array.splice(index, 1); // Remove enemy
          }
      });
  }


  function gameLoop() {
      if (gameOver) {
          clearInterval(gameInterval);
          document.getElementById('game-overlay').classList.remove('hidden');
          return;
      }

      updateShip();
      updateGameObjects();
      drawGameObjects();

      // Check if player HP is zero
      if (playerShip.currentHp <= 0) {
          gameOver = true;
          // You would send the score to the backend here for XP/Gold rewards
          document.getElementById('game-score').textContent = `SCORE: ${score}`;
      }
  }

  // --- SCREEN TRANSITIONS & EVENTS ---

  function startGameShooter() {
      const screens = document.querySelectorAll('.screen');
      screens.forEach(s => s.classList.add('hidden'));

      shooterGameScreen?.classList.remove('hidden');
      document.getElementById('game-overlay').classList.add('hidden');

      // Reset game state
      gameOver = false;
      initializeShip();

      // Start the game loop
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
  }


  // --- Event listeners ---
  function showLogin() {
    startScreen?.classList.add("hidden");
    gameMenuScreen?.classList.add("hidden");
    loginScreen?.classList.remove("hidden");
    hideDropdown();
  }

  startGameButton?.addEventListener("click", () => {
      const playerString = localStorage.getItem("questifyPlayer");
      if (playerString) {
          startIntro(); // Start the intro, which leads to the shooter game
      } else {
          showLogin();
      }
  });

  loginNavButton?.addEventListener("click", showLogin);

  resumeGameButton?.addEventListener("click", startGameShooter); // Resume leads straight to game

  document.getElementById("quit-to-menu")?.addEventListener("click", () => {
    gameContentScreen?.classList.add("hidden");
    gameMenuScreen?.classList.remove("hidden");
  });

  newGameButton?.addEventListener("click", () => alert("Starting a new game!"));
  settingsButton?.addEventListener("click", () => alert("Settings screen goes here!"));
  settingsButtonIngame?.addEventListener("click", () => alert("Settings screen goes here!"));

  profileButton?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!profileDropdown) return;
    profileDropdown.classList.toggle("show");
    profileButton.classList.toggle("active");
  });

  addTaskButton?.addEventListener("click", async () => {
      const description = newTaskInput.value.trim();
      if (!description) {
          alert("Objective description cannot be empty.");
          return;
      }
      const playerString = localStorage.getItem("questifyPlayer");
      if (!playerString) return;
      const player = JSON.parse(playerString);
      const taskData = { description: description };
      try {
          const response = await fetch(`http://localhost:8080/api/tasks/player/${player.id}/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(taskData)
          });
          if (!response.ok) {
              throw new Error("Failed to add objective.");
          }
          newTaskInput.value = "";
          loadGameData();
      } catch (error) {
          console.error("Error adding task:", error);
          alert("Could not add objective.");
      }
  });

  // Connect the new "CONTINUE MISSION" button on the task page
  startShooterButton?.addEventListener('click', startGameShooter);

  // Connect the "RETURN TO BASE" button on game over
  returnToTasksButton?.addEventListener('click', () => {
      shooterGameScreen?.classList.add('hidden');
      showGameScreen(); // Function that shows the task page (game-content-screen)
  });


  document.addEventListener("click", (e) => {
    const clickedInsideDropdown = profileDropdown && profileDropdown.contains(e.target);
    const clickedProfileBtn = profileButton && profileButton.contains(e.target);
    if (!clickedInsideDropdown && !clickedProfileBtn) {
      hideDropdown();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideDropdown();
  });

  // --- Keyboard input for Shooter Game (ASWD and Space) ---
  document.addEventListener('keydown', (e) => {
      // Only handle input if the shooter screen is active
      if (shooterGameScreen && !shooterGameScreen.classList.contains('hidden')) {
          const key = e.key.toLowerCase();
          if (key === 'a' || key === 's' || key === 'w' || key === 'd' || key === ' ') {
              keys[key] = true;
              if (key === ' ') e.preventDefault(); // Prevent spacebar from scrolling page
          }
      }
  });

  document.addEventListener('keyup', (e) => {
      if (shooterGameScreen && !shooterGameScreen.classList.contains('hidden')) {
          const key = e.key.toLowerCase();
          if (key === 'a' || key === 's' || key === 'w' || key === 'd' || key === ' ') {
              keys[key] = false;
          }
      }
  });
  // --- End Shooter Input ---


  loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");
      const loginData = {
          username: usernameInput?.value?.trim(),
          password: passwordInput?.value,
      };
      try {
          const response = await fetch("http://localhost:8080/api/players/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(loginData),
          });
          if (!response.ok) {
              if (response.status === 404) {
                  alert("Pilot not found. Please click 'Sign Up' to create an account.");
              } else {
                  alert("Invalid username or password.");
              }
              return;
          }
          const player = await response.json();
          localStorage.setItem("questifyPlayer", JSON.stringify(player));
          alert(`Welcome back, Commander ${player.username}!`);
          updateUI();
      } catch (error) {
          console.error("Login Error:", error);
          alert("Could not connect to the server. Please try again later.");
      }
  });

  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("questifyPlayer");
    localStorage.removeItem('questifyTutorialCompleted');
    hideDropdown();
    updateUI();
  });

  dropdownAchievements?.addEventListener("click", (e) => {
      e.stopPropagation();
      hideDropdown();
      achievementsScreen?.classList.remove("hidden");
  });

  achievementsBackButton?.addEventListener("click", () => {
      achievementsScreen?.classList.add("hidden");
  });

  backButton?.addEventListener("click", () => {
    loginScreen?.classList.add("hidden");
    updateUI();
  });

  showSignupButton?.addEventListener("click", async () => {
      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");
      const newUser = {
          username: usernameInput?.value?.trim(),
          password: passwordInput?.value,
      };
      if (!newUser.username || !newUser.password) {
          alert("Username and password cannot be empty.");
          return;
      }
      try {
          const response = await fetch("http://localhost:8080/api/players/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newUser),
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || "Failed to create account.");
          }
          const createdPlayer = await response.json();
          alert(`Account created for ${createdPlayer.username}! You are now logged in.`);
          localStorage.setItem("questifyPlayer", JSON.stringify(createdPlayer));
          updateUI();
      } catch (error) {
          console.error("Signup Error:", error);
          alert(error.message);
      }
  });

  muteButton?.addEventListener("click", () => muteButton.classList.toggle("muted"));
  aboutButton?.addEventListener("click", () => alert("About/Credits screen goes here!"));

  // Initialize
  updateUI();
});