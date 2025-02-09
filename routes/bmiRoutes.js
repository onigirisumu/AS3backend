const express = require('express');
const { check, validationResult } = require('express-validator');
const chalk = require('chalk');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('bmiCalculator');
});

router.post('/', [
    check('height').isFloat({ gt: 0 }).withMessage('Height must be a positive number'),
    check('weight').isFloat({ gt: 0 }).withMessage('Weight must be a positive number')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send('Invalid input data: ' + errors.array().map(err => err.msg).join(', '));
    }

    const { height, weight, units, age, gender } = req.body;

    let bmi;
    if (units === 'metric') {
        bmi = weight / ((height / 100) ** 2);
    } else if (units === 'imperial') {
        bmi = (weight / (height ** 2)) * 703;
    } else {
        return res.send('Invalid units provided.');
    }

    let category;
    if (bmi < 18.5) {
        category = 'Underweight';
    } else if (bmi < 24.9) {
        category = 'Normal weight';
    } else if (bmi < 29.9) {
        category = 'Overweight';
    } else {
        category = 'Obesity';
    }

    console.log(chalk.green(`Height: ${height}, Weight: ${weight}, BMI: ${bmi.toFixed(2)}, Category: ${category}, Age: ${age}, Gender: ${gender}`));

    res.render('bmiResult', { 
      bmi: bmi.toFixed(2), 
      category, 
      age, 
      gender, 
      page: 'bmi', 
      user: req.user || null 
    });
});


module.exports = router;
