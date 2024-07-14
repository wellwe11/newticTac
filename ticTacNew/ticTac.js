(function () {
  const GameBoard = ((squares) => {
    // const rows = squares;
    // const columns = squares;
    let value = 1;
    const rows = 3;
    const columns = 3;
    const board = [];
    const userScore = [];
    const playerOneScore = [];
    const playerTwoScore = [];

    const getBoard = () => board;
    const getUserScore = () => userScore;
    const getPlayerOneScore = () => playerOneScore;
    const getPlayerTwoScore = () => playerTwoScore;

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

      // add users inputs
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          if (board[i][j] === currentUserScore) {
            board[i][j] = userToken; // Overwrite X/O for matching numbers
          }
        }
      }
    };

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
    let playerOneName = "Player One";
    let playerTwoName = "Player Two";

    const turn = document.querySelector(".turn");
    const message = document.querySelector(".message");

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
          }. Score: ${this.currentScore.join(", ")}.`;
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
      getActivePlayer();
      checkConditions(userInput);

      if (nextTurn.getState() && !someoneHasWon.getState()) {
        switchPlayerTurn();
        turn.textContent = `${getActivePlayer().name}'s turn`;
        userInput = "";
      }
      return "Round end"; // removes undefined if you "newRound.playRound(2)" in console
    };

    const checkWinner = (score) => {
      for (let combo of winningCombos) {
        if (combo.every((num) => score.includes(num))) {
          someoneHasWon.isTrue();
          turn.textContent = `${getActivePlayer().name} has won`;
          return;
        }
      }
    };

    const checkConditions = (input) => {
      // check conditions
      if (isNaN(input) || input < 1 || input > 9) {
        message.textContent = "Please input valid number";
        nextTurn.isFalse();
        return;
      }
      if (someoneHasWon.getState()) {
        message.textContent = "Someone has won";
        nextTurn.isFalse();
        return;
      }
      if (board.getUserScore().includes(input)) {
        message.textContent = "score already in array";
        nextTurn.isFalse();
        return;
      }

      nextTurn.isTrue();
      someoneHasWon.isFalse();
      board.pushUserValue(parseInt(input), getActivePlayer().token);
      message.textContent = getActivePlayer().info.logCurrentUserInfo();
      checkWinner(activePlayer.score());
      input = "";
    };
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
    const playerNames = [];
    const game = TurnController;
    const boardDiv = document.querySelector(".boardDiv");
    const container = document.querySelector(".container");
    const board = game.getBoard();
    const players = document.querySelector(".players");

    const question = document.createElement("input");
    question.setAttribute("type", "text");
    container.appendChild(question);

    const createName = (name) => {
      return playerNames.push(name);
    };

    const addName = (array) => {
      game.setPlayerNames(array[0], array[1]);
    };

    question.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        let name = question.value;
        createName(name);
        players.textContent = `
        Player one: ${playerNames[0]}`;
        question.value = "";
        if (playerNames.length === 2) {
          players.textContent += `
          ---- Player Two: ${playerNames[1]}`;
          addName(playerNames);
          updateScreen();
        }
      }
    });

    const updateScreen = () => {
      boardDiv.textContent = "";

      board.forEach((row) => {
        row.forEach((cell) => {
          const cellButton = document.createElement("button");

          cellButton.dataset.column = cell;
          cellButton.textContent = cell;

          boardDiv.appendChild(cellButton);
        });
      });
    };

    function clickButton(button) {
      const selectButton = button.target.dataset.column;

      game.playRound(selectButton);
      updateScreen();
    }

    boardDiv.addEventListener("click", clickButton);
  })();
})();

// need-to's:
// clean up code
