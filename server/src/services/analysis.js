const { STEMS, BRANCHES, ELEMENTS, getTenGod, getVitality, SEASONS, VITALITY_ENGLISH, STEM_ENGLISH_NAMES } = require('../constants');

function analyzePillars(pillars, dayMaster, gender) {
  const dmStem = dayMaster.stem;
  const dmElement = dayMaster.element;
  const monthBranch = pillars.month.branch;

  const vitality = getVitality(monthBranch, dmElement);
  const season = SEASONS[monthBranch] || '';

  const allStems = [
    { pillar: 'year', stem: pillars.year.stem },
    { pillar: 'month', stem: pillars.month.stem },
    { pillar: 'day', stem: pillars.day.stem },
    { pillar: 'hour', stem: pillars.hour.stem },
  ];

  const tenGodList = allStems.map(s => ({
    pillar: s.pillar,
    stem: s.stem,
    ...getTenGod(dmStem, s.stem),
  }));

  const hiddenTenGods = {};
  for (const p of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[p];
    hiddenTenGods[p] = pillar.hiddenStems.map(hs => ({
      stem: hs.stem,
      ...(hs.tenGod ? hs.tenGod : {}),
    }));
  }

  const elementCount = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  const allElements = [];

  const addElement = (el, weight) => {
    if (el && elementCount[el] !== undefined) {
      elementCount[el] += weight;
      allElements.push(el);
    }
  };

  addElement(dmElement, 3);

  for (const p of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[p];
    addElement(pillar.stemElement, 2);
    addElement(pillar.branchElement, 1);
    pillar.hiddenStems.forEach(hs => addElement(hs.element, 0.5));
  }

  for (const el of Object.keys(elementCount)) {
    elementCount[el] = Math.round(elementCount[el] * 10) / 10;
  }

  const dominantElement = Object.entries(elementCount)
    .sort((a, b) => b[1] - a[1])[0][0];

  const strongest = Object.entries(elementCount)
    .filter(([k, v]) => v === Math.max(...Object.values(elementCount)))
    .map(([k]) => k);

  const interpretations = generateInterpretations(dmElement, tenGodList, vitality, elementCount, gender, dayMaster, season);

  return {
    tenGods: tenGodList,
    tenGodsFull: { stems: tenGodList, hidden: hiddenTenGods },
    fiveElements: {
      wood: { score: elementCount.Wood, label: 'Wood' },
      fire: { score: elementCount.Fire, label: 'Fire' },
      earth: { score: elementCount.Earth, label: 'Earth' },
      metal: { score: elementCount.Metal, label: 'Metal' },
      water: { score: elementCount.Water, label: 'Water' },
    },
    dominantElement,
    strongest,
    vitality: { season, state: vitality.state, stateEn: vitality.stateEn },
    interpretations,
  };
}

