const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

router.get('/quiz-results', async (req, res) => {
  try {
    const quizResults = await QuizResult.find().sort({ timestamp: -1 });
    res.json(quizResults);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz results', error: err });
  }
});

router.post('/submit-quiz', async (req, res) => {
  const { username, score } = req.body;

  if (!username || score === undefined) {
    return res.status(400).json({ message: 'Username and score are required' });
  }

  try {
    const newQuizResult = new QuizResult({
      username,
      score
    });

    await newQuizResult.save();
    res.status(201).json({ message: 'Quiz result saved successfully', result: newQuizResult });
  } catch (err) {
    res.status(500).json({ message: 'Error saving quiz result', error: err });
  }
});

module.exports = router;
