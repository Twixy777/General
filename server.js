const fs = require("fs");
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware do parsowania JSON w żądaniach POST i PATCH
app.use(express.json());

function calculateNextId() {
    let filepath = "./ids.txt";
    let stringData = fs.readFileSync(filepath, "utf8");
    let ids = JSON.parse(stringData);
    ids.sort((a, b) => a - b);
    let biggestId = ids[ids.length - 1];
    const nextId = biggestId + 1;
    ids.push(nextId);
    let saving = JSON.stringify(ids);
    fs.writeFileSync(filepath, saving);
    return nextId;
}

function saveGamesData(gameList){
    let filePath = "./dane.txt";
    let jsonData = JSON.stringify(gameList)
    fs.writeFileSync(filePath, jsonData, "utf8");
}

// Klasa GameData zgodna z Twoją strukturą
class GameData {
    constructor(id, title, genre, platform, releaseYear, myPrice, fullPrice, rating, myRating, isDone, multiplayer, publisher) {
        this.id = id || 0;
        this.title = title || "";
        this.genre = genre || "";
        this.platform = platform || "";
        this.releaseYear = releaseYear || 0;
        this.myPrice = myPrice || 0;
        this.fullPrice = fullPrice || 0;
        this.rating = rating || 0;
        this.myRating = myRating || 0;
        this.isDone = isDone || false;
        this.multiplayer = multiplayer || false;
        this.publisher = publisher || "";
    }
}

// Baza danych w pamięci podręcznej (przykładowe dane)
let games = [
    new GameData(1, "Witcher 4", "RPG", "PC", 2015, 40, 120, 10, 10, true, false, "CD Projekt"),
    new GameData(2, "Cyberpunk 2077", "RPG", "PC", 2020, 99, 199, 9, 8, false, false, "CD Projekt")
];
let nextId = 3;

function loadGamesData(){
    let filePath = "/Users/arkadiuszsawicz/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Korepetycje/IT/dane.txt";
    const stringData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(stringData)
    console.log(data)
    return data;
}

// 1. GET / - Pobierz wszystkie gry
app.get('/games', (req, res) => {
    const games = loadGamesData();
      res
        .status(200)
        .json(games);
});

// 2. GET /games/:id - Pobierz jedną grę po ID
app.get('/games/:id', (req, res) => {
    const gameId = parseInt(req.params.id);
    const games = loadGamesData();
    const game = games.find(g => g.id === gameId);

    if (!game) {
        return res.status(404).json({ message: "Gra o podanym ID nie istnieje." });
    }
    res.status(200).json(game);
});

// 3. POST /games - Dodaj nową grę
app.post('/games', (req, res) => {
    const { title, genre, platform, releaseYear, myPrice, fullPrice, rating, myRating, isDone, multiplayer, publisher } = req.body;
    const games = loadGamesData();
    // Walidacja - wymagamy chociaż tytułu
    if (!title) {
        return res.status(400).json({ message: "Tytuł gry jest wymagany." });
    }
    let nextId = calculateNextId()
    const newGame = new GameData(
        nextId,
        title,
        genre,
        platform,
        releaseYear,
        myPrice,
        fullPrice,
        rating,
        myRating,
        isDone,
        multiplayer,
        publisher
    );

    games.push(newGame);
    saveGamesData(games);
    res.status(201).json(newGame);
});

// 4. PATCH /games/:id - Częściowa aktualizacja gry
app.patch('/games/:id', (req, res) => {
    const gameId = parseInt(req.params.id);
    const gameIndex = games.findIndex(g => g.id === gameId);

    if (gameIndex === -1) {
        return res.status(404).json({ message: "Gra o podanym ID nie istnieje." });
    }

    // Aktualizujemy tylko te pola, które zostały przesłane w req.body
    const updatedGame = { ...games[gameIndex], ...req.body };
    
    // Zabezpieczenie przed zmianą ID przez użytkownika
    updatedGame.id = gameId; 

    games[gameIndex] = updatedGame;
    res.status(200).json(updatedGame);
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`Serwer uruchomiony na porcie http://localhost:${PORT}`);
});
