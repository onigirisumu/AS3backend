const questions = [
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
  
  let currentQuestionIndex = 0;
  let score = 0;
  let timerInterval;
  let timeLeft = 30;  
  
  function startQuiz() {
    showQuestion();
    startTimer();
  }
  
  function showQuestion() {
    const question = questions[currentQuestionIndex];
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
  
    
    document.getElementById('quiz-question').querySelector('p').textContent = question.question;
  
    
    question.options.forEach(option => {
      const optionElement = document.createElement('button');
      optionElement.classList.add('btn', 'btn-outline-secondary', 'mb-2');
      optionElement.textContent = option;
      optionElement.onclick = () => checkAnswer(option);
      optionsContainer.appendChild(optionElement);
    });
  
    
    document.getElementById('next-question').style.display = 'none';
    document.getElementById('submit-quiz').style.display = 'none';
    document.getElementById('time-up-feedback').style.display = 'none';
  }
  
  function checkAnswer(selectedOption) {
    const correctAnswer = questions[currentQuestionIndex].answer;
    if (selectedOption === correctAnswer) {
      score++;
    }
    document.getElementById('next-question').style.display = 'inline-block';
  }
  
  function startTimer() {
    document.getElementById('timer').textContent = timeLeft; 
  
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('timer').textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        document.getElementById('time-up-feedback').style.display = 'block';
        document.getElementById('next-question').style.display = 'inline-block';
      }
    }, 1000);
  }
  
  function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      showQuestion();
      timeLeft = 30;  
    } else {
      endQuiz();
    }
  }
  
  function endQuiz() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('social-sharing').style.display = 'block';
    
    alert('Your score: ' + score);
  }
  
  
  function shareOnFacebook() {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=I scored ${score} on this quiz!`;
    window.open(shareUrl, '_blank');
  }
  
  function shareOnTwitter() {
    const shareUrl = `https://twitter.com/intent/tweet?text=I scored ${score} on this quiz! ${encodeURIComponent(window.location.href)}`;
    window.open(shareUrl, '_blank');
  }
  
  function shareOnLinkedIn() {
    const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=My Quiz Score&summary=I scored ${score} on this quiz!`;
    window.open(shareUrl, '_blank');
  }
  
  document.getElementById('next-question').addEventListener('click', nextQuestion);
  document.getElementById('submit-quiz').addEventListener('click', endQuiz);
  document.getElementById('facebook-share').addEventListener('click', shareOnFacebook);
  document.getElementById('twitter-share').addEventListener('click', shareOnTwitter);
  document.getElementById('linkedin-share').addEventListener('click', shareOnLinkedIn);
  
  
  startQuiz();
  
