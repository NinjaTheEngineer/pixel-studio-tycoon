(function () {
  "use strict";

  var SAVE_KEY = "pixel-studio-tycoon-save-v1";
  var PROJECT_COST = 25;
  var RELEASE_MONEY = 20;
  var RELEASE_FANS = 5;
  var MAX_OFFLINE_SECONDS = 60 * 60 * 4;

  var defaultState = {
    version: 1,
    code: 0,
    money: 0,
    fans: 0,
    games: 0,
    codePerClick: 1,
    codePerSecond: 0,
    keyboardPurchased: false,
    developerHired: false,
    lastSavedAt: Date.now()
  };

  var elements = {
    money: document.getElementById("money-value"),
    fans: document.getElementById("fans-value"),
    games: document.getElementById("games-value"),
    production: document.getElementById("production-value"),
    code: document.getElementById("code-value"),
    progress: document.getElementById("project-progress"),
    progressFill: document.getElementById("progress-fill"),
    status: document.getElementById("status-message"),
    saveStatus: document.getElementById("save-status"),
    codeButton: document.getElementById("code-button"),
    publishButton: document.getElementById("publish-button"),
    keyboardButton: document.getElementById("keyboard-button"),
    developerButton: document.getElementById("developer-button"),
    keyboardLevel: document.getElementById("keyboard-level"),
    developerLevel: document.getElementById("developer-level"),
    resetButton: document.getElementById("reset-button"),
    resetDialog: document.getElementById("reset-dialog"),
    confirmReset: document.getElementById("confirm-reset")
  };

  var state = loadState();
  applyOfflineProgress();
  render();

  elements.codeButton.addEventListener("click", function () {
    if (state.code >= PROJECT_COST) return;
    state.code = Math.min(PROJECT_COST, state.code + state.codePerClick);
    setMessage(state.code >= PROJECT_COST ? "Your game is ready. Publish it!" : "You wrote " + state.codePerClick + " code.");
    saveAndRender();
  });

  elements.publishButton.addEventListener("click", function () {
    if (state.code < PROJECT_COST) return;
    state.code = 0;
    state.money += RELEASE_MONEY;
    state.fans += RELEASE_FANS;
    state.games += 1;
    setMessage("Game published! You earned $" + RELEASE_MONEY + " and " + RELEASE_FANS + " fans.");
    saveAndRender();
  });

  elements.keyboardButton.addEventListener("click", function () {
    if (state.money < 20 || state.keyboardPurchased) return;
    state.money -= 20;
    state.keyboardPurchased = true;
    state.codePerClick = 2;
    setMessage("Mechanical Keyboard purchased. Clicking now produces 2 code.");
    saveAndRender();
  });

  elements.developerButton.addEventListener("click", function () {
    if (state.money < 50 || state.developerHired) return;
    state.money -= 50;
    state.developerHired = true;
    state.codePerSecond = 1;
    setMessage("Junior Developer hired. Production continues automatically.");
    saveAndRender();
  });

  elements.resetButton.addEventListener("click", function () {
    elements.resetDialog.showModal();
  });

  elements.confirmReset.addEventListener("click", function () {
    localStorage.removeItem(SAVE_KEY);
    state = Object.assign({}, defaultState, { lastSavedAt: Date.now() });
    setMessage("A new studio has been started.");
    saveAndRender();
  });

  window.setInterval(function () {
    if (state.codePerSecond > 0 && state.code < PROJECT_COST) {
      state.code = Math.min(PROJECT_COST, state.code + state.codePerSecond);
      if (state.code >= PROJECT_COST) setMessage("Your developer finished the game. Publish it!");
      render();
    }
  }, 1000);

  window.setInterval(saveState, 5000);
  window.addEventListener("pagehide", saveState);

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved || saved.version !== 1) return Object.assign({}, defaultState);
      return Object.assign({}, defaultState, saved);
    } catch (error) {
      return Object.assign({}, defaultState);
    }
  }

  function applyOfflineProgress() {
    if (!state.codePerSecond || !state.lastSavedAt) return;
    var elapsed = Math.max(0, Math.floor((Date.now() - state.lastSavedAt) / 1000));
    var offlineSeconds = Math.min(elapsed, MAX_OFFLINE_SECONDS);
    var produced = Math.min(PROJECT_COST - state.code, offlineSeconds * state.codePerSecond);
    if (produced > 0) {
      state.code += produced;
      setMessage("Your developer produced " + produced + " code while you were away.");
    }
  }

  function saveAndRender() {
    saveState();
    render();
  }

  function saveState() {
    try {
      state.lastSavedAt = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      elements.saveStatus.textContent = "Saved locally";
    } catch (error) {
      elements.saveStatus.textContent = "Save unavailable";
    }
  }

  function setMessage(message) {
    elements.status.textContent = message;
  }

  function render() {
    var progressPercent = Math.min(100, state.code / PROJECT_COST * 100);
    elements.money.textContent = "$" + state.money;
    elements.fans.textContent = String(state.fans);
    elements.games.textContent = String(state.games);
    elements.production.textContent = state.codePerSecond + "/s";
    elements.code.textContent = Math.floor(state.code) + " / " + PROJECT_COST + " code";
    elements.progressFill.style.width = progressPercent + "%";
    elements.progress.setAttribute("aria-valuenow", String(Math.floor(state.code)));
    elements.codeButton.textContent = "Write code +" + state.codePerClick;
    elements.publishButton.disabled = state.code < PROJECT_COST;
    elements.keyboardButton.disabled = state.money < 20 || state.keyboardPurchased;
    elements.developerButton.disabled = state.money < 50 || state.developerHired;
    elements.keyboardButton.textContent = state.keyboardPurchased ? "Purchased" : "Buy Â· $20";
    elements.developerButton.textContent = state.developerHired ? "Hired" : "Hire Â· $50";
    elements.keyboardLevel.textContent = "Level " + (state.keyboardPurchased ? 1 : 0) + " / 1";
    elements.developerLevel.textContent = "Hired " + (state.developerHired ? 1 : 0) + " / 1";
  }
}());
