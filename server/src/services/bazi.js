const { Solar } = require('lunar-javascript');
const { toTrueSolarTime } = require('./calendar');
const { STEMS, BRANCHES, ANIMALS, getTenGod } = require('../constants');

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
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      yearInChinese: lunar.getYearInChinese(),
      monthInChinese: lunar.getMonthInChinese(),
      dayInChinese: lunar.getDayInChinese(),
    },
    adjustedTime,
    pillars,
    dayMaster: {
      stem: dayStem,
      english: dayMasterInfo.english || dayStem,
      element: dayMasterInfo.element || '',
      yinYang: dayMasterInfo.yinYang || '',
    },
    yearAnimal: ANIMALS[yearGZ[1]] || '',
    ganZhi: { year: yearGZ, month: monthGZ, day: dayGZ, hour: hourGZ },
    stemShiShen,
    gender,
  };
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

module.exports = { calculateBazi };