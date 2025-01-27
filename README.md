# Weather App with Additional APIs

## Description
This project is a weather application that provides real-time weather data using the OpenWeatherAPI. It also integrates two additional APIs to enhance the user experience: an Air Quality API and a Time Zone API. The app displays information such as the current weather, air quality index, local time, and coordinates, making it a comprehensive tool for understanding the environment and conditions of any given location.

The app is designed with a responsive layout, using Bootstrap to ensure optimal viewing across various devices. It runs on Node.js with Express.js, and the logic for fetching and displaying data is handled server-side.

## Team Members

Akerke - External additional API about makeup, README.md 
Ainur - Fist task abouth the OpenWeather and Map API
Darina - External additional API

## Core Features
- **Weather Information**: Displays real-time weather data including temperature, description, humidity, pressure, wind speed, and rain volume (for the last 3 hours).
- **Time Zone**: Fetches and displays the local time of a location based on its latitude and longitude.
- **Responsive Design**: Ensures a clean and functional interface across devices using Bootstrap.
- **Extended Forecast**: Displays a 14-day weather forecast with detailed information including max/min temperatures, wind direction, and sunrise/sunset times.

## APIs Used
- **OpenWeatherAPI**: Provides real-time weather data including temperature, humidity, wind speed, weather description, rain volume (last 3 hours), and more. This data is displayed on the frontend for users to check the weather conditions of any given city.
- **Makeup API**: Offers makeup product recommendations based on user preferences. It provides data on makeup products, including their name, brand, price, and other details, which is integrated into the frontend for users to explore beauty products alongside the weather information.
- **Map API (e.g., Google Maps API)**: Displays the location of cities based on their latitude and longitude. This API is used to visually showcase the location of a city on a map, enhancing the user's understanding of the weather conditions by showing the exact geographic location.
- **Food Nutrients (USDA) API**: Offers the nutrient facts about every product and dish, reveals several results based on the format of the food.
## Setup Instructions
### Prerequisites
Ensure that Node.js and npm are installed. You can download them from [here](https://nodejs.org/).

Additionally, make sure you have the following dependencies installed:
- **Express.js**: A web framework for Node.js.
- **Axios**: A promise-based HTTP client for making API requests.
- **dotenv**: A module to load environment variables from a `.env` file.
- **Bootstrap**: A CSS framework for responsive design

These dependencies will be installed automatically by running the `npm install` command, as they are listed in the `package.json` file.

### Steps:
1. **Clone the repository**:
   Open your terminal and run the following command to clone the repository:
   ```bash
   git clone <repository-url>
   cd weather-app

2. **Install dependencies: Install all required dependencies by running:**
    npm install
3. **Start the server**
    npm start

1. **OpenWeather API Integration**:

Endpoint
https://api.openweathermap.org/data/2.5/weather

Required parameters:
q: City name
appid: Your OpenWeather API key
units: Unit of measurement (e.g., metric for Celsius)
lang: Language for weather description (e.g., en for English)
How It Works
The application fetches real-time weather data for a predefined city using the OpenWeather API.
The data includes weather details such as temperature, humidity, pressure, and wind speed.
The data is then passed to the frontend to be displayed to the user.

2. **Map API Integration (e.g., Google Maps API)**

Endpoint
https://maps.googleapis.com/maps/api/geocode/json

Required parameters:
address: The city or location name
key: Your Google Maps API key
How It Works
The application uses the latitude and longitude obtained from the weather data to display the location of the city on a map.
This helps users visualize the geographic location and context of the weather data.

3. **Makeup API Integration**:

### Overview
The **Makeup API** provides access to a variety of makeup product data, including the product's name, brand, price, image, and description. The API allows users to explore makeup products based on specific queries or preferences, making it an excellent addition to your health and beauty application. This API is used on the server side to fetch makeup product data, which is then passed to the frontend to be displayed to the user.

### API Integration in the Backend
The logic for interacting with the Makeup API is implemented in the server-side JavaScript file (`core.js` or your main server file). This ensures that the API logic is executed on the backend, keeping the frontend clean and focused solely on displaying the data.

### Steps for Integrating Makeup API

1. **Install Axios**
   First, you need to install the Axios library, which is used for making HTTP requests to external APIs. You can install it using npm:
   ```bash
   npm install axios

2. **Make a GET Request**
In your backend file (core.js or app.js), you can use Axios to make a GET request to the Makeup API and fetch makeup product data.

3. **Display Data on Frontend**
Once the data is fetched from the Makeup API, it is sent to the frontend to be displayed in the user interface. 

3. **Food Nutrient API Integration**:
### Overview
Overview: The Food Nutrients (USDA) API provides nutrient facts about various food items and dishes. It reveals several results based on the format of the food, including details such as calories, protein, carbohydrates, and fat content.

### Steps for Integrating Food Nutrients API:

Install Axios: First, you need to install the Axios library, which is used for making HTTP requests to external APIs. You can install it using npm (npm install axios)

Also, install chalk@4 (npm install chalk@4)

Make a GET Request: In your backend file (core.js or app.js), you can use Axios to make a GET request to the Food Nutrients API and fetch nutrient data

Display Data on Frontend: Once the data is fetched from the Food Nutrients API, it is sent to the frontend to be displayed in the user interface