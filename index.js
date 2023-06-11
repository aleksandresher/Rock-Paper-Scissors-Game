const crypto = require("crypto");
const secureRandom = require("secure-random");
const readline = require("readline");

class calculateComputerMove {
  constructor(moves) {
    this.moves = moves;
  }
  calculateMove() {
    const random = Math.floor(Math.random() * this.moves.length) + 1;
    return moves[random];
  }
}

class keyAndHmacGenarator {
  constructor(move, randomKey) {
    this.move = move;
    this.randomKey = randomKey;
  }
  generateHmac(move, randomKey) {
    const hmac = crypto.createHmac("sha3-256", randomKey);
    hmac.update(move);
    return hmac.digest("hex");
  }
}

class Winner {
  constructor(moves) {
    this.moves = moves;
  }
  checkWinner(move1, move2) {
    const userMoveIndex = moves.indexOf(move1);
    const compMoveIndex = moves.indexOf(move2);
    const half = Math.floor(moves.length / 2);
    if (userMoveIndex === compMoveIndex) {
      return "Draw";
    } else if (
      (userMoveIndex < compMoveIndex &&
        compMoveIndex - userMoveIndex <= half) ||
      (userMoveIndex > compMoveIndex && userMoveIndex - compMoveIndex > 3)
    ) {
      return "Win";
    } else {
      return "Lose";
    }
  }
}

class Table {
  constructor(moves) {
    this.moves = moves;
  }
  drawTable() {
    const size = this.moves.length;
    const table = [["Moves"]];
    table[0] = table[0].concat(
      this.moves.map((move, index) => move[index + 1])
    );

    this.moves.forEach((move, i) => {
      table[0][i + 1] = move;
      table[i + 1] = new Array(size + 1);
      table[i + 1][0] = move;
    });
    const newGame = new Winner();
    for (let i = 1; i <= size; i++) {
      for (let j = 1; j <= size; j++) {
        table[i][j] = newGame.checkWinner(moves[i], moves[j], moves);
      }
    }
    console.log("table:");
    table.map((row) => console.log(row.join("\t")));
  }
}

const moves = process.argv.slice(2);
const unique = Array.from(new Set(moves));

if (
  moves.length % 2 === 0 ||
  moves.length < 3 ||
  moves.length !== unique.length
) {
  console.log(
    "Please enter valid arguments (an odd number of non-repeating moves)"
  );
} else {
  const randomNum = secureRandom(32, { type: "Buffer" });
  const compMove = new calculateComputerMove(moves);
  const compGeneratedMove = compMove.calculateMove();
  const hmac = new keyAndHmacGenarator();
  const generatedHmac = hmac.generateHmac(compGeneratedMove, randomNum);
  const gameWinner = new Winner();
  let userInput;

  console.log(`HMAC: ${generatedHmac}`);
  console.log("Available Moves:");
  moves.forEach((option, index) => {
    console.log(`${index + 1} - ${option}`);
  });
  console.log("0 - exit");
  console.log("? - help");
  console.log();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter your move: ", (answer) => {
    userInput = answer;

    if (isNaN(userInput) && userInput !== "?") {
      console.log("Please enter a number.");
    } else if (userInput == "?") {
      const table = new Table(moves);
      table.drawTable();

      rl.question("Enter your move:", (answer) => {
        console.log("your move: " + moves[answer - 1]);
        console.log(`computer move: ${compGeneratedMove}`);
        const winner = gameWinner.checkWinner(
          moves[answer - 1],
          compGeneratedMove
        );

        if (winner === "Draw") {
          console.log("Draw");
        } else {
          console.log(`You ${winner}`);
        }
        console.log(`HMAC key: ${randomNum.toString("hex")}`);
        rl.close();
      });
    } else if (userInput == 0) {
      console.log("You close the game");
      process.exit();
    } else {
      console.log("your move: " + moves[userInput - 1]);
      console.log(`computer move: ${compGeneratedMove}`);
      const winner = gameWinner.checkWinner(
        moves[userInput - 1],
        compGeneratedMove
      );
      if (winner === "Draw") {
        console.log("Draw");
      } else {
        console.log(`You ${winner}`);
      }
      console.log(`HMAC key: ${randomNum.toString("hex")}`);
      rl.close();
    }
  });
}
