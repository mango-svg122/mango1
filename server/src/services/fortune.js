const { STEMS, BRANCHES, ELEMENTS, getTenGod, getVitality, SEASONS, VITALITY_ENGLISH } = require('../constants');

function calculateDayun(gender, pillars, year) {
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
      dayunList.push({
        stem: s,
        branch: b,
        stemEnglish: STEMS[s].english,
        branchEnglish: BRANCHES[b].english,
        stemElement: STEMS[s].element,
        branchElement: BRANCHES[b].element,
        tenGod: tg,
        ganZhi: s + b,
      });
    }
  }

  return {
    direction: forward ? 'forward' : 'reverse',
    pillars: dayunList,
  };
}

function calculateStartAge(gender, pillars, birthSolar) {
  const yearStem = pillars.year.stem;
  const yearStemInfo = STEMS[yearStem];

  const isYangYear = yearStemInfo && yearStemInfo.yinYang === 'Yang';
  const isMale = gender === 'male';
  const forward = (isMale && isYangYear) || (!isMale && !isYangYear);

  const { Solar, Lunar } = require('lunar-javascript');
  const solar = require('lunar-javascript');

  try {
    const solarObj = solar.Solar.fromYmdHms(birthSolar.year, birthSolar.month, birthSolar.day, 12, 0, 0);
    const lunarObj = solarObj.getLunar();

    const month = lunarObj.getMonth();
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
      } else {
        daysDiff = 30;
      }
    } else {
      targetTerm = prevTerm;
      if (targetTerm) {
        const targetSolar = targetTerm.getSolar();
        const birthDate = new Date(birthSolar.year, birthSolar.month - 1, birthSolar.day);
        const termDate = new Date(targetSolar.getYear(), targetSolar.getMonth() - 1, targetSolar.getDay());
        daysDiff = Math.max(0, (birthDate - termDate) / 86400000);
      } else {
        daysDiff = 30;
      }
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
    year,
    stem, branch,
    ganZhi: stem + branch,
    stemEnglish: STEMS[stem]?.english || stem,
    branchEnglish: BRANCHES[branch]?.english || branch,
    stemElement: STEMS[stem]?.element || '',
    branchElement: BRANCHES[branch]?.element || '',
    animal: BRANCHES[branch]?.english || branch,
    tenGod: tg,
    vitality: vitalityInfo,
  };
}

function calculateFortune(gender, pillars, birthYear) {
  const startAgeInfo = calculateStartAge(gender, pillars, { year: birthYear, month: 1, day: 1 });
  const startAge = startAgeInfo.startAge;
  const dayunData = calculateDayun(gender, pillars, birthYear);

  const dayunWithAges = dayunData.pillars.map((p, i) => ({
    ...p,
    ageStart: startAge + i * 10,
    ageEnd: startAge + (i + 1) * 10 - 1,
  }));

  const now = new Date();
  const currentYear = now.getFullYear();
  const liunian = calculateLiunian(currentYear, pillars);

  const currentDayunIndex = dayunWithAges.findIndex(d => currentYear >= birthYear + d.ageStart && currentYear < birthYear + d.ageStart + 10);
  const currentDayun = currentDayunIndex >= 0 ? dayunWithAges[currentDayunIndex] : null;

  return {
    startAge,
    direction: dayunData.direction,
    dayun: dayunWithAges,
    currentDayun,
    currentLiunian: liunian,
  };
}

module.exports = { calculateDayun, calculateStartAge, calculateLiunian, calculateFortune };