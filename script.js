const debtsData = `
Stéphane - Thibault : 2 canettes
Thibault - Stéphane : 2 canettes
`;
// --- End Embedded Data ---

const debtsContainer = document.getElementById('debts-container');

function parseDebtData(data) {
    const lines = data.trim().split('\n');
    const debts = [];

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        const parts = line.split(':');
        if (parts.length !== 2) {
            console.warn(`Skipping invalid line format: ${line}`);
            return;
        }

        const namesPart = parts[0].trim();
        const cansPart = parts[1].trim();

        const match = cansPart.match(/(\d+)\s*canettes?/i);
        let cans = 0;
        if (match && match[1]) {
            cans = parseInt(match[1], 10);
        } else {
            console.warn(`Could not parse can count from line: ${line}`);
            return;
        }

        const names = namesPart.split('-').map(name => name.trim());
        if (names.length !== 2) {
            console.warn(`Could not parse person names from line: ${line}`);
            return;
        }

        debts.push({
            debtor: names[0],      // Personne qui doit
            creditor: names[1],    // Personne à qui on doit
            cans: cans
        });
    });
    return debts;
}

function calculateBurgersAndCans(totalCans) {
    const burgers = Math.floor(totalCans / 10);
    const remainingCans = totalCans % 10;
    return { burgers, remainingCans };
}

function createDebtElement(debt) {
    const { burgers, remainingCans } = calculateBurgersAndCans(debt.cans);

    const debtElement = document.createElement('div');
    debtElement.classList.add(
        'flex',
        'justify-between',
        'items-center',
        'p-6',
        'bg-white',
        'rounded-2xl',
        'shadow-lg',
        'border',
        'border-gray-100',
        'transition-shadow',
        'duration-300',
        'ease-in-out',
        'hover:shadow-2xl'
    );

    // --- Debtor Side (Personne qui DOIT) ---
    const debtorDiv = document.createElement('div');
    debtorDiv.classList.add('flex', 'flex-col', 'items-center', 'text-center', 'w-1/3'); // Ajout w-1/3 pour équilibrer

    const debtorName = document.createElement('div');
    debtorName.classList.add(
        'text-2xl',
        'font-bold',
        'text-red-700', 
        'tracking-wide',
        'drop-shadow-sm'
    );
    debtorName.textContent = debt.debtor;
    debtorDiv.appendChild(debtorName);

    const owesText = document.createElement('div'); 
    owesText.classList.add('text-sm', 'text-gray-500', 'italic', 'mt-1');
    owesText.textContent = `doit à`;
    debtorDiv.appendChild(owesText);


    // --- Separator (Flèche indiquant la direction de la dette et montant) ---
    const separatorDiv = document.createElement('div');
    separatorDiv.classList.add('flex', 'flex-col', 'items-center', 'mx-2', 'sm:mx-4', 'w-auto'); // w-auto, ajustement mx

    const totalCansText = document.createElement('div');
    totalCansText.classList.add('text-xl', 'font-bold', 'text-orange-600', 'mb-1', 'whitespace-nowrap');
    totalCansText.textContent = `${debt.cans} ${debt.cans === 1 ? 'can.' : 'cans'}`;
    separatorDiv.appendChild(totalCansText);

    const arrowIcon = document.createElement('img');
    arrowIcon.src = './iconmonstr-arrow-right-circle-thin.svg';
    arrowIcon.alt = 'flèche';
    arrowIcon.classList.add('w-8', 'h-8', 'text-orange-500'); 
    separatorDiv.appendChild(arrowIcon);


    // --- Creditor Side (Personne à qui ON DOIT) ---
    const creditorDiv = document.createElement('div');
    creditorDiv.classList.add('flex', 'flex-col', 'items-center', 'text-center', 'w-1/3'); // Ajout w-1/3 pour équilibrer

    const creditorName = document.createElement('div');
    creditorName.classList.add(
        'text-2xl',
        'font-bold',
        'text-green-700', 
        'tracking-wide',
        'drop-shadow-sm'
    );
    creditorName.textContent = debt.creditor;

    const creditorIconsDiv = document.createElement('div');
    creditorIconsDiv.classList.add('flex', 'items-center', 'justify-center', 'flex-wrap', 'space-x-1', 'mt-2'); 

    if (debt.cans === 0) {
        const noDebtIcon = document.createElement('img');
        noDebtIcon.src = 'https://unpkg.com/lucide-static@latest/icons/party-popper.svg';
        noDebtIcon.alt = 'Fête';
        noDebtIcon.classList.add('w-6', 'h-6', 'text-green-600');
        creditorIconsDiv.appendChild(noDebtIcon);
         const noDebtText = document.createElement('span');
        noDebtText.classList.add('text-sm', 'text-gray-600', 'ml-1');
        noDebtText.textContent = "Rien !";
        creditorIconsDiv.appendChild(noDebtText);
    } else {
        for (let i = 0; i < burgers; i++) {
            const burgerIcon = document.createElement('img');
            burgerIcon.src = './burger.svg';
            burgerIcon.alt = 'Burger';
            burgerIcon.classList.add('w-7', 'h-7', 'text-yellow-600'); 
            creditorIconsDiv.appendChild(burgerIcon);
        }

        for (let i = 0; i < remainingCans; i++) {
            const canIcon = document.createElement('img');
            canIcon.src = './cup.svg';
            canIcon.alt = 'Canette';
            canIcon.classList.add('w-6', 'h-6', 'text-gray-500'); 
            creditorIconsDiv.appendChild(canIcon);
        }
    }

    creditorDiv.appendChild(creditorName);
    creditorDiv.appendChild(creditorIconsDiv);

    debtElement.appendChild(debtorDiv);
    debtElement.appendChild(separatorDiv);
    debtElement.appendChild(creditorDiv);

    return debtElement;
}

