const questions = [
    {
        question: "What is the capital of France?",
        answers: [
            { text: "Paris", correct: true },
            { text: "London", correct: false },
            { text: "Rome", correct: false },
            { text: "Berlin", correct: false }
        ]
    },
    {
        question: "What is 2 + 2?",
        answers: [
            { text: "4", correct: true },
            { text: "22", correct: false },
            { text: "5", correct: false },
            { text: "3", correct: false }
        ]
    },
    // Add more questions here to reach a total of 10 questions
];

const introContainerElement = document.getElementById('intro-container');
const userFormElement = document.getElementById('user-form');
const quizContainerElement = document.getElementById('quiz-container');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const submitButton = document.getElementById('submit-button');
const timerElement = document.getElementById('time-left');
const scoreContainerElement = document.getElementById('score-container');
const scoreElement = document.getElementById('score');
const nextButton = document.getElementById('next-button');

let currentQuestionIndex = 0;
let score = 0;
let timeLeft;
let timer;
let selectedButton = null;

userFormElement.addEventListener('submit', startQuiz);
submitButton.addEventListener('click', () => {
    selectAnswer();
    nextQuestion();
});

nextButton.addEventListener('click', nextQuestion);

function startQuiz(event) {
    event.preventDefault();
    introContainerElement.classList.add('hide');
    quizContainerElement.classList.remove('hide');
    setNextQuestion();
}

function setNextQuestion() {
    resetState();
    showQuestion(questions[currentQuestionIndex]);
    startTimer(15); // 15 seconds for each question
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', () => {
            selectButton(button);
        });
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    clearStatusClass(document.body);
    submitButton.classList.add('hide');
    selectedButton = null;
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectButton(button) {
    if (selectedButton) {
        selectedButton.classList.remove('selected');
    }
    selectedButton = button;
    selectedButton.classList.add('selected');
    submitButton.classList.remove('hide');
}

function selectAnswer() {
    if (!selectedButton) {
        return;
    }
    const correct = selectedButton.dataset.correct === 'true';
    if (correct) {
        score++;
    }
    setStatusClass(document.body, correct);
    Array.from(answerButtonsElement.children).forEach(button => {
        setStatusClass(button, button.dataset.correct === 'true');
        button.disabled = true;
    });
    clearInterval(timer);
}

function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

function startTimer(seconds) {
    timeLeft = seconds;
    timerElement.innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerElement.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        setNextQuestion();
    } else {
        showScore();
    }
}

function showScore() {
    quizContainerElement.classList.add('hide');
    scoreContainerElement.classList.remove('hide');
    scoreElement.innerText = `${score} out of ${questions.length}`;
    sendDataToSheet();
}

function sendDataToSheet() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const data = {
        name: name,
        email: email,
        score: score
    };

    fetch('https://script.google.com/a/macros/exah.co.za/s/AKfycbzuVZa4pVrnZOsLzFSRn1O7vCKz68Mu8E7xJ3wTH8VA4kRUdHKYLL91wdupBNcPelyOVg/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        // Uncomment the following line if you are facing CORS issues
        // mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
