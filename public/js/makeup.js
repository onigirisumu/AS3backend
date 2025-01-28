async function searchMakeup() {
    const makeupName = document.getElementById('makeup-name').value.trim();
    const makeupResultsSection = document.getElementById('makeup-results');
    const makeupOutput = document.getElementById('makeup-output');

    if (!makeupName) {
        alert('Please enter a makeup product name.');
        return;
    }

    makeupOutput.innerHTML = '<p>Loading...</p>';
    makeupResultsSection.style.display = 'block';

    try {
        const response = await fetch(`/makeup/search?query=${encodeURIComponent(makeupName)}`);

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        makeupOutput.innerHTML = '';

    
        if (data.makeupData && data.makeupData.length > 0) {
            data.makeupData.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('product-card');

                productDiv.innerHTML = `
                    <div class="product-card-inner">
                        <img src="${product.image_link}" alt="${product.name}" class="product-image">
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-description">${product.description || 'No description available.'}</p>
                            <p class="product-price"><strong>Price:</strong> ${product.price || 'N/A'} ${product.price_sign || ''}</p>
                            <a href="${product.product_link}" target="_blank" class="product-link">More Info</a>
                        </div>
                    </div>
                `;
                makeupOutput.appendChild(productDiv);
            });
        } else {
            makeupOutput.innerHTML = '<p>No products found for your search.</p>';
        }
    } catch (error) {
        makeupOutput.innerHTML = `<p>Error fetching makeup products: ${error.message}</p>`;
        console.error('Error fetching makeup data:', error);
    }
}
