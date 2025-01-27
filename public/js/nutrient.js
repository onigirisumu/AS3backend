async function searchFood() {
    const foodName = document.getElementById('food-name').value;
    const results = document.getElementById('food-results');
    const output = document.getElementById('food-output');

    results.style.display = 'block';
    output.innerHTML = `<p>Searching for: <strong>${foodName}</strong>...</p>`;

    try {
        const response = await fetch(`/api/food/search?query=${encodeURIComponent(foodName)}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.length > 0) {
            output.innerHTML = data.map(food => `
                <div>
                    <h3>${food.description}</h3>
                    <p><strong>Calories:</strong> ${food.nutrients.find(n => n.name === "Energy")?.value || "N/A"} kcal</p>
                    <p><strong>Protein:</strong> ${food.nutrients.find(n => n.name === "Protein")?.value || "N/A"} g</p>
                    <p><strong>Carbohydrates:</strong> ${food.nutrients.find(n => n.name === "Carbohydrate, by difference")?.value || "N/A"} g</p>
                    <p><strong>Fat:</strong> ${food.nutrients.find(n => n.name === "Total lipid (fat)")?.value || "N/A"} g</p>
                </div>
            `).join('');
        } else {
            output.innerHTML = `<p>No results found for "${foodName}".</p>`;
        }
    } catch (error) {
        output.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
    }
}