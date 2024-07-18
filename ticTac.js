(function () {
  const GameBoard = (() => {
    let value = 1;
    const rows = 3;
    const columns = 3;
    const board = [];
    const userScore = []; // shared array for scores
    const playerOneScore = [];
    const playerTwoScore = [];

    // create board
    for (let i = 0; i < rows; i++) {
      board[i] = []; // Create empty arrays for each 3x3 row / column
      for (let e = 0; e < columns; e++) {
        board[i].push(value++); // Push 1-9. A number for each 3x3
      }
    }

    const pushUserValue = (userInput, userToken) => {
      userScore.push(parseInt(userInput));
      userToken === "X"
        ? playerOneScore.push(parseInt(userInput))
        : playerTwoScore.push(parseInt(userInput));
      let currentUserScore = userScore[userScore.length - 1];
      userInput = "";

      // Update according to users input
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          if (board[i][j] === currentUserScore) {
            board[i][j] = userToken; // Overwrite X/O (current-users token) with matching numbers
          }
        }
      }
    };

    //  encapsulate arrays
    const getBoard = () => board;
    const getUserScore = () => userScore;
    const getPlayerOneScore = () => playerOneScore;
    const getPlayerTwoScore = () => playerTwoScore;

    return {
      pushUserValue,
      getBoard,
      getPlayerOneScore,
      getPlayerTwoScore,
      getUserScore,
    };
  })();

  // --------------------- // --------------------- // --------------------- // --------------------- // --------------------- // --------------------- // --------------------- //

  const TurnController = (() => {
    const elements = {};

    const init = () => {
      cacheDom();
    };

    const cacheDom = () => {
      elements.turn = document.querySelector(".turn");
      elements.message = document.querySelector(".message");
    };

    let playerOneName = "Player One";
    let playerTwoName = "Player Two";

    const winningCombos = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [1, 5, 9],
      [3, 5, 7],
    ];

    function state(initialState) {
      let state = initialState;

      const isFalse = () => {
        state = false;
      };

      const isTrue = () => {
        state = true;
      };

      const getState = () => {
        return state;
      };

      return { isTrue, isFalse, getState };
    }

    const nextTurn = state(true);
    const someoneHasWon = state(false);

    const board = GameBoard;

    const playerTurn = (currentToken, currentScore) => {
      return {
        currentToken,
        currentScore,
        logCurrentUserInfo: function () {
          return `${getActivePlayer().name} uses: ${this.currentToken} on ${
            this.currentScore[currentScore.length - 1]
          }.`;
        },
      };
    };

    const players = [
      {
        name: playerOneName,
        token: "X",
        score: board.getPlayerOneScore,
        info: playerTurn("X", board.getPlayerOneScore()),
      },
      {
        name: playerTwoName,
        token: "O",
        score: board.getPlayerTwoScore,
        info: playerTurn("O", board.getPlayerTwoScore()),
      },
    ];

    let activePlayer = players[0];

    // switch active player
    const switchPlayerTurn = () => {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const playRound = (value) => {
      let userInput = parseInt(value);
      checkConditions(userInput);
      getActivePlayer();

      if (nextTurn.getState() && !someoneHasWon.getState()) {
        switchPlayerTurn();
        userInput = "";
      } else if (someoneHasWon) {
        elements.message.textContent = `${getActivePlayer().name} has won.`;
      }
      return "Round end"; // removes undefined if you "newRound.playRound(2)" in console
    };

    const checkWinner = (score) => {
      for (let combo of winningCombos) {
        if (combo.every((num) => score.includes(num))) {
          someoneHasWon.isTrue();
          return;
        }
      }
    };

    // CHECKER
    const checkConditions = (input) => {
      if (isNaN(input) || input < 1 || input > 9) {
        elements.message.textContent = "Please input valid number";
        nextTurn.isFalse();
        return;
      }
      if (board.getUserScore().includes(input)) {
        elements.message.textContent = "score already in array";
        nextTurn.isFalse();
        return;
      }

      someoneHasWon.isFalse();
      nextTurn.isTrue();
      board.pushUserValue(parseInt(input), getActivePlayer().token);
      checkWinner(activePlayer.score());
      elements.message.textContent =
        getActivePlayer().info.logCurrentUserInfo();
      input = "";
    };

    init();

    return {
      playRound,
      getBoard: board.getBoard,
      getActivePlayer,
      checkWinner,
      setPlayerNames: (name1, name2) => {
        playerOneName = name1 || playerOneName;
        playerTwoName = name2 || playerTwoName;

        players[0].name = playerOneName;
        players[1].name = playerTwoName;
      },
    };
  })();

  // --------------------- // --------------------- // --------------------- // --------------------- // --------------------- // --------------------- // --------------------- //

  const GameController = (() => {
    const elements = {};

    const init = () => {
      cacheDom();
      bindEvents();
    };

    const cacheDom = () => {
      elements.boardDiv = document.querySelector(".boardDiv");
      elements.container = document.querySelector(".container");

      elements.players = document.querySelector(".players");

      elements.playerOne = document.querySelector(".playerOne");
      elements.playerTwo = document.querySelector(".playerTwo");

      elements.playerOneName = document.querySelector(".playerOneName h4");
      elements.playerTwoName = document.querySelector(".playerTwoName");

      elements.question = document.createElement("input");
      elements.question.className = "nameInput";
      elements.question.setAttribute("type", "text");
      elements.container.appendChild(elements.question);
    };

    const bindEvents = () => {
      elements.question.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          let name = elements.question.value;
          createName(name);
          if (playerNames.length === 1) {
            elements.playerOneName.textContent = ` ${playerNames[0]}`;
          }
          elements.question.value = "";
          if (playerNames.length === 2) {
            elements.playerTwoName.textContent = ` ${playerNames[1]}`;
            addName(playerNames);
            updateScreen();
          }
        }
      });

      elements.boardDiv.addEventListener("click", clickButton);
    };

    const playerNames = [];
    const game = TurnController;

    const board = game.getBoard();

    const createName = (name) => {
      return playerNames.push(name);
    };

    const addName = (array) => {
      game.setPlayerNames(array[0], array[1]);
    };

    const updateScreen = () => {
      elements.boardDiv.textContent = "";

      board.forEach((row) => {
        row.forEach((cell) => {
          const cellButton = document.createElement("button");
          cellButton.className = "cellButtons";

          cellButton.dataset.column = cell;
          cellButton.textContent = cell;

          elements.boardDiv.appendChild(cellButton);
        });
      });
    };

    function clickButton(button) {
      const selectButton = button.target.dataset.column;
      game.playRound(selectButton);
      updateScreen();
    }

    init();
  })();
})();

// need-to's:

// clean up code
//