function generateInterpretations(dmElement, tenGodList, vitality, elementCount, gender, dayMaster, season) {
  const dmStem = dayMaster.stem;
  const stemInfo = STEMS[dmStem];
  const dmEnglish = stemInfo ? stemInfo.english : dmStem;
  const dmYinYang = stemInfo ? stemInfo.yinYang : '';
  const dmElementCh = stemInfo ? stemInfo.elementCh : '';

  const personality = [];
  const career = [];
  const wealth = [];
  const relationships = [];
  const health = [];

  personality.push({
    aspect: 'dayMaster',
    text: `Your Day Master is ${dmEnglish} (${dmYinYang} ${stemInfo.element}). This represents your core self and life force.`,
    level: 'primary',
  });

  if (vitality.season) {
    const hasHelp = elementCount[ELEMENTS[dmElement]?.generate] > 2;
    if (vitality.state === '旺') {
      personality.push({ aspect: 'vitality', text: `Born in ${vitality.season}, ${stemInfo.element} is ${vitality.stateEn} — you are at your peak season of vitality.`, level: 'strong' });
    } else if (vitality.state === '相') {
      personality.push({ aspect: 'vitality', text: `Born in ${vitality.season}, ${stemInfo.element} is ${vitality.stateEn} — you have moderate energy for growth.`, level: 'medium' });
    } else if (vitality.state === '休') {
      personality.push({ aspect: 'vitality', text: `Born in ${vitality.season}, ${stemInfo.element} is ${vitality.stateEn} — a time for rest and reflection.`, level: 'low' });
    } else if (vitality.state === '囚') {
      personality.push({ aspect: 'vitality', text: `Born in ${vitality.season}, ${stemInfo.element} is ${vitality.stateEn} — you may face external constraints.`, level: 'low' });
    } else if (vitality.state === '死') {
      personality.push({ aspect: 'vitality', text: `Born in ${vitality.season}, ${stemInfo.element} is ${vitality.stateEn} — energy is low, conserve and nurture yourself.`, level: 'weak' });
    }
  }

  const hasWealthGod = tenGodList.some(tg => tg.type === 'wealth');
  const hasOfficerGod = tenGodList.some(tg => tg.type === 'authority');
  const hasResourceGod = tenGodList.some(tg => tg.type === 'resource');

  if (hasOfficerGod) {
    const officerGods = tenGodList.filter(tg => tg.type === 'authority');
    for (const og of officerGods) {
      if (og.english === 'Direct Officer') {
        career.push({ aspect: 'officer', text: `${og.english} (${og.chinese}) present: You have a strong sense of responsibility and discipline. Suited for structured roles and leadership.`, level: 'strong' });
      } else {
        career.push({ aspect: 'officer', text: `${og.english} (${og.chinese}) present: You thrive in competitive environments. Ambitious and willing to take risks.`, level: 'strong' });
      }
    }
  } else {
    career.push({ aspect: 'officer', text: `No Authority stars in the chart. You prefer freedom and may resist rigid hierarchies.`, level: 'neutral' });
  }

  if (hasWealthGod) {
    const wealthGods = tenGodList.filter(tg => tg.type === 'wealth');
    for (const wg of wealthGods) {
      if (wg.english === 'Direct Wealth') {
        wealth.push({ aspect: 'wealth', text: `${wg.english} (${wg.chinese}) present: Stable and consistent financial approach. Good at saving and managing resources.`, level: 'strong' });
      } else {
        wealth.push({ aspect: 'wealth', text: `${wg.english} (${wg.chinese}) present: Entrepreneurial spirit. You may have multiple income streams.`, level: 'strong' });
      }
    }
  } else {
    wealth.push({ aspect: 'wealth', text: `No Wealth stars in the main stems. You may need to work harder on financial accumulation.`, level: 'neutral' });
  }

  if (hasResourceGod) {
    const resourceGods = tenGodList.filter(tg => tg.type === 'resource');
    for (const rg of resourceGods) {
      if (rg.english === 'Direct Resource') {
        personality.push({ aspect: 'resource', text: `${rg.english} (${rg.chinese}) present: You are nurturing and supportive. Strong learning ability and family orientation.`, level: 'strong' });
      } else {
        personality.push({ aspect: 'resource', text: `${rg.english} (${rg.chinese}) present: You have unique talents and unconventional wisdom. Deep thinking and creativity.`, level: 'strong' });
      }
    }
  }

  const outputGods = tenGodList.filter(tg => tg.type === 'output');
  if (outputGods.length > 0) {
    for (const og of outputGods) {
      if (og.english === 'Eating God') {
        personality.push({ aspect: 'output', text: `${og.english} (${og.chinese}) present: You are articulate, creative, and enjoy life's pleasures.`, level: 'strong' });
      } else {
        personality.push({ aspect: 'output', text: `${og.english} (${og.chinese}) present: You are talented and expressive but may sometimes speak too directly.`, level: 'strong' });
      }
    }
  }

  const friendGods = tenGodList.filter(tg => tg.type === 'self');
  if (friendGods.length > 0) {
    const hasRob = friendGods.some(fg => fg.english === 'Rob Wealth');
    const hasFriend = friendGods.some(fg => fg.english === 'Friend');
    if (hasFriend) {
      relationships.push({ aspect: 'friends', text: `Friend (${friendGods.find(f=>f.english==='Friend')?.chinese}) present: Strong peer network. You are independent and self-reliant.`, level: 'strong' });
    }
    if (hasRob) {
      relationships.push({ aspect: 'friends', text: `Rob Wealth (${friendGods.find(f=>f.english==='Rob Wealth')?.chinese}) present: Competitive in social settings. You may face rivalry in close circles.`, level: 'medium' });
    }
  } else {
    relationships.push({ aspect: 'friends', text: `Few peer stars visible. You may prefer solitude or smaller social circles.`, level: 'neutral' });
  }

  const fiveElementSummary = generateFiveElementSummary(elementCount, dmElement);

  return {
    summaries: {
      dayMaster: {
        title: `Your Day Master is ${dmEnglish} (${dmYinYang} ${stemInfo.element})`,
        body: `The Day Master represents your core self. As ${dmEnglish} ${stemInfo.element}, your nature reflects the qualities of ${stemInfo.element.toLowerCase()} — ${getElementMetaphor(stemInfo.element)}. Born in ${season} when ${stemInfo.element} is in "${vitality.stateEn}" state, your ${stemInfo.element.toLowerCase()} energy is ${vitality.state === '旺' ? 'at its peak — you are strong, confident, and capable of great achievements.' : vitality.state === '相' ? 'growing steadily — you have moderate strength and good potential.' : vitality.state === '休' ? 'resting — you may feel low energy and should focus on self-care.' : vitality.state === '囚' ? 'constrained — external factors may be limiting your expression.' : 'declining — this is a time for conservation, not expansion.'}`,
      },
      personality: { title: 'Personality & Character', items: personality },
      career: { title: 'Career & Ambition', items: career },
      wealth: { title: 'Wealth & Finance', items: wealth },
      relationships: { title: 'Relationships & Social', items: relationships },
      health: { title: 'Health & Vitality', items: health },
    },
    fiveElementSummary,
  };
}

function getElementMetaphor(element) {
  const metaphors = {
    'Wood': 'growth, flexibility, creativity, and expansion like a tree reaching for the sky',
    'Fire': 'passion, brilliance, warmth, and transformation like a radiant flame',
    'Earth': 'stability, nourishment, reliability, and support like fertile soil',
    'Metal': 'strength, precision, structure, and determination like forged steel',
    'Water': 'wisdom, adaptability, depth, and flow like a river finding its way',
  };
  return metaphors[element] || 'balance and harmony';
}

function generateFiveElementSummary(elementCount, dmElement) {
  const maxScore = Math.max(...Object.values(elementCount), 1);
  const total = Object.values(elementCount).reduce((a, b) => a + b, 0);

  const percentages = {};
  for (const [el, score] of Object.entries(elementCount)) {
    percentages[el] = total > 0 ? Math.round((score / total) * 100) : 0;
  }

  const sorted = Object.entries(elementCount).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  const weakest = sorted[sorted.length - 1][0];

  const balanced = sorted[0][1] - sorted[sorted.length - 1][1] < 2;

  let balanceText;
  if (balanced) {
    balanceText = 'Your five elements are well-balanced, indicating harmony across different life aspects.';
  } else {
    balanceText = `${strongest} is your dominant element, while ${weakest} is the weakest in your chart. Consider activities and environments that strengthen ${weakest} energy.`;
  }

  return { percentages, strongest, weakest, balanceText, balanced };
}

module.exports = { analyzePillars };