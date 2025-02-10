const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


const quizQuestions = [
        {
          question: 'What is the best ingredient for moisturizing dry skin? 💧',
          options: ['Hyaluronic Acid', 'Salicylic Acid', 'Vitamin C', 'Retinol'],
          answer: 'Hyaluronic Acid'
        },
        {
          question: 'Which foundation finish is best for oily skin? 💄',
          options: ['Dewy', 'Matte', 'Satin', 'Natural'],
          answer: 'Matte'
        },
        {
          question: 'What is the main benefit of using sunscreen daily? ☀️',
          options: ['Prevents acne', 'Prevents premature aging', 'Clears dark spots', 'Improves skin texture'],
          answer: 'Prevents premature aging'
        },
        {
          question: 'Which ingredient is commonly used to reduce dark circles under the eyes? 👀',
          options: ['Caffeine', 'Aloe Vera', 'Tea Tree Oil', 'Benzoyl Peroxide'],
          answer: 'Caffeine'
        },
        {
          question: 'What is the recommended SPF for daily sunscreen protection? 🌞',
          options: ['SPF 10', 'SPF 15', 'SPF 30', 'SPF 50'],
          answer: 'SPF 30'
        },
        {
          question: 'Which makeup product helps to accentuate the cheekbones? 💁‍♀️',
          options: ['Blush', 'Bronzer', 'Highlighter', 'Concealer'],
          answer: 'Highlighter'
        },
        {
          question: 'What is the main benefit of using a primer before applying makeup? 💅',
          options: ['Improves skin texture', 'Reduces redness', 'Helps makeup last longer', 'Brightens skin'],
          answer: 'Helps makeup last longer'
        },
        {
          question: 'Which skincare ingredient is known for brightening the skin? ✨',
          options: ['Vitamin C', 'Retinol', 'Salicylic Acid', 'Niacinamide'],
          answer: 'Vitamin C'
        },
        {
          question: 'What is the purpose of using a toner in a skincare routine? 🌸',
          options: ['Hydrate the skin', 'Remove excess oil', 'Balance the pH', 'All of the above'],
          answer: 'All of the above'
        },
        {
          question: 'Which makeup product is commonly used to define and darken the eyebrows? 👁️',
          options: ['Eyeliner', 'Mascara', 'Eyebrow pencil', 'Lipstick'],
          answer: 'Eyebrow pencil'
        }
];


router.get('/', (req, res) => {
  res.render('bonus', {
    page: 'bonus',
    title: 'Bonus Quiz',
    brand: 'Your Brand',
    user: req.user,  
    questions: quizQuestions,
  });
});


router.post('/submit', (req, res) => {
  const userAnswers = req.body.answers;
  let score = 0;

  
  quizQuestions.forEach((question, index) => {
    if (userAnswers[index] === question.answer) {
      score++;
    }
  });

  
  const quizResult = new QuizResult({
    user: req.user ? req.user._id : null,  
    score,
    date: new Date(),
  });

  quizResult.save()
    .then(() => {
      
      res.render('quiz-result', {
        score,
        totalQuestions: quizQuestions.length,
        user: req.user,
      });
    })
    .catch((err) => {
      console.error('Error saving quiz result:', err);
      res.status(500).send('Server error');
    });
});

module.exports = router;
