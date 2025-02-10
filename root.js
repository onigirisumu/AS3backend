const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bmiRoutes = require('./routes/bmiRoutes');
const makeupRoutes = require('./routes/makeupRoutes');
const bonusRoutes = require('./routes/bonusRoutes');
const axios = require('axios');
const dotenv = require('dotenv');
const chalk = require('chalk');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const port = 3000;
app.use(cookieParser());
const MakeupHistory = require('./MakeupHistory');


const i18n = require('i18n');

i18n.configure({
  locales: ['en', 'fr', 'ru', 'es'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  cookie: 'lang',
  autoReload: true,
  updateFiles: false,
  objectNotation: true
});
  
app.use(i18n.init);

app.get('/lang/:locale', (req, res) => {
  const locale = req.params.locale;
  res.cookie('lang', locale, { maxAge: 900000, httpOnly: true });
  res.setLocale(locale);
  res.redirect('back');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'yourSecretKey', resave: false, saveUninitialized: false }));
app.use('/bonus', bonusRoutes);

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/makeup', makeupRoutes);

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: uuidv4,
    unique: true
  },
  firstName: String,
  lastName: String,
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: false },
  gender: String,
  age: Number,
  password: String,
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  images: [String],
});

const Product = mongoose.model('Product', productSchema);

const makeupDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  makeupId: String,
  name: String,
  price: String,
  image: String,
  description: String,
  productType: String,
  productLink: String,
  timestamp: { type: Date, default: Date.now }
});

const MakeupData = mongoose.model('MakeupData', makeupDataSchema);


const History = require('./public/js/history');

const { TranslationServiceClient } = require('@google-cloud/translate').v3;
const translationClient = new TranslationServiceClient();

/**
 * @param {string} text 
 * @param {string} targetLanguage 
 * @returns {Promise<string>} 
 */

async function translateText(text, targetLanguage) {
  const apiKey = 'AIzaSyB7OKfzniEz1CSA_K_Ir0Ou811yISLlJAE'; 
  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        q: text,
        source: 'en',
        target: targetLanguage,
        format: 'text'
      }
    );
    
    if (
      response.data &&
      response.data.data &&
      response.data.data.translations &&
      response.data.data.translations.length > 0
    ) {
      return response.data.data.translations[0].translatedText;
    }
    return text;
  } catch (error) {
    console.error('Translation error:', error.message);
    return text; 
  }
}


async function createAdmin() {
  const adminUsernames = process.env.ADMIN_USERS.split(',');
  const adminPasswords = process.env.ADMIN_PASSWORDS.split(',');

  for (let i = 0; i < adminUsernames.length; i++) {
    const username = adminUsernames[i];
    const password = adminPasswords[i];
    const adminExists = await User.findOne({ username });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = new User({
        username,
        password: hashedPassword,
        isAdmin: true,
      });
      try {
        await admin.save();
        console.log(`Admin ${username} created`);
      } catch (err) {
        console.log(`Error creating admin ${username}:`, err);
      }
    } else {
      console.log(`Admin ${username} already exists`);
    }
  }
}

createAdmin().then(() => console.log('Admin check complete'));

async function adminLogin(req, res) {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).send('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send('Invalid password');
  }

  req.session.userId = user._id;
  req.user = user;
  res.locals.user = user;

  if (user.isAdmin) {
    return res.redirect('/admin');
  }
  res.redirect('/');
}

app.post('/login', async (req, res) => {
  try {
    await adminLogin(req, res);
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    } catch (err) {
      console.error('Error when receiving the user:', err);
    }
  }
  next();
});

function isAdmin(req, res, next) {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  if (req.session.userId === 'admin' || (req.session.userId && req.user && req.user.isAdmin)) {
    return next();
  } else {
    res.status(403).send('Access denied');
  }
}

app.get('/', async (req, res) => {
  const user = req.user || null;
  const products = await Product.find();
  res.render('home', { user, products, page: 'home' });
});

app.post('/add-product', isAdmin, async (req, res) => {
  const { title, category, description } = req.body;
  let { images } = req.body;

  images = images.split(',').map(url => url.trim()).slice(0, 3);

  try {
    const newProduct = new Product({ title, category, description, images });
    await newProduct.save();
    res.redirect('/');
  } catch (err) {
    console.error('Product adding error:', err);
    res.status(500).send('Server error');
  }
});

app.post('/update/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, category, description } = req.body;
  let { images } = req.body;

  console.log('req.body:', req.body);

  if (images) {
    images = images.split(',').map(url => url.trim()).slice(0, 3);
  } else {
    images = [];
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send('Product');
    }

    if (title) product.title = title;
    if (category) product.category = category;
    if (description) product.description = description;
    if (images.length > 0) product.images = images;

    await product.save();
    console.log('The product is updated:', product);
    res.redirect('/');
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).send('Server error');
  }
});

