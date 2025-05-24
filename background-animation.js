// --- Falling Items Background Animation ---

class BackgroundAnimation {
    constructor() {
        this.fallingObjectsContainer = null;
        this.itemSources = ['./cup.svg', './burger.svg'];
        this.lastTimestamp = 0;
        this.animationId = null;
        this.intervalId = null;
        this.score = 0;
        this.scoreElement = null;
        this.baseSpeed = 120; // pixels per second
        this.speedMultiplier = 1;
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.fallingObjectsContainer = document.getElementById('falling-objects-container');
            this.scoreElement = document.getElementById('score-value');
            this.start();
        });
    }
    
    createFallingItem() {
        if (!this.fallingObjectsContainer) return;

        // 90% chance for canettes (cup.svg), 10% chance for burgers
        const randomImagePath = Math.random() < 0.9 ? './cup.svg' : './burger.svg';
        const img = document.createElement('img');
        img.classList.add('falling-item');
        img.src = randomImagePath;
        img.draggable = false;

        img.style.left = Math.random() * window.innerWidth + 'px';
        img.style.top = '-60px'; // Start above the viewport

        const randomSize = Math.random() * 30 + 30; // Size between 30px and 60px
        img.style.width = randomSize + 'px';
        img.style.height = 'auto'; // Maintain aspect ratio

        // Add click event listener
        img.addEventListener('click', (e) => this.handleItemClick(e, img, randomImagePath));

        this.fallingObjectsContainer.appendChild(img);
    }
    
    animationLoop(timestamp) {
        if (!this.fallingObjectsContainer) {
            this.animationId = requestAnimationFrame((ts) => this.animationLoop(ts));
            return;
        }

        // Calculate time elapsed since last frame
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        // Skip first frame to avoid huge deltaTime
        if (deltaTime > 100) {
            this.animationId = requestAnimationFrame((ts) => this.animationLoop(ts));
            return;
        }

        const items = this.fallingObjectsContainer.querySelectorAll('.falling-item');
        items.forEach(item => {
            let currentTop = parseFloat(item.style.top);
            // Dynamic speed based on score
            let newTop = currentTop + (this.baseSpeed * this.speedMultiplier * deltaTime / 1000);

            if (newTop > window.innerHeight) {
                item.remove();
            } else {
                item.style.top = newTop + 'px';
            }
        });

        this.animationId = requestAnimationFrame((ts) => this.animationLoop(ts));
    }
    
    start() {
        if (this.fallingObjectsContainer) {
            this.intervalId = setInterval(() => this.createFallingItem(), 700);
            this.animationLoop(0);
        } else {
            console.warn("Falling objects container not found, animation not started.");
        }
    }
    
    handleItemClick(event, item, imagePath) {
        event.preventDefault();
        event.stopPropagation();
        
        // Calculate points
        const points = imagePath.includes('cup.svg') ? 1 : 10;
        this.score += points;
        
        // Update score display
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
        
        // Update speed multiplier every 5 points
        this.speedMultiplier = 1 + Math.floor(this.score / 5) * 0.2;
        
        // Remove the item
        item.remove();
        
        // Add click effect
        this.showClickEffect(event.clientX, event.clientY, points);
    }
    
    showClickEffect(x, y, points) {
        const effect = document.createElement('div');
        effect.style.position = 'fixed';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        effect.style.color = points === 1 ? '#22c55e' : '#f59e0b';
        effect.style.fontSize = '24px';
        effect.style.fontWeight = 'bold';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '1000';
        effect.style.transform = 'translate(-50%, -50%)';
        effect.textContent = '+' + points;
        
        document.body.appendChild(effect);
        
        // Animate the effect
        effect.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: 'translate(-50%, -100px) scale(1.5)', opacity: 0 }
        ], {
            duration: 800,
            easing: 'ease-out'
        }).onfinish = () => {
            effect.remove();
        };
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    setCanRatio(ratio) {
        // Set probability for cans (0-1, where 1 = 100% cans)
        this.canRatio = Math.max(0, Math.min(1, ratio));
    }
    
    updateCreateFallingItem() {
        // Update the createFallingItem method to use custom ratio if set
        const originalMethod = this.createFallingItem;
        this.createFallingItem = function() {
            if (!this.fallingObjectsContainer) return;

            const ratio = this.canRatio !== undefined ? this.canRatio : 0.9;
            const randomImagePath = Math.random() < ratio ? './cup.svg' : './burger.svg';
            const img = document.createElement('img');
            img.classList.add('falling-item');
            img.src = randomImagePath;

            img.style.left = Math.random() * window.innerWidth + 'px';
            img.style.top = '-60px';

            const randomSize = Math.random() * 30 + 30;
            img.style.width = randomSize + 'px';
            img.style.height = 'auto';

            this.fallingObjectsContainer.appendChild(img);
        };
    }
}

// Initialize the background animation
const backgroundAnimation = new BackgroundAnimation();