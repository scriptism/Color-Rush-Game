// Color Rush Game - Fast Paced Color Matching Game
class ColorRushGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.timeLeft = 30;
        this.gameActive = false;
        this.timer = null;
        this.correctStreak = 0;
        this.targetColor = null;
        this.correctTileIndex = null;
        this.colors = [
            { name: 'Red', hex: '#ff6b6b' },
            { name: 'Blue', hex: '#4ecdc4' },
            { name: 'Green', hex: '#45b7d1' },
            { name: 'Purple', hex: '#a55eea' },
            { name: 'Orange', hex: '#fd79a8' },
            { name: 'Yellow', hex: '#fdcb6e' },
            { name: 'Pink', hex: '#e84393' },
            { name: 'Cyan', hex: '#00cec9' },
            { name: 'Lime', hex: '#00b894' },
            { name: 'Indigo', hex: '#6c5ce7' }
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeElements() {
        this.elements = {
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            timer: document.getElementById('timer'),
            targetColor: document.getElementById('target-color'),
            colorName: document.getElementById('color-name'),
            colorGrid: document.getElementById('color-grid'),
            message: document.getElementById('message'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            restartBtn: document.getElementById('restart-btn'),
            gameOverModal: document.getElementById('game-over-modal'),
            finalScore: document.getElementById('final-score'),
            finalLevel: document.getElementById('final-level'),
            playAgainBtn: document.getElementById('play-again-btn'),
            particles: document.getElementById('particles')
        };
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.playAgainBtn.addEventListener('click', () => this.restartGame());
    }

    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.level = 1;
        this.correctStreak = 0;
        this.timeLeft = 30;
        
        this.elements.startBtn.style.display = 'none';
        this.elements.pauseBtn.style.display = 'inline-block';
        this.elements.restartBtn.style.display = 'inline-block';
        
        this.updateDisplay();
        this.generateNewRound();
        this.startTimer();
        
        // Add start animation
        this.addParticles(this.elements.startBtn, 20);
    }

    pauseGame() {
        if (this.gameActive) {
            this.gameActive = false;
            clearInterval(this.timer);
            this.elements.pauseBtn.textContent = 'Resume';
            this.showMessage('Game Paused', 'info');
        } else {
            this.gameActive = true;
            this.elements.pauseBtn.textContent = 'Pause';
            this.startTimer();
            this.clearMessage();
        }
    }

    restartGame() {
        this.gameActive = false;
        clearInterval(this.timer);
        this.hideGameOverModal();
        
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.pauseBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'none';
        this.elements.pauseBtn.textContent = 'Pause';
        
        this.clearMessage();
        this.clearColorGrid();
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (this.gameActive) {
                this.timeLeft--;
                this.elements.timer.textContent = this.timeLeft;
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    generateNewRound() {
        // Select target color
        this.targetColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.elements.targetColor.style.backgroundColor = this.targetColor.hex;
        this.elements.colorName.textContent = this.targetColor.name;
        
        // Generate color grid
        this.clearColorGrid();
        this.generateColorGrid();
        
        // Add entrance animation
        this.animateColorGrid();
    }

    generateColorGrid() {
        const gridSize = 9; // 3x3 grid
        const colors = [...this.colors];
        
        // Remove target color from available colors
        const availableColors = colors.filter(color => color.name !== this.targetColor.name);
        
        // Shuffle available colors
        for (let i = availableColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableColors[i], availableColors[j]] = [availableColors[j], availableColors[i]];
        }
        
        // Select random colors for grid
        const gridColors = availableColors.slice(0, gridSize - 1);
        gridColors.push(this.targetColor); // Add target color
        
        // Shuffle grid colors
        for (let i = gridColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gridColors[i], gridColors[j]] = [gridColors[j], gridColors[i]];
        }
        
        // Find index of target color
        this.correctTileIndex = gridColors.findIndex(color => color.name === this.targetColor.name);
        
        // Create color tiles
        gridColors.forEach((color, index) => {
            const tile = document.createElement('div');
            tile.className = 'color-tile';
            tile.style.backgroundColor = color.hex;
            tile.dataset.index = index;
            
            tile.addEventListener('click', () => this.handleTileClick(index));
            
            this.elements.colorGrid.appendChild(tile);
        });
    }

    handleTileClick(index) {
        if (!this.gameActive) return;
        
        const tile = this.elements.colorGrid.children[index];
        
        if (index === this.correctTileIndex) {
            this.handleCorrectAnswer(tile);
        } else {
            this.handleIncorrectAnswer(tile);
        }
    }

    handleCorrectAnswer(tile) {
        this.correctStreak++;
        const basePoints = 10;
        const streakBonus = Math.floor(this.correctStreak / 3) * 5;
        const levelBonus = this.level * 2;
        const points = basePoints + streakBonus + levelBonus;
        
        this.score += points;
        
        // Visual feedback
        tile.classList.add('correct');
        this.addParticles(tile, 15);
        this.showMessage(`+${points} Points! Streak: ${this.correctStreak}`, 'correct');
        
        // Sound effect simulation (visual feedback)
        this.createSoundWave(tile);
        
        // Check for level up
        if (this.score >= this.level * 100) {
            this.levelUp();
        } else {
            setTimeout(() => {
                this.generateNewRound();
            }, 1000);
        }
        
        this.updateDisplay();
    }

    handleIncorrectAnswer(tile) {
        this.correctStreak = 0;
        this.score = Math.max(0, this.score - 5);
        
        // Visual feedback
        tile.classList.add('incorrect');
        this.showMessage('Wrong! -5 Points', 'incorrect');
        
        setTimeout(() => {
            this.generateNewRound();
        }, 1000);
        
        this.updateDisplay();
    }

    levelUp() {
        this.level++;
        this.timeLeft = Math.max(10, 30 - (this.level - 1) * 2);
        this.elements.timer.textContent = this.timeLeft;
        
        this.showMessage(`Level ${this.level}! Time decreased!`, 'level-up');
        this.addParticles(this.elements.level, 25);
        
        setTimeout(() => {
            this.generateNewRound();
        }, 1500);
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.timer);
        
        this.elements.finalScore.textContent = this.score;
        this.elements.finalLevel.textContent = this.level;
        this.showGameOverModal();
        
        // Add celebration particles
        this.addParticles(document.body, 50);
    }

    showGameOverModal() {
        this.elements.gameOverModal.style.display = 'block';
    }

    hideGameOverModal() {
        this.elements.gameOverModal.style.display = 'none';
    }

    showMessage(text, type) {
        this.elements.message.textContent = text;
        this.elements.message.className = `message ${type}`;
    }

    clearMessage() {
        this.elements.message.textContent = '';
        this.elements.message.className = 'message';
    }

    clearColorGrid() {
        this.elements.colorGrid.innerHTML = '';
    }

    updateDisplay() {
        this.elements.score.textContent = this.score;
        this.elements.level.textContent = this.level;
        this.elements.timer.textContent = this.timeLeft;
    }

    animateColorGrid() {
        const tiles = this.elements.colorGrid.children;
        Array.from(tiles).forEach((tile, index) => {
            tile.style.opacity = '0';
            tile.style.transform = 'scale(0.5)';
            
            setTimeout(() => {
                tile.style.transition = 'all 0.3s ease';
                tile.style.opacity = '1';
                tile.style.transform = 'scale(1)';
            }, index * 100);
        });
    }

    addParticles(element, count) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createParticle(centerX, centerY);
            }, i * 20);
        }
    }

    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        this.elements.particles.appendChild(particle);
        
        // Animate particle
        setTimeout(() => {
            particle.style.transform = `translate(${vx}px, ${vy}px)`;
        }, 10);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }

    createSoundWave(element) {
        const wave = document.createElement('div');
        wave.style.position = 'absolute';
        wave.style.border = '2px solid #4ecdc4';
        wave.style.borderRadius = '50%';
        wave.style.pointerEvents = 'none';
        wave.style.left = element.offsetLeft + element.offsetWidth / 2 + 'px';
        wave.style.top = element.offsetTop + element.offsetHeight / 2 + 'px';
        wave.style.width = '0';
        wave.style.height = '0';
        wave.style.transform = 'translate(-50%, -50%)';
        wave.style.transition = 'all 0.5s ease';
        
        document.body.appendChild(wave);
        
        setTimeout(() => {
            wave.style.width = '200px';
            wave.style.height = '200px';
            wave.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            if (wave.parentNode) {
                wave.parentNode.removeChild(wave);
            }
        }, 500);
    }

    // Utility methods
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new ColorRushGame();
    
    // Add some initial animations
    const title = document.querySelector('.game-title');
    title.style.opacity = '0';
    title.style.transform = 'translateY(-50px)';
    
    setTimeout(() => {
        title.style.transition = 'all 1s ease';
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
    }, 100);
    
    // Add hover effects to stats
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => {
        stat.addEventListener('mouseenter', () => {
            stat.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        stat.addEventListener('mouseleave', () => {
            stat.style.transform = 'translateY(0) scale(1)';
        });
    });
});
