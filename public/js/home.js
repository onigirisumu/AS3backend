async function initMap(latitude, longitude, locations = []) {
    const map = L.map('mapid').setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    locations.forEach(location => {
        L.marker([location.latitude, location.longitude]).addTo(map)
            .bindPopup(`<b>${location.name}</b><br>${location.description}`)
            .openPopup();
    });
}

async function setupMap() {
    const astanaLat = 51.1694;
    const astanaLon = 71.4491;

    try {
        const response = await fetch('/api/locations');
        const locations = await response.json();
        initMap(astanaLat, astanaLon, locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
    }
}


async function getWeather() {
    try {
        const response = await fetch('/weather/data');
        const data = await response.json();
        console.log('Weather data:', data);
        document.getElementById('temperature').textContent = `${data.temperature} °C`;
        document.getElementById('description').textContent = data.description;
        document.getElementById('icon').src = data.icon;
        document.getElementById('coordinates').textContent = `Lat: ${data.coordinates.latitude}, Lon: ${data.coordinates.longitude}`;
        document.getElementById('feels-like').textContent = `${data.feelsLike} °C`;
        document.getElementById('humidity').textContent = `${data.humidity} %`;
        document.getElementById('pressure').textContent = `${data.pressure} hPa`;
        document.getElementById('wind-speed').textContent = `${data.windSpeed} m/s`;
        document.getElementById('country-code').textContent = data.countryCode;
        document.getElementById('rain-volume').textContent = `${data.rainVolume || 0} mm`;

        initMap(data.coordinates.latitude, data.coordinates.longitude);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function getMakeupProducts() {
    try {
        const response = await fetch('http://localhost:3000/makeup/data'); 
        const products = await response.json();
        
        const makeupContainer = document.getElementById('makeup-products');
        makeupContainer.innerHTML = ''; 

        const limitedProducts = products.slice(0, 8);

        limitedProducts.forEach(product => { 
            const productCard = document.createElement('div');
            productCard.className = 'card mb-4';

            productCard.innerHTML = `
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description || 'No description available.'}</p>
                    <p class="card-text font-weight-bold">${product.price ? '$' + product.price : 'Price not available'}</p>
                    <a href="${product.productLink}" target="_blank" class="btn btn-primary btn-sm">View Product</a>
                </div>
            `;

            makeupContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error fetching makeup products:', error);
    }
}

setupMap();
getWeather();
getMakeupProducts();
