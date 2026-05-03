function toTrueSolarTime(year, month, day, hour, minute, lng, tzOffset) {
  const lngHour = lng / 15;
  const localMeanTime = hour + minute / 60;
  const solarNoonDiff = localMeanTime - (12 - (tzOffset - lngHour));
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
  const n = dayOfYear(d);
  const g = 2 * Math.PI / 365 * (n - 1);
  const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.04089 * Math.sin(2 * g));
  return eot;
}

function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

function getTimePeriodName(hour) {
  const periods = [
    { start: 23, end: 1, name: 'Zi', chinese: '子', animal: 'Rat' },
    { start: 1, end: 3, name: 'Chou', chinese: '丑', animal: 'Ox' },
    { start: 3, end: 5, name: 'Yin', chinese: '寅', animal: 'Tiger' },
    { start: 5, end: 7, name: 'Mao', chinese: '卯', animal: 'Rabbit' },
    { start: 7, end: 9, name: 'Chen', chinese: '辰', animal: 'Dragon' },
    { start: 9, end: 11, name: 'Si', chinese: '巳', animal: 'Snake' },
    { start: 11, end: 13, name: 'Wu', chinese: '午', animal: 'Horse' },
    { start: 13, end: 15, name: 'Wei', chinese: '未', animal: 'Goat' },
    { start: 15, end: 17, name: 'Shen', chinese: '申', animal: 'Monkey' },
    { start: 17, end: 19, name: 'You', chinese: '酉', animal: 'Rooster' },
    { start: 19, end: 21, name: 'Xu', chinese: '戌', animal: 'Dog' },
    { start: 21, end: 23, name: 'Hai', chinese: '亥', animal: 'Pig' },
  ];
  for (const p of periods) {
    if (p.start <= 22) {
      if (hour >= p.start && hour < p.end) return p;
    }
  }
  return periods[0];
}

module.exports = { toTrueSolarTime, getEquationOfTime, dayOfYear, getTimePeriodName };