app.post('/update-empty-block/:id', isAdmin, async (req, res) => {
  const { title, category, description } = req.body;
  let { images } = req.body;

  images = images ? images.split(',').map(url => url.trim()).slice(0, 3) : [];

  try {
    const newProduct = new Product({ title, category, description, images });
    await newProduct.save();
    res.redirect('/');
  } catch (err) {
    console.error('Error in creating a new product:', err);
    res.status(500).send('Server error');
  }
});

app.post('/clear-product/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Product.findByIdAndDelete(id);
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).send('Server error');
  }
});

app.get('/admin', isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.render('admin', { user: req.user, users: users, page: 'admin' });
  } catch (err) {
    console.log('Error fetching users:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/admin/add-user', isAdmin, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email: email || undefined,
      password: hashedPassword,
    });

    await newUser.save();
    res.redirect('/admin');
  } catch (err) {
    if (err.code === 11000 && err.keyPattern.username) {
      return res.status(400).send('Username already exists');
    } else {
      console.error('Error adding user: ', err);
      res.status(500).send('Error adding user');
    }
  }
});

app.get('/', async (req, res) => {
  console.log('Current locale:', res.getLocale());
  const user = req.user || null;
  const products = await Product.find();
  res.render('home', { user, products, page: 'home' });
});

app.post('/admin/edit-user/:id', isAdmin, async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, username, email, gender, age, password, isAdmin } = req.body;

  console.log('Received data:', req.body);

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.email = email;
    user.gender = gender;
    user.age = age;
    user.isAdmin = isAdmin === 'on';

    if (hashedPassword) {
      user.password = hashedPassword;
    }

    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error editing user:', err);
    res.status(500).json({ success: false, message: 'Error editing user' });
  }
});

app.post('/admin/delete-user/:id', isAdmin, async (req, res) => {
  const userId = req.params.id;
  
  try {
    await User.findByIdAndDelete(userId);
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Error deleting user');
  }
});

// Set view engine and static assets
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/login', (req, res) => {
  const user = req.session.userId;
  res.render('login', { page: 'login', user });
});

app.get('/makeup', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    const response = await axios.get('https://makeup-api.herokuapp.com/api/v1/products.json', {
      params: { brand: 'nyx' }
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).send('No makeup products found.');
    }

    const makeupData = response.data.filter(product => product.image_link && product.image_link.trim() !== "");
    const userId = req.session.userId;

    const savePromises = makeupData.map(async product => {
      const exists = await MakeupData.findOne({ userId, makeupId: product.id });
      if (!exists) {
        const newProduct = new MakeupData({
          userId,
          makeupId: product.id,
          name: product.name,
          price: product.price,
          image: product.image_link,
          description: product.description,
          productType: product.product_type,
          productLink: product.product_link,
        });
        return newProduct.save();
      }
    });

    await Promise.all(savePromises);

    res.render('makeup', {
      makeupData,
      user: req.user,
      page: 'makeup'
    });
  } catch (error) {
    console.error('Error fetching makeup data:', error);
    res.status(500).send('Error fetching makeup products.');
  }
});

app.get('/makeup/search', async (req, res) => {
  const searchQuery = req.query.query; 
  if (!searchQuery) {
    return res.status(400).send('Query parameter is required');
  }

  try {
    const makeupResponse = await axios.get('https://makeup-api.herokuapp.com/api/v1/products.json', {
      params: { brand: 'nyx' }
    });

    const makeupData = makeupResponse.data;

    if (makeupData && makeupData.length > 0) {
      const filteredProducts = makeupData.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        product.image_link && 
        product.image_link.trim() !== ""
      );

      if (filteredProducts.length > 0) {
        return res.json({ makeupData: filteredProducts });
      } else {
        return res.status(404).send('No NYX products found matching your search.');
      }
    } else {
      return res.status(404).send('No NYX products available at the moment.');
    }
  } catch (error) {
    console.error('Error fetching makeup data:', error);
    res.status(500).send('Error fetching makeup products. Please try again later.');
  }
});

app.post('/makeup/saveHistory', async (req, res) => {
  console.log('Saving history:', req.body); 

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { query, results } = req.body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: 'No results to save' });
    }

    const transformedResults = results.map(product => ({
      product_name: product.name,     
      image_url: product.image_link,   
    }));

    const historyEntry = new MakeupHistory({
      userId: req.session.userId,
      query: query, 
      results: transformedResults
    });

    await historyEntry.save();
    console.log('Makeup search history saved successfully.');
    res.status(201).json({ message: 'Search history saved successfully' });
  } catch (error) {
    console.error('Error saving makeup search history:', error);
    res.status(500).json({ error: 'Error saving search history' });
  }
});



app.get('/makeupHistory', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    const history = await MakeupHistory.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    console.log('Makeup History:', history);
    res.render('makeupHistory', {
      history,
      user: req.user,
      page: 'makeupHistory',
    });
  } catch (err) {
    console.error('Error fetching makeup history:', err);
    res.status(500).send('Error fetching makeup history');
  }
});

app.get('/signup', (req, res) => {
  const user = req.session.user || null;
  res.render('signup', { user, page: 'signup' });
});