function renderDebts(debts) {
    // Ensure debtsContainer is defined. This might be an issue if script.js is loaded before the DOM is ready.
    // However, the DOMContentLoaded listener should prevent this.
    if (!debtsContainer) {
        console.error('Debts container not found. Ensure the script is loaded after the DOM element or use DOMContentLoaded.');
        return;
    }
    debtsContainer.innerHTML = '';

    if (debts.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.classList.add('text-center', 'text-gray-500', 'italic', 'text-xl', 'py-8');
        emptyMessage.textContent = '🎉 Aucune dette enregistrée ! Tout le monde est quitte. 🎉';
        debtsContainer.appendChild(emptyMessage);
        return;
    }

    debts.forEach(debt => {
        const debtElement = createDebtElement(debt);
        debtsContainer.appendChild(debtElement);
    });
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    // Debts rendering logic
    const parsedDebts = parseDebtData(debtsData);
    renderDebts(parsedDebts);

    // --- Falling Items Animation ---
    const fallingObjectsContainer = document.getElementById('falling-objects-container');
    const itemSources = ['./cup.svg', './burger.svg'];

    function createFallingItem() {
        if (!fallingObjectsContainer) return;

        const randomImagePath = itemSources[Math.floor(Math.random() * itemSources.length)];
        const img = document.createElement('img');
        img.classList.add('falling-item');
        img.src = randomImagePath;

        img.style.left = Math.random() * window.innerWidth + 'px';
        img.style.top = '-60px'; // Start above the viewport

        const randomSize = Math.random() * 30 + 30; // Size between 30px and 60px
        img.style.width = randomSize + 'px';
        img.style.height = 'auto'; // Maintain aspect ratio

        fallingObjectsContainer.appendChild(img);
    }

    function animationLoop() {
        if (!fallingObjectsContainer) {
            requestAnimationFrame(animationLoop); // Keep trying if container not found yet
            return;
        }

        const items = fallingObjectsContainer.querySelectorAll('.falling-item');
        items.forEach(item => {
            let currentTop = parseFloat(item.style.top);
            let newTop = currentTop + 2; // Speed of falling

            if (newTop > window.innerHeight) {
                item.remove();
            } else {
                item.style.top = newTop + 'px';
            }
        });

        requestAnimationFrame(animationLoop);
    }

    // Initialize animation
    if (fallingObjectsContainer) { // Only start if container exists
        setInterval(createFallingItem, 700); // Create a new item every 700ms
        animationLoop(); // Start the animation loop
    } else {
        console.warn("Falling objects container not found, animation not started.");
    }
});
