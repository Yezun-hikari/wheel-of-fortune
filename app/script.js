const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const optionsDiv = document.getElementById('options');
const addOptionBtn = document.getElementById('addOptionBtn');
const themeToggleBtn = document.getElementById('theme-toggle');

let options = [];
const colors = ['#FFC300', '#FF5733', '#C70039', '#900C3F', '#581845', '#000000'];

const updateOptions = () => {
    options = Array.from(optionsDiv.querySelectorAll('.option')).map(optionEl => ({
        text: optionEl.querySelector('input[type="text"]').value,
        probability: parseInt(optionEl.querySelector('.probability').value, 10)
    }));
    drawWheel();
};

const drawWheel = () => {
    const totalProbability = options.reduce((sum, option) => sum + option.probability, 0);
    if (totalProbability === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = document.body.classList.contains('dark-mode') ? 'var(--background-dark)' : 'var(--background-light)';
    ctx.lineWidth = 5;

    let startAngle = 0;
    options.forEach((option, i) => {
        const arcSize = (2 * Math.PI * option.probability) / totalProbability;
        const angle = startAngle;
        ctx.fillStyle = colors[i % colors.length];

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = '16px Poppins';
        ctx.translate(
            centerX + Math.cos(angle + arcSize / 2) * radius * 0.7,
            centerY + Math.sin(angle + arcSize / 2) * radius * 0.7
        );
        ctx.rotate(angle + arcSize / 2 + Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(option.text, 0, 0);
        ctx.restore();

        startAngle += arcSize;
    });
};

const spin = () => {
    const totalProbability = options.reduce((sum, option) => sum + option.probability, 0);
    if (totalProbability === 0) return;

    const spinTime = 4000;
    const spinTimeTotal = Math.random() * 2000 + spinTime;
    let spinAngle = Math.random() * 360 + 1440;

    canvas.style.transition = `transform ${spinTimeTotal}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
    canvas.style.transform = `rotate(${spinAngle}deg)`;

    setTimeout(() => {
        const degrees = spinAngle % 360;
        const winningAngle = 360 - degrees;
        let currentAngle = 0;
        let winningIndex = 0;
        for (let i = 0; i < options.length; i++) {
            const arcSize = (360 * options[i].probability) / totalProbability;
            if (winningAngle >= currentAngle && winningAngle < currentAngle + arcSize) {
                winningIndex = i;
                break;
            }
            currentAngle += arcSize;
        }

        alert(`Gewinner: ${options[winningIndex].text}`);
        canvas.style.transition = 'none';
        const actualAngle = spinAngle % 360;
        canvas.style.transform = `rotate(${actualAngle}deg)`;
    }, spinTimeTotal);
};

const addOption = () => {
    const newOption = document.createElement('div');
    newOption.classList.add('option');
    newOption.innerHTML = `
        <input type="text" value="Feld ${options.length + 1}">
        <input type="number" class="probability" value="1" min="1">
        <button class="removeOptionBtn">X</button>
    `;
    optionsDiv.appendChild(newOption);
    newOption.querySelector('input[type="text"]').addEventListener('input', updateOptions);
    newOption.querySelector('.probability').addEventListener('input', updateOptions);
    newOption.querySelector('.removeOptionBtn').addEventListener('click', () => {
        newOption.remove();
        updateOptions();
    });
    updateOptions();
};

const setTheme = (isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    drawWheel();
};

const toggleTheme = () => {
    setTheme(!document.body.classList.contains('dark-mode'));
};

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme');

setTheme(currentTheme === 'dark' || (!currentTheme && prefersDark.matches));

prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches);
    }
});

addOptionBtn.addEventListener('click', addOption);
spinBtn.addEventListener('click', spin);
themeToggleBtn.addEventListener('click', toggleTheme);

document.querySelectorAll('.option input').forEach(input => {
    input.addEventListener('input', updateOptions);
});

document.querySelectorAll('.removeOptionBtn').forEach(button => {
    button.addEventListener('click', () => {
        button.parentElement.remove();
        updateOptions();
    });
});

updateOptions();
