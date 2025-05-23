const debtsData = `
Stéphane - Thibault : 2 canettes
Thibault - Stéphane : 2 canettes
François - Thibault : 1 canettes
Guillaume - Thibault : 1 canettes
Guillaume - François : 1 canettes
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

// --- Helper Function for Total Received Cans ---
function calculateTotalReceivedCans(parsedDebts) {
    const receivedCansMap = {};
    parsedDebts.forEach(debt => {
        receivedCansMap[debt.creditor] = (receivedCansMap[debt.creditor] || 0) + debt.cans;
    });
    return receivedCansMap;
}

// --- Leaderboard Calculation Function (based on Total Received Cans) ---
function calculateLeaderboard(totalReceivedMap) {
    const leaderboardArray = [];

    for (const personName in totalReceivedMap) {
        const totalCans = totalReceivedMap[personName];
        if (totalCans === 0) { // Skip if they haven't received any cans
            continue;
        }

        const { burgers, remainingCans } = calculateBurgersAndCans(totalCans);
        leaderboardArray.push({
            name: personName,
            points: totalCans,          // Total cans received, for ranking
            burgersOwed: burgers,       // Burgers for display
            cansOwed: remainingCans     // Remaining cans for display (after burgers)
        });
    }

    // Sort by points (total cans received) in descending order
    leaderboardArray.sort((a, b) => b.points - a.points);
    return leaderboardArray;
}

// --- Render Leaderboard Function ---
function renderLeaderboard(leaderboardData) {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (!leaderboardContainer) {
        console.error("Leaderboard container not found!");
        return;
    }
    leaderboardContainer.innerHTML = ''; // Clear previous content

    if (leaderboardData.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.classList.add('text-center', 'text-gray-500', 'italic', 'text-xl', 'py-8');
        emptyMessage.textContent = '🏆 Aucun classement à afficher pour le moment ! 🏆';
        leaderboardContainer.appendChild(emptyMessage);
        return;
    }

    // Podium (Top 3)
    const podiumData = leaderboardData.slice(0, 3);
    const restData = leaderboardData.slice(3);

    if (podiumData.length > 0) {
        const podiumContainer = document.createElement('div');
        podiumContainer.classList.add('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6', 'mb-10'); // Increased gap and mb

        // Define podium spots data for styling (1st, 2nd, 3rd)
        const podiumStyles = [
            { rank: 1, medal: '🥇', color: 'bg-yellow-400', borderColor: 'border-yellow-500', emphasisClass: 'md:scale-110 transform' }, // Gold
            { rank: 2, medal: '🥈', color: 'bg-gray-300', borderColor: 'border-gray-400' }, // Silver
            { rank: 3, medal: '🥉', color: 'bg-amber-500', borderColor: 'border-amber-600' }  // Bronze
        ];

        podiumData.forEach((person, index) => {
            const style = podiumStyles[index]; // Get style based on actual rank (0=1st, 1=2nd, 2=3rd)
            if (!style) return; // Should not happen if podiumData.length <= 3

            const spotDiv = document.createElement('div');
            spotDiv.classList.add(
                style.color,
                style.borderColor,
                'p-6', 'rounded-xl', 'shadow-xl', 'text-center', 'flex', 'flex-col', 'items-center', 'justify-between', 'h-full', 'border-4'
            );
            if (style.emphasisClass) {
                spotDiv.classList.add(...style.emphasisClass.split(' '));
            }

            const rankText = document.createElement('div');
            rankText.classList.add('text-3xl', 'font-bold', 'mb-2');
            rankText.textContent = `${style.medal} #${style.rank}`;
            spotDiv.appendChild(rankText);

                const nameText = document.createElement('div');
                nameText.classList.add('text-2xl', 'font-extrabold', 'text-gray-800', 'mb-3', 'truncate', 'w-full');
                nameText.textContent = person.name;
                spotDiv.appendChild(nameText);

                const receivesText = document.createElement('div');
                receivesText.classList.add('text-sm', 'text-gray-700', 'mb-3');
                receivesText.textContent = 'Reçoit :';
                spotDiv.appendChild(receivesText);

                const iconsDiv = document.createElement('div');
                iconsDiv.classList.add('flex', 'flex-col', 'items-center', 'space-y-2'); // Stack burger/can lines

                if (person.burgersOwed > 0) {
                    const burgerLine = document.createElement('div');
                    burgerLine.classList.add('flex', 'items-center', 'justify-center', 'space-x-1');
                    for (let i = 0; i < person.burgersOwed; i++) {
                        const burgerIcon = document.createElement('img');
                        burgerIcon.src = './burger.svg';
                        burgerIcon.alt = 'Burger';
                        burgerIcon.classList.add('w-8', 'h-8');
                        burgerLine.appendChild(burgerIcon);
                    }
                    iconsDiv.appendChild(burgerLine);
                }

                if (person.displayCansOwed > 0) {
                     const canLine = document.createElement('div');
                    canLine.classList.add('flex', 'items-center', 'justify-center', 'space-x-1');
                    for (let i = 0; i < person.displayCansOwed; i++) {
                        const canIcon = document.createElement('img');
                        canIcon.src = './cup.svg';
                        canIcon.alt = 'Canette';
                        canIcon.classList.add('w-7', 'h-7');
                        canLine.appendChild(canIcon);
                    }
                    iconsDiv.appendChild(canLine);
                }
                 // This case is unlikely if balance > 0 and burgers/cans are calculated, but as a fallback:
                // The `person` object from calculateLeaderboard now has:
                // name, points (total received), burgersOwed, cansOwed (remaining)
                // renderLeaderboard expects `person.burgersOwed` and `person.cansOwed` for display.
                // It also expects `person.totalCansOwed` for a fallback display if both burgersOwed and displayCansOwed are 0
                // but points is > 0. Let's ensure this case is handled or if the field name needs aligning.
                // The `renderLeaderboard` function uses `person.totalCansOwed` in one specific fallback.
                // Since `points` now holds the total, we should use that in the fallback logic.
                // For now, let's assume `renderLeaderboard` will be updated or this fallback is not critical.
                // The primary display logic for burgers and cans uses `burgersOwed` and `displayCansOwed` (which is now `cansOwed`).

                if (person.burgersOwed > 0) {
                    const burgerLine = document.createElement('div');
                    burgerLine.classList.add('flex', 'items-center', 'justify-center', 'space-x-1');
                    for (let i = 0; i < person.burgersOwed; i++) {
                        const burgerIcon = document.createElement('img');
                        burgerIcon.src = './burger.svg';
                        burgerIcon.alt = 'Burger';
                        burgerIcon.classList.add('w-8', 'h-8');
                        burgerLine.appendChild(burgerIcon);
                    }
                    iconsDiv.appendChild(burgerLine);
                }

                if (person.cansOwed > 0) { // Changed from displayCansOwed
                     const canLine = document.createElement('div');
                    canLine.classList.add('flex', 'items-center', 'justify-center', 'space-x-1');
                    for (let i = 0; i < person.cansOwed; i++) { // Changed from displayCansOwed
                        const canIcon = document.createElement('img');
                        canIcon.src = './cup.svg';
                        canIcon.alt = 'Canette';
                        canIcon.classList.add('w-7', 'h-7');
                        canLine.appendChild(canIcon);
                    }
                    iconsDiv.appendChild(canLine);
                }
                 // This case is unlikely if points > 0 and burgers/cans are calculated, but as a fallback:
                 if (person.burgersOwed === 0 && person.cansOwed === 0 && person.points > 0) { // Changed totalCansOwed to points
                    const justCansLine = document.createElement('div');
                    justCansLine.classList.add('flex', 'items-center', 'justify-center', 'space-x-1');
                     const canIcon = document.createElement('img');
                        canIcon.src = './cup.svg';
                        canIcon.alt = 'Canette';
                        canIcon.classList.add('w-7', 'h-7');
                        justCansLine.appendChild(canIcon);
                    const totalCansText = document.createElement('span');
                    totalCansText.classList.add('text-lg', 'font-semibold');
                    totalCansText.textContent = `x ${person.points}`; // Show total points if no burgers/displayCans
                    justCansLine.appendChild(totalCansText);
                    iconsDiv.appendChild(justCansLine);
                }
                spotDiv.appendChild(iconsDiv);
                podiumContainer.appendChild(spotDiv); // Append directly in order
            });
        leaderboardContainer.appendChild(podiumContainer);
    }


    // List (4th onwards)
    if (restData.length > 0) {
        const listContainer = document.createElement('div');
        listContainer.classList.add('space-y-3'); // Add space between list items

        restData.forEach((person, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add(
                'flex', 'justify-between', 'items-center', 'p-4', 
                'bg-white', 'rounded-lg', 'shadow-md', 'hover:shadow-lg', 'transition-shadow'
            );

            const rankAndNameDiv = document.createElement('div');
            rankAndNameDiv.classList.add('flex', 'items-center');

            const rankText = document.createElement('span');
            rankText.classList.add('text-gray-500', 'font-semibold', 'mr-4', 'text-lg', 'w-8'); // Fixed width for rank
            rankText.textContent = `#${index + 4}`;
            rankAndNameDiv.appendChild(rankText);

            const nameText = document.createElement('span');
            nameText.classList.add('text-gray-800', 'font-semibold', 'text-lg');
            nameText.textContent = person.name;
            rankAndNameDiv.appendChild(nameText);

            const iconsDiv = document.createElement('div');
            iconsDiv.classList.add('flex', 'items-center', 'space-x-2');

            if (person.burgersOwed > 0) {
                const burgerIcon = document.createElement('img');
                burgerIcon.src = './burger.svg';
                burgerIcon.alt = 'Burger';
                burgerIcon.classList.add('w-6', 'h-6');
                iconsDiv.appendChild(burgerIcon);
                const burgerCount = document.createElement('span');
                burgerCount.classList.add('text-sm', 'font-medium');
                burgerCount.textContent = `x ${person.burgersOwed}`;
                iconsDiv.appendChild(burgerCount);
            }

            if (person.cansOwed > 0) { // Changed from displayCansOwed
                 if (person.burgersOwed > 0) { // Add separator if burgers are also shown
                    const separator = document.createElement('span');
                    separator.textContent = '|';
                    separator.classList.add('text-gray-300', 'mx-1');
                    iconsDiv.appendChild(separator);
                }
                const canIcon = document.createElement('img');
                canIcon.src = './cup.svg';
                canIcon.alt = 'Canette';
                canIcon.classList.add('w-5', 'h-5');
                iconsDiv.appendChild(canIcon);
                const canCount = document.createElement('span');
                canCount.classList.add('text-sm', 'font-medium');
                canCount.textContent = `x ${person.cansOwed}`; // Changed from displayCansOwed
                iconsDiv.appendChild(canCount);
            }
             // Fallback for list items
             if (person.burgersOwed === 0 && person.cansOwed === 0 && person.points > 0) { // Changed totalCansOwed to points
                const canIcon = document.createElement('img');
                canIcon.src = './cup.svg';
                canIcon.alt = 'Canette';
                canIcon.classList.add('w-5', 'h-5');
                iconsDiv.appendChild(canIcon);
                const canCount = document.createElement('span');
                canCount.classList.add('text-sm', 'font-medium');
                canCount.textContent = `x ${person.points}`; // Changed from totalCansOwed
                iconsDiv.appendChild(canCount);
            }


            itemDiv.appendChild(rankAndNameDiv);
            itemDiv.appendChild(iconsDiv);
            listContainer.appendChild(itemDiv);
        });
        leaderboardContainer.appendChild(listContainer);
    }
}


// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    const viewVentilationBtn = document.getElementById('view-ventilation-btn');
    const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
    const debtsContainer = document.getElementById('debts-container');
    const leaderboardContainer = document.getElementById('leaderboard-container');

    // Initial state: Ventilation view is active
    const parsedDebts = parseDebtData(debtsData);
    renderDebts(parsedDebts);
    // leaderboardContainer.classList.add('hidden'); // Already hidden by HTML

    viewLeaderboardBtn.addEventListener('click', () => {
        debtsContainer.classList.add('hidden');
        leaderboardContainer.classList.remove('hidden');

        // Set active styles for Leaderboard button, inactive for Ventilation button
        viewLeaderboardBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        viewLeaderboardBtn.classList.add('bg-sky-500', 'text-white', 'hover:bg-sky-600', 'active-tab');
        
        viewVentilationBtn.classList.remove('bg-sky-500', 'text-white', 'hover:bg-sky-600', 'active-tab');
        viewVentilationBtn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        // The 'active-tab' class from index.html is now mainly a semantic marker for initial state,
        // JS directly controls appearance by swapping all relevant Tailwind classes.

        const totalReceivedMap = calculateTotalReceivedCans(parsedDebts);
        const leaderboardData = calculateLeaderboard(totalReceivedMap);
        renderLeaderboard(leaderboardData);
    });

    viewVentilationBtn.addEventListener('click', () => {
        leaderboardContainer.classList.add('hidden');
        debtsContainer.classList.remove('hidden');

        // Set active styles for Ventilation button, inactive for Leaderboard button
        viewVentilationBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        viewVentilationBtn.classList.add('bg-sky-500', 'text-white', 'hover:bg-sky-600', 'active-tab');

        viewLeaderboardBtn.classList.remove('bg-sky-500', 'text-white', 'hover:bg-sky-600', 'active-tab');
        viewLeaderboardBtn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        
        // Data for ventilation view is already loaded, no need to re-render unless data changes.
    });

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