app.post('/signup', async (req, res) => {
  const { firstName, lastName, username, email, gender, age, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    firstName,
    lastName,
    username,
    email, 
    gender,
    age,
    password: hashedPassword,
  });

  try {
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.status(500).send('Error creating user');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).send('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send('Invalid password');
  }

  req.session.userId = user._id;
  res.redirect('/');
});

app.get('/profile', async (req, res) => {
  const user = req.session.userId ? await User.findById(req.session.userId) : null;
  if (!user) {
    return res.redirect('/login');
  }
  res.render('profile', { user, page: 'profile' });
});

app.post('/updateProfile', async (req, res) => {
  const { username, firstName, lastName, email, gender, age, oldPassword, newPassword } = req.body;
  const user = await User.findById(req.session.userId);

  if (!user) {
    return res.status(400).send('User not found');
  }

  user.username = username;
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email; 
  user.gender = gender;
  user.age = age;

  if (oldPassword && newPassword) {
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (isMatch) {
      user.password = await bcrypt.hash(newPassword, 10);
    } else {
      return res.status(400).send('Incorrect old password');
    }
  }
  await user.save();
  res.status(200).send('Profile updated successfully');
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect(req.body.redirectPath || '/admin/login');
  });
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/bmiCalculator', async (req, res) => {
  const user = req.session.userId ? await User.findById(req.session.userId) : null;
  res.render('bmiCalculator', { user, page: 'bmi' });
});

app.get('/nutrient', async (req, res) => {
  const user = req.session.userId ? await User.findById(req.session.userId) : null;
  res.render('nutrient', { user, page: 'nutrient' });
});

app.get('/history', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); 
  }

  try {
    const history = await History.find({ userId: req.session.userId }).sort({ createdAt: -1 }); 
    res.render('history', { history, user: req.user, page: 'history' }); 
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).send('Error fetching history');
  }
});

app.use('/bmicalculator', bmiRoutes);

// Duplicate login view route (if needed, consider consolidating)
app.get('/login', (req, res) => {
  res.render('login');
});

// Weather data API route
app.get('/weather/data', async (req, res) => {
  try {
    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: 'Astana',
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric',
        lang: 'en'
      }
    });

    const weatherData = weatherResponse.data;
    const responseData = {
      temperature: weatherData.main.temp,
      description: weatherData.weather[0].description,
      icon: `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`,
      coordinates: {
        latitude: weatherData.coord.lat,
        longitude: weatherData.coord.lon
      },
      feelsLike: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      windSpeed: weatherData.wind.speed,
      countryCode: weatherData.sys.country,
      rainVolume: weatherData.rain ? weatherData.rain['3h'] : 0
    };

    console.log("Weather data:", JSON.stringify(responseData, null, 2));

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

// Locations API route
const locations = [
  { name: 'Sport Club', latitude: 51.1284, longitude: 71.4304, description: 'A modern gym with all the equipment you need.' },
  { name: 'Beauty Hub', latitude: 51.0904, longitude: 71.3986, description: 'Join our beauty center and be yourself.' },
  { name: 'Yoga Studio', latitude: 51.1692, longitude: 71.4016, description: 'Relax and rejuvenate at our yoga studio.' }
];

app.get('/api/locations', (req, res) => {
  console.log("Requested locations:", JSON.stringify(locations, null, 2));
  res.json(locations);
});

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/api/food/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const targetLanguage = req.getLocale();
  console.log(chalk.blue(`Original query: ${query} | User language: ${targetLanguage}`));

  let searchQuery = query;
  if (targetLanguage !== 'en') {
    searchQuery = await translateText(query, 'en');
    console.log(chalk.blue(`Translated query to English: ${searchQuery}`));
  }

  try {
    const apiResponse = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
      params: {
        api_key: process.env.FOODDATA_API_KEY,
        query: searchQuery,
        pageSize: 10,
      }
    });

    if (!apiResponse.data || !apiResponse.data.foods) {
      return res.status(404).json({ error: 'No foods found in API response' });
    }

    let foodResults = apiResponse.data.foods.map(food => ({
      description: food.description || "",
      nutrients: (food.foodNutrients && Array.isArray(food.foodNutrients))
        ? food.foodNutrients.map(nutrient => ({
            name: nutrient.nutrientName || "",
            value: nutrient.value,
            unit: nutrient.unitName || ""
          }))
        : [],
      brand: food.brandOwner || 'N/A'
    }));

    if (targetLanguage !== 'en') {
      foodResults = await Promise.all(foodResults.map(async food => {
        const translatedDescription = food.description
          ? await translateText(food.description, targetLanguage)
          : "";
        return { ...food, description: translatedDescription };
      }));
    }

    const historyEntry = new History({
      userId: req.session.userId || null,
      query: query, 
      results: foodResults
    });
    await historyEntry.save();
    console.log(chalk.green('History entry saved.'));

    res.json(foodResults);
  } catch (error) {
    console.error(chalk.red('Error fetching food data:'), error.message);
    res.status(500).json({ error: 'Failed to fetch food data' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Open http://localhost:${port} in your browser to access the application`);
});
