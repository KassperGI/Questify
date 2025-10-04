document.addEventListener("DOMContentLoaded", () => {
  // --- Elements ---
  const startScreen = document.getElementById("start-screen");
  const loginScreen = document.getElementById("login-screen");
  const gameMenuScreen = document.getElementById("game-menu-screen");
  const gameContentScreen = document.getElementById("game-content");

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
  console.log("Found Achievements Button:", dropdownAchievements);
  const achievementsScreen = document.getElementById("achievements-screen");
  const achievementsBackButton = document.getElementById("achievements-back-button");

  const newTaskInput = document.getElementById("new-task-input");
  const addTaskButton = document.getElementById("add-task-button");

  // helper: safe class toggles
  function showDropdown() {
    if (!profileDropdown || !profileButton) return;
    profileDropdown.classList.add("show");
    profileButton.classList.add("active");
  }
  function showGameScreen() {
      startScreen?.classList.add("hidden");
      gameMenuScreen?.classList.add("hidden");
      const gameContentScreen = document.getElementById("game-content-screen");
      gameContentScreen?.classList.remove("hidden");
      loadGameData();
  }
  function hideDropdown() {
    if (!profileDropdown || !profileButton) return;
    profileDropdown.classList.remove("show");
    profileButton.classList.remove("active");
  }
  async function loadGameData() {
      const playerString = localStorage.getItem("questifyPlayer");
      if (!playerString) return;
      const player = JSON.parse(playerString);

      // --- Part 1: Update the Player Stats Panel ---
      const playerName = document.getElementById("player-name");
      const playerLevel = document.getElementById("player-level");
      const playerXpText = document.getElementById("player-xp-text");
      const playerGold = document.getElementById("player-gold"); // <-- THIS LINE WAS LIKELY MISSING
      const playerXpFill = document.getElementById("player-xp-fill");

      playerName.textContent = player.username;
      playerLevel.textContent = `Lvl ${player.level}`;
      playerGold.textContent = `Gold: ${player.gold}`;
      const xpNeeded = player.level * 100;
      playerXpText.textContent = `${player.xp} / ${xpNeeded} XP`;
      playerXpFill.style.width = `${(player.xp / xpNeeded) * 100}%`;

      // --- Part 2: Fetch and Display Tasks ---
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

          // (The rest of the function to display tasks is the same as the one I sent before)
          // ...
           // --- Display "My Tasks" ---
          taskList.innerHTML = "";
          if (myTasks.length === 0) {
              taskList.innerHTML = "<li>No active tasks. Add one below!</li>";
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
                          if (!completeResponse.ok) throw new Error('Failed to complete task.');

                          const updatedPlayer = await completeResponse.json();
                          localStorage.setItem('questifyPlayer', JSON.stringify(updatedPlayer));
                          loadGameData();

                      } catch (error) {
                          console.error('Error completing task:', error);
                          alert('Could not complete the task.');
                      }
                   });
                  li.appendChild(taskText);
                  li.appendChild(completeButton);
                  taskList.appendChild(li);
              });
          }

          // --- Display "Quest Board" Tasks ---
          questList.innerHTML = "";
          if (questBoardTasks.length === 0) {
              questList.innerHTML = "<li>No quests available right now.</li>";
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
                          alert("Failed to accept quest.");
                      }
                  });

                  li.appendChild(questText);
                  li.appendChild(acceptButton);
                  questList.appendChild(li);
              });
          }

      } catch (error) {
          console.error("Error loading data:", error);
          taskList.innerHTML = "<li>Error loading tasks.</li>";
          questList.innerHTML = "<li>Error loading quests.</li>";
      }
  }

  // UI update based on localStorage
  function updateUI() {
      const playerString = localStorage.getItem("questifyPlayer");
      if (playerString) {
          const player = JSON.parse(playerString);

          // --- THIS IS THE NEW LOGIC ---
          // Check if the player has made progress (level > 1)
          if (player.level > 1) {
              // Player is returning, show the resume menu
              startScreen?.classList.add("hidden");
              gameMenuScreen?.classList.remove("hidden");
          } else {
              // Player is new or has no progress, show the start menu
              startScreen?.classList.remove("hidden");
              gameMenuScreen?.classList.add("hidden");
          }

          // Hide the login screen since we are logged in
          loginScreen?.classList.add("hidden");

          // The rest of the function remains the same
          loggedOutView?.classList.add("hidden");
          loggedInView?.classList.remove("hidden");

          // fill dropdown values safely
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

  // --- Event listeners ---

  // Show login screen (Start or header login)
  function showLogin() {
    startScreen?.classList.add("hidden");
    gameMenuScreen?.classList.add("hidden");
    loginScreen?.classList.remove("hidden");
    hideDropdown();
  }
  startGameButton?.addEventListener("click", () => {
      const playerString = localStorage.getItem("questifyPlayer");
      if (playerString) {
          // If the player is logged in, go to the main game screen
          showGameScreen();
      } else {
          // If the player is NOT logged in, show the login form
          showLogin();
      }
  });
  loginNavButton?.addEventListener("click", showLogin);

  // Resume Game (go to game content)
  resumeGameButton?.addEventListener("click", showGameScreen);

  // Quit to menu from placeholder game content
  document.getElementById("quit-to-menu")?.addEventListener("click", () => {
    gameContentScreen?.classList.add("hidden");
    gameMenuScreen?.classList.remove("hidden");
  });

  // New game / settings placeholders
  newGameButton?.addEventListener("click", () => alert("Starting a new game!"));
  settingsButton?.addEventListener("click", () => alert("Settings screen goes here!"));
  settingsButtonIngame?.addEventListener("click", () => alert("Settings screen goes here!"));

  // Toggle profile dropdown (click)
  profileButton?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!profileDropdown) return;
    profileDropdown.classList.toggle("show");
    profileButton.classList.toggle("active");
  });

  addTaskButton?.addEventListener("click", async () => {
      const description = newTaskInput.value.trim();
      if (!description) {
          alert("Task description cannot be empty.");
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
              throw new Error("Failed to add task.");
          }

          newTaskInput.value = ""; // Clear the input box
          loadGameData(); // Reload the task list to show the new task

      } catch (error) {
          console.error("Error adding task:", error);
          alert("Could not add task.");
      }
  });

  // Auto-close dropdown on outside click
  document.addEventListener("click", (e) => {
    const clickedInsideDropdown = profileDropdown && profileDropdown.contains(e.target);
    const clickedProfileBtn = profileButton && profileButton.contains(e.target);
    if (!clickedInsideDropdown && !clickedProfileBtn) {
      hideDropdown();
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideDropdown();
  });

  // PASTE THIS NEW CODE IN ITS PLACE
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
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(loginData),
          });

          if (!response.ok) {
              if (response.status === 404) {
                  alert("User not found. Please click 'Sign Up' to create an account.");
              } else {
                  alert("Invalid username or password.");
              }
              return;
          }

          const player = await response.json();

          localStorage.setItem("questifyPlayer", JSON.stringify(player));
          alert(`Welcome back, ${player.username}!`);
          updateUI();

      } catch (error) {
          console.error("Login Error:", error);
          alert("Could not connect to the server. Please try again later.");
      }
  });

  // Logout
  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("questifyPlayer");
    hideDropdown();
    updateUI();
  });

  dropdownAchievements?.addEventListener("click", (e) => {
      e.stopPropagation();
      hideDropdown(); // First, close the profile dropdown
      achievementsScreen?.classList.remove("hidden"); // Then, show the achievements screen
  });

  // ADD this new event listener for the 'Back' button
  achievementsBackButton?.addEventListener("click", () => {
      achievementsScreen?.classList.add("hidden"); // Hide the achievements screen
  });

  // Back from login
  backButton?.addEventListener("click", () => {
    loginScreen?.classList.add("hidden");
    updateUI();
  });

  // Sign up (CONNECTS TO BACKEND)
  // Inside script.js
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
              // THIS PART IS IMPROVED
              // Read the specific error message from the backend
              const errorData = await response.json();
              throw new Error(errorData.message || "Failed to create account.");
          }

          const createdPlayer = await response.json();
          alert(`Account created for ${createdPlayer.username}! You are now logged in.`);

          localStorage.setItem("questifyPlayer", JSON.stringify(createdPlayer));
          updateUI();

      } catch (error) {
          console.error("Signup Error:", error);
          alert(error.message); // This will now show the specific message
      }
  });
  // Mute / About placeholders
  muteButton?.addEventListener("click", () => muteButton.classList.toggle("muted"));
  aboutButton?.addEventListener("click", () => alert("About/Credits screen goes here!"));

  // Initialize
  updateUI();
});