const express = require('express');
const router = express.Router();
const MakeupHistory = require('../MakeupHistory');

router.post('/makeup/saveHistory', async (req, res) => {
    try {
        const { query, results, userId } = req.body;

        console.log('Received data:', { query, results, userId }); 

        if (!query || !results || !results.length) {
            return res.status(400).json({ message: 'Query and results are required' });
        }

        const makeupHistory = new MakeupHistory({
            query: query,
            results: results,
            userId: userId,
            createdAt: new Date()
        });

        console.log('Saving makeup history:', makeupHistory); 

        await makeupHistory.save();
        res.status(200).json({ message: 'Makeup history saved successfully' });
    } catch (err) {
        console.error('Error saving makeup history:', err);
        res.status(500).json({ message: 'Error saving makeup history' });
    }
});


router.get('/makeupHistory', async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        const makeupHistories = await MakeupHistory.find({ userId }).sort({ createdAt: -1 });

        console.log('Fetched makeup histories:', makeupHistories); 

        res.render('makeupHistory', {
            page: 'makeupHistory',
            user: req.session.user,
            history: makeupHistories 
        });
    } catch (err) {
        console.error('Error fetching makeup history:', err);
        res.status(500).send('Error fetching makeup history');
    }
});


module.exports = router;
