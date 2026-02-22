const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json());

// Helper function to read DB
const readDB = () => {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
};

// Helper function to write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// GET /habits
app.get('/habits', (req, res) => {
    try {
        const db = readDB();
        res.json(db.habits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// POST /habits
app.post('/habits', (req, res) => {
    try {
        const db = readDB();
        const newHabit = {
            id: uuidv4(),
            ...req.body,
            completed: 0,
            createdAt: new Date().toISOString()
        };
        db.habits.push(newHabit);
        writeDB(db);
        res.status(201).json(newHabit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// PUT /habits/:id
app.put('/habits/:id', (req, res) => {
    try {
        const db = readDB();
        const index = db.habits.findIndex(h => h.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Habit not found' });

        db.habits[index] = { ...db.habits[index], ...req.body };
        writeDB(db);
        res.json(db.habits[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update data' });
    }
});

// DELETE /habits/:id
app.delete('/habits/:id', (req, res) => {
    try {
        const db = readDB();
        const index = db.habits.findIndex(h => h.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Habit not found' });

        db.habits.splice(index, 1);
        writeDB(db);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
