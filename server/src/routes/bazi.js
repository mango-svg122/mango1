const express = require('express');
const router = express.Router();
const { calculateBazi } = require('../services/bazi');
const { analyzePillars } = require('../services/analysis');
const { calculateFortune } = require('../services/fortune');

router.post('/calculate', (req, res) => {
  try {
    const { year, month, day, hour, minute, gender, tzOffset, lng, lat } = req.body;

    if (!year || !month || !day || !gender || hour === undefined || minute === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: year, month, day, hour, minute, gender',
      });
    }

    if (gender !== 'male' && gender !== 'female') {
      return res.status(400).json({ error: 'Gender must be "male" or "female"' });
    }

    const baziData = calculateBazi({ year, month, day, hour, minute, gender, lng, lat, tzOffset });

    const analysis = analyzePillars(baziData.pillars, baziData.dayMaster, gender);

    const fortune = calculateFortune(gender, baziData.pillars, year);

    res.json({
      success: true,
      data: {
        ...baziData,
        analysis,
        fortune,
      },
    });
  } catch (err) {
    console.error('BaZi calculation error:', err);
    res.status(500).json({ error: 'Calculation failed: ' + err.message });
  }
});

module.exports = router;