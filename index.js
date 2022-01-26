import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "process";
import fs from "fs";

const rl = readline.createInterface({ input, output });

let solved = false;

// get all words
const allowedGuesses = fs
  .readFileSync("./wordle-allowed-guesses.txt", "utf-8")
  .split("\n");
const answers = fs
  .readFileSync("./wordle-answers-alphabetical.txt", "utf-8")
  .split("\n");
const possibleGuesses = [...allowedGuesses, ...answers].sort();

// get a ranking of letters
const letters = [...Array(26)].map((_, i) =>
  String.fromCharCode(65 + i).toLowerCase()
);

const lettersOccurence = new Map();
possibleGuesses.forEach((word) => {
  for (var i = 0; i < word.length; i++) {
    const char = word.charAt(i);
    if (!lettersOccurence[char]) {
      lettersOccurence[char] = 1;
    } else {
      lettersOccurence[char] = lettersOccurence[char] + 1;
    }
  }
});

// find best word for the first try
const wordToValue = new Map();
possibleGuesses.forEach((word) => {
  let total = 0;
  for (var i = 0; i < word.length; i++) {
    const char = word.charAt(i);
    // make the word less valuable if we've already seen those letters
    const value =
      word.indexOf(char) === word.lastIndexOf(char)
        ? lettersOccurence[char]
        : lettersOccurence[char] / 2;
    total = total + value;
  }
  wordToValue[word] = total;
});
let sortedWordToValue = Object.keys(wordToValue).sort((a, b) => {
  return wordToValue[b] - wordToValue[a];
});

let filteredWords = sortedWordToValue;
while (!solved) {
  console.log(
    `Enter one of these options: ${filteredWords
      .slice(0, 5)
      .map((word) => word.toUpperCase())}`
  );
  const answer = (await rl.question("What word did you enter? ")).toLowerCase();

  const colouredAnswer = (
    await rl.question("What was the result? ")
  ).toLowerCase();
  for (var i = 0; i < 5; i++) {
    const letterAtCurrentIndex = answer.charAt(i);

    let noBlacks = [];
    let noYellows = [];
    let keepGreens = [];
    const colour = colouredAnswer.charAt(i);
    if (colour === "b") {
      noBlacks = filteredWords.filter(
        (filteredWord) => !filteredWord.includes(letterAtCurrentIndex)
      );
    }
    if (colour === "y") {
      noYellows = (noBlacks.length ? noBlacks : filteredWords).filter(
        (filteredWord) =>
          filteredWord.charAt(i) !== letterAtCurrentIndex &&
          filteredWord.includes(letterAtCurrentIndex)
      );
    }
    if (colour === "g") {
      keepGreens = (
        noYellows.length
          ? noYellows
          : noBlacks.length
          ? noBlacks
          : filteredWords
      ).filter((word) => word.charAt(i) === letterAtCurrentIndex);
    }
    filteredWords = keepGreens.length
      ? keepGreens
      : noYellows.length
      ? noYellows
      : noBlacks;
  }
  console.log("filteredWords", filteredWords);

  if (filteredWords.length <= 1) {
    solved = true;
  }
}
rl.close();
