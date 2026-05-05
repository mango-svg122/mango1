const Engine = (() => {
  const STEMS = {
    '甲': { idx: 0, english: 'Jia',  element: 'Wood',  yinYang: 'Yang', elementCh: '木' },
    '乙': { idx: 1, english: 'Yi',   element: 'Wood',  yinYang: 'Yin', elementCh: '木' },
    '丙': { idx: 2, english: 'Bing', element: 'Fire',  yinYang: 'Yang', elementCh: '火' },
    '丁': { idx: 3, english: 'Ding', element: 'Fire',  yinYang: 'Yin', elementCh: '火' },
    '戊': { idx: 4, english: 'Wu',   element: 'Earth', yinYang: 'Yang', elementCh: '土' },
    '己': { idx: 5, english: 'Ji',   element: 'Earth', yinYang: 'Yin', elementCh: '土' },
    '庚': { idx: 6, english: 'Geng', element: 'Metal', yinYang: 'Yang', elementCh: '金' },
    '辛': { idx: 7, english: 'Xin',  element: 'Metal', yinYang: 'Yin', elementCh: '金' },
    '壬': { idx: 8, english: 'Ren',  element: 'Water', yinYang: 'Yang', elementCh: '水' },
    '癸': { idx: 9, english: 'Gui',  element: 'Water', yinYang: 'Yin', elementCh: '水' },
  };
  const BRANCHES = {
    '子': { idx: 0,  english: 'Zi',  element: 'Water', yinYang: 'Yang', elementCh: '水', hidden: ['癸'] },
    '丑': { idx: 1,  english: 'Chou', element: 'Earth', yinYang: 'Yin', elementCh: '土', hidden: ['己','癸','辛'] },
    '寅': { idx: 2,  english: 'Yin',  element: 'Wood',  yinYang: 'Yang', elementCh: '木', hidden: ['甲','丙','戊'] },
    '卯': { idx: 3,  english: 'Mao',  element: 'Wood',  yinYang: 'Yin', elementCh: '木', hidden: ['乙'] },
    '辰': { idx: 4,  english: 'Chen', element: 'Earth', yinYang: 'Yang', elementCh: '土', hidden: ['戊','乙','癸'] },
    '巳': { idx: 5,  english: 'Si',   element: 'Fire',  yinYang: 'Yin', elementCh: '火', hidden: ['丙','庚','戊'] },
    '午': { idx: 6,  english: 'Wu',   element: 'Fire',  yinYang: 'Yang', elementCh: '火', hidden: ['丁','己'] },
    '未': { idx: 7,  english: 'Wei',  element: 'Earth', yinYang: 'Yin', elementCh: '土', hidden: ['己','丁','乙'] },
    '申': { idx: 8,  english: 'Shen', element: 'Metal', yinYang: 'Yang', elementCh: '金', hidden: ['庚','壬','戊'] },
    '酉': { idx: 9,  english: 'You',  element: 'Metal', yinYang: 'Yin', elementCh: '金', hidden: ['辛'] },
    '戌': { idx: 10, english: 'Xu',   element: 'Earth', yinYang: 'Yang', elementCh: '土', hidden: ['戊','辛','丁'] },
    '亥': { idx: 11, english: 'Hai',  element: 'Water', yinYang: 'Yin', elementCh: '水', hidden: ['壬','甲'] },
  };
  const ELEMENTS = {
    'Wood':  { chinese: '木', color: '#2E7D32', generate: 'Fire', control: 'Earth' },
    'Fire':  { chinese: '火', color: '#CC3333', generate: 'Earth', control: 'Metal' },
    'Earth': { chinese: '土', color: '#8D6E63', generate: 'Metal', control: 'Water' },
    'Metal': { chinese: '金', color: '#F5C542', generate: 'Water', control: 'Wood' },
    'Water': { chinese: '水', color: '#1565C0', generate: 'Wood', control: 'Fire' },
  };
  const ELEMENT_CYCLE = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const ANIMALS = {
    '子': 'Rat', '丑': 'Ox', '寅': 'Tiger', '卯': 'Rabbit',
    '辰': 'Dragon', '巳': 'Snake', '午': 'Horse', '未': 'Goat',
    '申': 'Monkey', '酉': 'Rooster', '戌': 'Dog', '亥': 'Pig',
  };
  const SEASONS = {
    '寅': 'Spring', '卯': 'Spring', '辰': 'Spring',
    '巳': 'Summer', '午': 'Summer', '未': 'Summer',
    '申': 'Autumn', '酉': 'Autumn', '戌': 'Autumn',
    '亥': 'Winter', '子': 'Winter', '丑': 'Winter',
  };
  const VITALITY = {
    Spring:  { Wood: '旺', Fire: '相', Earth: '死', Metal: '囚', Water: '休' },
    Summer:  { Wood: '休', Fire: '旺', Earth: '相', Metal: '死', Water: '囚' },
    Autumn:  { Wood: '死', Fire: '囚', Earth: '休', Metal: '旺', Water: '相' },
    Winter:  { Wood: '相', Fire: '死', Earth: '囚', Metal: '休', Water: '旺' },
  };
  const VITALITY_ENGLISH = { '旺': 'Prosperous', '相': 'Moderate', '休': 'Resting', '囚': 'Imprisoned', '死': 'Declining' };
  const TEN_GODS = {
    same_same:       { chinese: '比肩', english: 'Friend', type: 'self' },
    same_diff:       { chinese: '劫财', english: 'Rob Wealth', type: 'self' },
    generateMe_same: { chinese: '偏印', english: 'Indirect Resource', type: 'resource' },
    generateMe_diff: { chinese: '正印', english: 'Direct Resource', type: 'resource' },
    meGenerate_same: { chinese: '食神', english: 'Eating God', type: 'output' },
    meGenerate_diff: { chinese: '伤官', english: 'Hurting Officer', type: 'output' },
    controlMe_same:  { chinese: '七杀', english: 'Seven Kill', type: 'authority' },
    controlMe_diff:  { chinese: '正官', english: 'Direct Officer', type: 'authority' },
    meControl_same:  { chinese: '偏财', english: 'Indirect Wealth', type: 'wealth' },
    meControl_diff:  { chinese: '正财', english: 'Direct Wealth', type: 'wealth' },
  };

  function getElementRelation(e1, e2) {
    if (e1 === e2) return 'same';
    const idx1 = ELEMENT_CYCLE.indexOf(e1);
    if (ELEMENT_CYCLE[(idx1 + 1) % 5] === e2) return 'generates';
    if (ELEMENT_CYCLE[(idx1 + 4) % 5] === e2) return 'generatedBy';
    const idx2 = ELEMENT_CYCLE.indexOf(e2);
    if (ELEMENT_CYCLE[(idx1 + 2) % 5] === e2 || (idx1 + 3) % 5 === idx2) return 'controls';
    return 'controlledBy';
  }

  function getTenGod(dmStem, otherStem) {
    const dm = STEMS[dmStem];
    const other = STEMS[otherStem];
    if (!dm || !other) return {};
    const rel = getElementRelation(dm.element, other.element);
    const sameYinYang = dm.yinYang === other.yinYang;
    let key;
    switch (rel) {
      case 'same': key = sameYinYang ? 'same_same' : 'same_diff'; break;
      case 'generatedBy': key = sameYinYang ? 'generateMe_same' : 'generateMe_diff'; break;
      case 'generates': key = sameYinYang ? 'meGenerate_same' : 'meGenerate_diff'; break;
      case 'controls': key = sameYinYang ? 'meControl_same' : 'meControl_diff'; break;
      case 'controlledBy': key = sameYinYang ? 'controlMe_same' : 'controlMe_diff'; break;
    }
    return { ...TEN_GODS[key], element: other.element, key, rel, sameYinYang };
  }

  function getVitality(branchMonth, element) {
    const season = SEASONS[branchMonth];
    if (!season) return { state: '', stateEn: '' };
    const state = VITALITY[season][element];
    return { state, stateEn: VITALITY_ENGLISH[state] || state };
  }

  function toTrueSolarTime(year, month, day, hour, minute, lng, tzOffset) {
    const lngHour = lng / 15;
    const localMeanTime = hour + minute / 60;
    const equationOfTime = getEquationOfTime(year, month, day);
    const trueSolarTime = localMeanTime + equationOfTime / 60;
    const trueHour = Math.floor(trueSolarTime);
    const trueMinute = Math.floor((trueSolarTime - trueHour) * 60);
    return {
      hour: Math.max(0, Math.min(23, trueHour)),
      minute: Math.max(0, Math.min(59, trueMinute)),
      diffMinutes: Math.round(equationOfTime + (lngHour - tzOffset) * 60),
    };
  }

  function getEquationOfTime(year, month, day) {
    const d = new Date(year, month - 1, day);
    const start = new Date(d.getFullYear(), 0, 0);
    const n = Math.floor((d - start) / 86400000);
    const g = 2 * Math.PI / 365 * (n - 1);
    return 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.04089 * Math.sin(2 * g));
  }

  function buildPillar(stem, branch, dmStem, zhiTenGod, naYinStr, wuXingStr) {
    const stemInfo = STEMS[stem];
    const branchInfo = BRANCHES[branch];
    const tenGods = [];
    if (dmStem && stem) {
      const tg = getTenGod(dmStem, stem);
      tenGods.push(tg);
    }
    const hiddenGods = (branchInfo ? branchInfo.hidden : []).map(hs => {
      if (dmStem && hs) {
        const tg = getTenGod(dmStem, hs);
        return { stem: hs, ...tg };
      }
      return { stem: hs, english: STEMS[hs]?.english || hs, element: STEMS[hs]?.element || '' };
    });
    return {
      stem, branch,
      stemElement: stemInfo ? stemInfo.element : '',
      branchElement: branchInfo ? branchInfo.element : '',
      stemYinYang: stemInfo ? stemInfo.yinYang : '',
      branchYinYang: branchInfo ? branchInfo.yinYang : '',
      tenGod: tenGods[0] || null,
      hiddenStems: hiddenGods,
      tenGodZhi: zhiTenGod,
      naYin: naYinStr,
      wuXing: wuXingStr,
    };
  }

  function calculateBazi({ year, month, day, hour, minute, gender, lng, lat, tzOffset }) {
    const tz = tzOffset !== undefined ? tzOffset : 8;
    const longitude = lng !== undefined ? lng : 120;

    let adjustedTime;
    if (longitude !== undefined && longitude !== null) {
      adjustedTime = toTrueSolarTime(year, month, day, hour, minute, longitude, tz);
    } else {
      adjustedTime = { hour, minute, diffMinutes: 0 };
    }

    const solar = Solar.fromYmdHms(year, month, day, adjustedTime.hour, adjustedTime.minute, 0);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    const yearGZ = eightChar.getYear();
    const monthGZ = eightChar.getMonth();
    const dayGZ = eightChar.getDay();
    const hourGZ = eightChar.getTime();
    const dayStem = dayGZ[0];
    const dayBranch = dayGZ[1];

    const stemShiShen = lunar.getBaZiShiShenGan();
    const zhiShiShen = lunar.getBaZiShiShenZhi();
    const wuXing = lunar.getBaZiWuXing();
    const naYin = lunar.getBaZiNaYin();
    const dayMasterInfo = STEMS[dayStem] || {};

    const pillars = {
      year: buildPillar(yearGZ[0], yearGZ[1], dayStem, zhiShiShen ? zhiShiShen[0] : '', naYin ? naYin[0] : '', wuXing ? wuXing[0] : ''),
      month: buildPillar(monthGZ[0], monthGZ[1], dayStem, zhiShiShen ? zhiShiShen[1] : '', naYin ? naYin[1] : '', wuXing ? wuXing[1] : ''),
      day: buildPillar(dayStem, dayBranch, dayStem, zhiShiShen ? zhiShiShen[2] : '', naYin ? naYin[2] : '', wuXing ? wuXing[2] : ''),
      hour: buildPillar(hourGZ[0], hourGZ[1], dayStem, zhiShiShen ? zhiShiShen[3] : '', naYin ? naYin[3] : '', wuXing ? wuXing[3] : ''),
    };

    return {
      solar: { year, month, day, hour, minute, week: solar.getWeek() },
      lunar: {
        year: lunar.getYear(), month: lunar.getMonth(), day: lunar.getDay(),
        yearInChinese: lunar.getYearInChinese(), monthInChinese: lunar.getMonthInChinese(), dayInChinese: lunar.getDayInChinese(),
      },
      adjustedTime, pillars,
      dayMaster: { stem: dayStem, english: dayMasterInfo.english || dayStem, element: dayMasterInfo.element || '', yinYang: dayMasterInfo.yinYang || '' },
      yearAnimal: ANIMALS[yearGZ[1]] || '',
      ganZhi: { year: yearGZ, month: monthGZ, day: dayGZ, hour: hourGZ },
      stemShiShen, gender,
    };
  }

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
    const tenGodList = allStems.map(s => ({ pillar: s.pillar, stem: s.stem, ...getTenGod(dmStem, s.stem) }));

    const elementCount = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
    const addElement = (el, weight) => { if (el && elementCount[el] !== undefined) elementCount[el] += weight; };
    addElement(dmElement, 3);
    for (const p of ['year','month','day','hour']) {
      const pillar = pillars[p];
      addElement(pillar.stemElement, 2);
      addElement(pillar.branchElement, 1);
      pillar.hiddenStems.forEach(hs => addElement(hs.element, 0.5));
    }
    for (const el of Object.keys(elementCount)) elementCount[el] = Math.round(elementCount[el] * 10) / 10;

    const dominantElement = Object.entries(elementCount).sort((a,b)=>b[1]-a[1])[0][0];
    const strongest = Object.entries(elementCount).filter(([k,v]) => v === Math.max(...Object.values(elementCount))).map(([k])=>k);

    const interpretations = generateInterpretations(dmElement, tenGodList, vitality, elementCount, gender, dayMaster, season);

    return {
      tenGods: tenGodList,
      fiveElements: {
        wood: { score: elementCount.Wood, label: 'Wood' },
        fire: { score: elementCount.Fire, label: 'Fire' },
        earth: { score: elementCount.Earth, label: 'Earth' },
        metal: { score: elementCount.Metal, label: 'Metal' },
        water: { score: elementCount.Water, label: 'Water' },
      },
      dominantElement, strongest,
      vitality: { season, state: vitality.state, stateEn: vitality.stateEn },
      interpretations,
    };
  }

  function generateInterpretations(dmElement, tenGodList, vitality, elementCount, gender, dayMaster, season) {
    const dmStem = dayMaster.stem;
    const stemInfo = STEMS[dmStem];
    const dmEnglish = stemInfo ? stemInfo.english : dmStem;
    const dmYinYang = stemInfo ? stemInfo.yinYang : '';

    const personality = [{ aspect: 'dayMaster', text: `Your Day Master is ${dmEnglish} (${dmYinYang} ${stemInfo.element}). This represents your core self and life force.`, level: 'primary' }];
    const career = [];
    const wealth = [];
    const relationships = [];

    if (vitality.season) {
      if (vitality.state === '旺') personality.push({ aspect: 'vitality', text: `Born in ${vitality.season}, ${stemInfo.element} is ${vitality.stateEn} — you are at your peak season of vitality.`, level: 'strong' });
      else if (vitality.state === '相') personality.push({ aspect: 'vitality', text: `Born in ${vitality.season}, ${stemInfo.element} is ${vitality.stateEn} — you have moderate energy for growth.`, level: 'medium' });
      else if (vitality.state === '休') personality.push({ aspect: 'vitality', text: `Born in ${vitality.season}, ${stemInfo.element} is ${vitality.stateEn} — a time for rest and reflection.`, level: 'low' });
      else if (vitality.state === '囚') personality.push({ aspect: 'vitality', text: `Born in ${vitality.season}, ${stemInfo.element} is ${vitality.stateEn} — you may face external constraints.`, level: 'low' });
      else if (vitality.state === '死') personality.push({ aspect: 'vitality', text: `Born in ${vitality.season}, ${stemInfo.element} is ${vitality.stateEn} — energy is low, conserve and nurture yourself.`, level: 'weak' });
    }

    const officerGods = tenGodList.filter(tg => tg.type === 'authority');
    if (officerGods.length > 0) {
      officerGods.forEach(og => {
        if (og.english === 'Direct Officer') career.push({ aspect: 'officer', text: `${og.english} (${og.chinese}) present: You have a strong sense of responsibility and discipline. Suited for structured roles and leadership.`, level: 'strong' });
        else career.push({ aspect: 'officer', text: `${og.english} (${og.chinese}) present: You thrive in competitive environments. Ambitious and willing to take risks.`, level: 'strong' });
      });
    } else {
      career.push({ aspect: 'officer', text: `No Authority stars in the chart. You prefer freedom and may resist rigid hierarchies.`, level: 'neutral' });
    }

    const wealthGods = tenGodList.filter(tg => tg.type === 'wealth');
    if (wealthGods.length > 0) {
      wealthGods.forEach(wg => {
        if (wg.english === 'Direct Wealth') wealth.push({ aspect: 'wealth', text: `${wg.english} (${wg.chinese}) present: Stable and consistent financial approach. Good at saving and managing resources.`, level: 'strong' });
        else wealth.push({ aspect: 'wealth', text: `${wg.english} (${wg.chinese}) present: Entrepreneurial spirit. You may have multiple income streams.`, level: 'strong' });
      });
    } else {
      wealth.push({ aspect: 'wealth', text: `No Wealth stars in the main stems. You may need to work harder on financial accumulation.`, level: 'neutral' });
    }

    const resourceGods = tenGodList.filter(tg => tg.type === 'resource');
    if (resourceGods.length > 0) {
      resourceGods.forEach(rg => {
        if (rg.english === 'Direct Resource') personality.push({ aspect: 'resource', text: `${rg.english} (${rg.chinese}) present: You are nurturing and supportive. Strong learning ability and family orientation.`, level: 'strong' });
        else personality.push({ aspect: 'resource', text: `${rg.english} (${rg.chinese}) present: You have unique talents and unconventional wisdom. Deep thinking and creativity.`, level: 'strong' });
      });
    }

    const outputGods = tenGodList.filter(tg => tg.type === 'output');
    outputGods.forEach(og => {
      if (og.english === 'Eating God') personality.push({ aspect: 'output', text: `${og.english} (${og.chinese}) present: You are articulate, creative, and enjoy life's pleasures.`, level: 'strong' });
      else personality.push({ aspect: 'output', text: `${og.english} (${og.chinese}) present: You are talented and expressive but may sometimes speak too directly.`, level: 'strong' });
    });

    const friendGods = tenGodList.filter(tg => tg.type === 'self');
    if (friendGods.length > 0) {
      if (friendGods.some(fg => fg.english === 'Friend')) relationships.push({ aspect: 'friends', text: `Friend present: Strong peer network. You are independent and self-reliant.`, level: 'strong' });
      if (friendGods.some(fg => fg.english === 'Rob Wealth')) relationships.push({ aspect: 'friends', text: `Rob Wealth present: Competitive in social settings. You may face rivalry in close circles.`, level: 'medium' });
    } else {
      relationships.push({ aspect: 'friends', text: `Few peer stars visible. You may prefer solitude or smaller social circles.`, level: 'neutral' });
    }

    const fiveElementSummary = (() => {
      const total = Object.values(elementCount).reduce((a, b) => a + b, 0);
      const percentages = {};
      for (const [el, score] of Object.entries(elementCount)) percentages[el] = total > 0 ? Math.round((score / total) * 100) : 0;
      const sorted = Object.entries(elementCount).sort((a, b) => b[1] - a[1]);
      const strongest = sorted[0][0];
      const weakest = sorted[sorted.length - 1][0];
      const balanced = sorted[0][1] - sorted[sorted.length - 1][1] < 2;
      const balanceText = balanced ? 'Your five elements are well-balanced, indicating harmony across different life aspects.' : `${strongest} is your dominant element, while ${weakest} is the weakest in your chart. Consider activities and environments that strengthen ${weakest} energy.`;
      return { percentages, strongest, weakest, balanceText, balanced };
    })();

    const warnings = [];

    const totalScore = Object.values(elementCount).reduce((a, b) => a + b, 0);
    for (const [el, score] of Object.entries(elementCount)) {
      const pct = totalScore > 0 ? (score / totalScore) * 100 : 0;
      const elCh = ELEMENTS[el]?.chinese || el;
      if (pct > 35) {
        const overWarnings = {
          'Wood': `${el} (${elCh}) is excessively strong. You may be stubborn, overbearing, and prone to frustration when things don't go your way. Guard against impulsive decisions.`,
          'Fire': `${el} (${elCh}) is excessively strong. You may burn out easily, be short-tempered, and over-commit. Watch your energy levels and avoid reckless risks.`,
          'Earth': `${el} (${elCh}) is excessively strong. You may be overly rigid, resistant to change, and stuck in routines. Stay flexible and open to new ideas.`,
          'Metal': `${el} (${elCh}) is excessively strong. You may come across as cold, harsh, or overly critical. Guard against isolation and rigidity in relationships.`,
          'Water': `${el} (${elCh}) is excessively strong. You may be overly emotional, indecisive, or secretive. Practice clarity and direct communication.`,
        };
        warnings.push({ aspect: 'element', text: overWarnings[el] || `${el} is excessive.`, level: 'caution' });
      }
      if (pct < 8 && pct > 0) {
        const underWarnings = {
          'Wood': `${el} (${elCh}) is very weak. You may lack direction and growth energy. Consider spending time in nature and practicing assertiveness.`,
          'Fire': `${el} (${elCh}) is very weak. You may lack passion and visibility. Warmth, sunlight, and bold colors can help energize you.`,
          'Earth': `${el} (${elCh}) is very weak. You may feel ungrounded or unstable. Routine, stability, and earth-connected practices will help.`,
          'Metal': `${el} (${elCh}) is very weak. You may lack structure and discipline. Setting clear boundaries and routines is recommended.`,
          'Water': `${el} (${elCh}) is very weak. You may struggle with intuition and flow. Time near water and reflective practices can help.`,
        };
        warnings.push({ aspect: 'element', text: underWarnings[el] || `${el} is deficient.`, level: 'caution' });
      }
    }

    tenGodList.forEach(tg => {
      switch (tg.english) {
        case 'Seven Kill':
          warnings.push({ aspect: 'tenGod', text: `Seven Kill (${tg.chinese}) in your chart: Beware of workplace pressure, power struggles, and health issues related to stress. Conflicts may arise unexpectedly.`, level: 'danger', pillar: tg.pillar });
          break;
        case 'Rob Wealth':
          warnings.push({ aspect: 'tenGod', text: `Rob Wealth (${tg.chinese}) in your chart: Guard against financial losses through partnerships or friends. Avoid co-signing loans or joint investments.`, level: 'caution', pillar: tg.pillar });
          break;
        case 'Hurting Officer':
          warnings.push({ aspect: 'tenGod', text: `Hurting Officer (${tg.chinese}) in your chart: Watch your words with superiors and authorities. Legal disputes and workplace conflicts are possible. Practice diplomacy.`, level: 'caution', pillar: tg.pillar });
          break;
        case 'Indirect Resource':
          warnings.push({ aspect: 'tenGod', text: `Indirect Resource (${tg.chinese}) in your chart: You may feel isolated or misunderstood. Avoid overly unconventional paths without practical backup.`, level: 'neutral', pillar: tg.pillar });
          break;
        case 'Direct Wealth':
          if (tenGodList.filter(t => t.type === 'wealth').length > 2) {
            warnings.push({ aspect: 'tenGod', text: `Multiple Wealth stars present: While financially promising, this can also indicate over-attachment to material gains. Balance is key.`, level: 'neutral' });
          }
          break;
        case 'Indirect Wealth':
          if (tenGodList.filter(t => t.type === 'wealth').length > 2) {
            warnings.push({ aspect: 'tenGod', text: `Multiple Wealth stars present: Risk of financial instability, gambling tendencies, or get-rich-quick schemes. Stay grounded.`, level: 'caution' });
          }
          break;
      }
    });

    if (tenGodList.filter(tg => tg.type === 'self').length >= 3) {
      warnings.push({ aspect: 'tenGod', text: `Multiple Peer stars (比劫) present: Strong competition in social and professional circles. Be wary of betrayals and financial competition among peers.`, level: 'caution' });
    }
    if (tenGodList.filter(tg => tg.type === 'authority').length >= 3) {
      warnings.push({ aspect: 'tenGod', text: `Multiple Authority stars (官杀) present: Heavy pressure from work and responsibilities. Risk of overwork and burnout. Delegate when possible.`, level: 'danger' });
    }
    if (tenGodList.filter(tg => tg.type === 'output').length >= 3) {
      warnings.push({ aspect: 'tenGod', text: `Multiple Output stars (食伤) present: Over-expressive and prone to saying too much. Guard against verbal conflicts and reputation damage.`, level: 'caution' });
    }

    if (vitality.state === '死') {
      warnings.push({ aspect: 'vitality', text: `Your Day Master element is in "${vitality.stateEn}" state — this is your weakest season. Avoid major decisions, new ventures, or health neglect during this period.`, level: 'danger' });
    }
    if (vitality.state === '囚') {
      warnings.push({ aspect: 'vitality', text: `Your Day Master element is in "${vitality.stateEn}" state — external forces may constrain you. Avoid confrontations with authority figures.`, level: 'caution' });
    }

    const getElementMetaphor = (el) => ({
      'Wood': 'growth, flexibility, creativity, and expansion like a tree reaching for the sky',
      'Fire': 'passion, brilliance, warmth, and transformation like a radiant flame',
      'Earth': 'stability, nourishment, reliability, and support like fertile soil',
      'Metal': 'strength, precision, structure, and determination like forged steel',
      'Water': 'wisdom, adaptability, depth, and flow like a river finding its way',
    }[el] || 'balance and harmony');

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
        health: { title: 'Health & Vitality', items: [] },
      },
      fiveElementSummary,
      warnings,
    };
  }

  function calculateDayun(gender, pillars) {
    const monthStem = pillars.month.stem;
    const monthBranch = pillars.month.branch;
    const monthStemInfo = STEMS[monthStem];
    const monthBranchInfo = BRANCHES[monthBranch];
    const yearStem = pillars.year.stem;
    const yearStemInfo = STEMS[yearStem];
    const dmStem = pillars.day.stem;
    const isYangYear = yearStemInfo && yearStemInfo.yinYang === 'Yang';
    const isMale = gender === 'male';
    const forward = (isMale && isYangYear) || (!isMale && !isYangYear);
    const stemIdx = monthStemInfo ? monthStemInfo.idx : 0;
    const branchIdx = monthBranchInfo ? monthBranchInfo.idx : 0;

    const dayunList = [];
    for (let i = 0; i < 8; i++) {
      const offset = forward ? (i + 1) : -(i + 1);
      const sIdx = ((stemIdx + offset) % 10 + 10) % 10;
      const bIdx = ((branchIdx + offset) % 12 + 12) % 12;
      const s = Object.keys(STEMS).find(k => STEMS[k].idx === sIdx);
      const b = Object.keys(BRANCHES).find(k => BRANCHES[k].idx === bIdx);
      if (s && b) {
        const tg = getTenGod(dmStem, s);
        dayunList.push({ stem: s, branch: b, stemEnglish: STEMS[s].english, branchEnglish: BRANCHES[b].english, stemElement: STEMS[s].element, branchElement: BRANCHES[b].element, tenGod: tg, ganZhi: s + b });
      }
    }
    return { direction: forward ? 'forward' : 'reverse', pillars: dayunList };
  }

  function calculateStartAge(gender, pillars, birthSolar) {
    const yearStem = pillars.year.stem;
    const yearStemInfo = STEMS[yearStem];
    const isYangYear = yearStemInfo && yearStemInfo.yinYang === 'Yang';
    const isMale = gender === 'male';
    const forward = (isMale && isYangYear) || (!isMale && !isYangYear);

    try {
      const solarObj = Solar.fromYmdHms(birthSolar.year, birthSolar.month, birthSolar.day, 12, 0, 0);
      const lunarObj = solarObj.getLunar();
      const nextTerm = lunarObj.getNextJie();
      const prevTerm = lunarObj.getPrevJie();
      let targetTerm, daysDiff;

      if (forward) {
        targetTerm = nextTerm;
        if (targetTerm) {
          const targetSolar = targetTerm.getSolar();
          const birthDate = new Date(birthSolar.year, birthSolar.month - 1, birthSolar.day);
          const termDate = new Date(targetSolar.getYear(), targetSolar.getMonth() - 1, targetSolar.getDay());
          daysDiff = Math.max(0, (termDate - birthDate) / 86400000);
        } else daysDiff = 30;
      } else {
        targetTerm = prevTerm;
        if (targetTerm) {
          const targetSolar = targetTerm.getSolar();
          const birthDate = new Date(birthSolar.year, birthSolar.month - 1, birthSolar.day);
          const termDate = new Date(targetSolar.getYear(), targetSolar.getMonth() - 1, targetSolar.getDay());
          daysDiff = Math.max(0, (birthDate - termDate) / 86400000);
        } else daysDiff = 30;
      }
      const startAge = Math.ceil(daysDiff / 3);
      return { startAge: Math.max(0, startAge), daysDiff: Math.round(daysDiff) };
    } catch (e) {
      return { startAge: 0, daysDiff: 0 };
    }
  }

  function calculateLiunian(year, pillars) {
    const dmStem = pillars.day.stem;
    const stemIdx = year % 10;
    const branchIdx = year % 12;
    const stem = Object.keys(STEMS).find(k => STEMS[k].idx === stemIdx);
    const branch = Object.keys(BRANCHES).find(k => BRANCHES[k].idx === branchIdx);
    if (!stem || !branch) return null;
    const tg = getTenGod(dmStem, stem);
    const vitalityInfo = getVitality(branch, STEMS[stem]?.element);
    return {
      year, stem, branch, ganZhi: stem + branch,
      stemEnglish: STEMS[stem]?.english || stem, branchEnglish: BRANCHES[branch]?.english || branch,
      stemElement: STEMS[stem]?.element || '', branchElement: BRANCHES[branch]?.element || '',
      animal: BRANCHES[branch]?.english || branch, tenGod: tg, vitality: vitalityInfo,
    };
  }

  function calculateFortune(gender, pillars, birthYear) {
    const startAgeInfo = calculateStartAge(gender, pillars, { year: birthYear, month: 1, day: 1 });
    const startAge = startAgeInfo.startAge;
    const dayunData = calculateDayun(gender, pillars, birthYear);
    const dayunWithAges = dayunData.pillars.map((p, i) => ({ ...p, ageStart: startAge + i * 10, ageEnd: startAge + (i + 1) * 10 - 1 }));
    const now = new Date();
    const currentYear = now.getFullYear();
    const liunian = calculateLiunian(currentYear, pillars);
    const currentDayunIndex = dayunWithAges.findIndex(d => currentYear >= birthYear + d.ageStart && currentYear < birthYear + d.ageStart + 10);
    return {
      startAge, direction: dayunData.direction,
      dayun: dayunWithAges,
      currentDayun: currentDayunIndex >= 0 ? dayunWithAges[currentDayunIndex] : null,
      currentLiunian: liunian,
    };
  }

  function calcAlmanac() {
    const now = new Date();
    const solar = Solar.fromYmdHms(now.getFullYear(), now.getMonth() + 1, now.getDate(), 12, 0, 0);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    const yi = typeof lunar.getDayYi === 'function' ? (lunar.getDayYi() || []) : [];
    const ji = typeof lunar.getDayJi === 'function' ? (lunar.getDayJi() || []) : [];
    const chong = typeof lunar.getDayChong === 'function' ? (lunar.getDayChong() || '') : '';
    const sha = typeof lunar.getDaySha === 'function' ? (lunar.getDaySha() || '') : '';
    const cai = typeof lunar.getDayPositionCai === 'function' ? (lunar.getDayPositionCai() || '') : '';
    const xi = typeof lunar.getDayPositionXi === 'function' ? (lunar.getDayPositionXi() || '') : '';
    const fu = typeof lunar.getDayPositionFu === 'function' ? (lunar.getDayPositionFu() || '') : '';
    const ganZhi = eightChar.getDay();

    return {
      date: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`,
      lunarMonth: lunar.getMonthInChinese(),
      lunarDay: lunar.getDayInChinese(),
      ganZhi,
      yi: yi.slice(0, 8),
      ji: ji.slice(0, 8),
      chong, sha,
      caiPosition: cai, xiPosition: xi, fuPosition: fu,
    };
  }

  function calculate({ year, month, day, hour, minute, gender, tzOffset, lng, lat }) {
    const baziData = calculateBazi({ year, month, day, hour, minute, gender, lng, lat, tzOffset });
    const analysis = analyzePillars(baziData.pillars, baziData.dayMaster, gender);
    const fortune = calculateFortune(gender, baziData.pillars, year);
    const almanac = calcAlmanac();
    const liunianWarnings = calcLiunianWarnings(fortune.currentLiunian, baziData);
    const allWarnings = [...(analysis.interpretations.warnings || []), ...liunianWarnings];
    const quickTake = calcQuickTake(analysis, fortune, baziData, allWarnings);
    return { ...baziData, analysis, fortune, almanac, warnings: allWarnings, quickTake };
  }

  function calcQuickTake(analysis, fortune, baziData, warnings) {
    const liunian = fortune.currentLiunian;
    const vitality = analysis.vitality;
    const dm = baziData.dayMaster;
    const dangerCount = warnings.filter(w => w.level === 'danger').length;
    const cautionCount = warnings.filter(w => w.level === 'caution').length;

    let score = 50;
    const cd = fortune.currentDayun;
    if (cd) {
      if (cd.tenGod?.type === 'wealth') score += 15;
      else if (cd.tenGod?.type === 'authority') score += 12;
      else if (cd.tenGod?.type === 'resource') score += 10;
      else if (cd.tenGod?.type === 'output') score += 6;
      else if (cd.tenGod?.type === 'self') score += 4;
    }
    if (liunian) {
      if (liunian.tenGod?.type === 'wealth') score += 12;
      else if (liunian.tenGod?.type === 'authority') score += 6;
      else if (liunian.tenGod?.type === 'resource') score += 6;
      else if (liunian.tenGod?.type === 'self') score += 3;
      if (liunian.tenGod?.english === 'Seven Kill') score -= 15;
    }
    if (vitality?.state === '旺') score += 15;
    else if (vitality?.state === '相') score += 10;
    else if (vitality?.state === '休') score -= 5;
    else if (vitality?.state === '囚') score -= 12;
    else if (vitality?.state === '死') score -= 18;

    score -= dangerCount * 18;
    score -= cautionCount * 8;
    score = Math.max(0, Math.min(100, score));

    let level, summary, keyPoints;

    if (score >= 75) {
      level = 'excellent';
      summary = `Your fortune this year is bright and favorable. ${dm.english} ${dm.element} energy flows smoothly — opportunities are abundant. A great time to pursue your goals and expand your horizons.`;
      keyPoints = ['Energy is at a peak — take initiative', 'Opportunities in career and finance', 'A good year for relationships'];
    } else if (score >= 60) {
      level = 'good';
      summary = `A favorable year ahead. Your ${dm.english} ${dm.element} foundation is solid, though some effort is needed to maintain momentum. Progress is steady.`;
      keyPoints = ['Good time for steady progress', 'Moderate career opportunities', 'Maintain health routines'];
    } else if (score >= 45) {
      level = 'neutral';
      summary = `A mixed year — there are both opportunities and challenges. ${dm.english} ${dm.element} energy is moderate. Careful planning and patience will serve you well.`;
      keyPoints = ['Balance risks carefully', 'Avoid impulsive decisions', 'Focus on self-improvement'];
    } else if (score >= 30) {
      level = 'cautious';
      summary = `This year requires extra caution. ${dm.english} ${dm.element} energy is constrained. Guard against conflicts, avoid major investments, and take care of your health.`;
      keyPoints = ['Avoid major life changes', 'Watch finances closely', 'Prioritize health and rest'];
    } else {
      level = 'difficult';
      summary = `A challenging year. ${dm.english} ${dm.element} energy is at its lowest. Focus on preservation rather than expansion. Seek support from trusted friends and family.`;
      keyPoints = ['Conserve energy — avoid overexertion', 'Delay major decisions', 'Strengthen your support network'];
    }

    const highlights = [];
    if (fortune.currentDayun) {
      const d = fortune.currentDayun;
      highlights.push(`Current 10-year cycle: ${d.ganZhi} (${d.tenGod?.english || ''})`);
    }
    if (liunian && liunian.tenGod) {
      highlights.push(`This year (${liunian.ganZhi}): ${liunian.tenGod.english} influence`);
    }

    return { score, level, summary, keyPoints, highlights, dangers: dangerCount, cautions: cautionCount };
  }

  function calcLiunianWarnings(liunian, baziData) {
    const warnings = [];
    if (!liunian) return warnings;
    const ly = liunian;
    const dm = baziData.dayMaster;
    const yearBranch = baziData.pillars.year.branch;

    if (ly.branch === yearBranch) {
      warnings.push({ aspect: 'liunian', text: `This year (${ly.year}, ${ly.ganZhi}) is your Ben Ming Nian (本命年) — the zodiac year that clashes with your birth year. Traditionally considered a challenging year. Pay extra attention to health and avoid major risks.`, level: 'danger' });
    }

    const clashMap = { '子':'午','丑':'未','寅':'申','卯':'酉','辰':'戌','巳':'亥','午':'子','未':'丑','申':'寅','酉':'卯','戌':'辰','亥':'巳' };
    if (clashMap[ly.branch] === yearBranch) {
      warnings.push({ aspect: 'liunian', text: `This year (${ly.year}, ${ly.ganZhi}) clashes with your birth year pillar. It may bring unexpected changes in career or family. Proceed with caution.`, level: 'caution' });
    }

    if (ly.branch === baziData.pillars.day.branch) {
      warnings.push({ aspect: 'liunian', text: `This year's earthly branch (${ly.branch}) matches your day branch — personal and relationship matters are highlighted. Be mindful of emotional decisions.`, level: 'neutral' });
    }
    return warnings;
  }

  return { calculate };
})();