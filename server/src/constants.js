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

const STEM_ENGLISH_NAMES = {
  '甲': 'Jia', '乙': 'Yi', '丙': 'Bing', '丁': 'Ding',
  '戊': 'Wu', '己': 'Ji', '庚': 'Geng', '辛': 'Xin', '壬': 'Ren', '癸': 'Gui',
};

const BRANCH_ENGLISH_NAMES = {
  '子': 'Zi', '丑': 'Chou', '寅': 'Yin', '卯': 'Mao',
  '辰': 'Chen', '巳': 'Si', '午': 'Wu', '未': 'Wei',
  '申': 'Shen', '酉': 'You', '戌': 'Xu', '亥': 'Hai',
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

const VITALITY_ENGLISH = {
  '旺': 'Prosperous',
  '相': 'Moderate',
  '休': 'Resting',
  '囚': 'Imprisoned',
  '死': 'Declining',
};

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

module.exports = {
  STEMS, BRANCHES, ELEMENTS, ANIMALS, SEASONS, VITALITY, VITALITY_ENGLISH,
  TEN_GODS, getTenGod, getVitality, STEM_ENGLISH_NAMES, BRANCH_ENGLISH_NAMES,
  ELEMENT_CYCLE, getElementRelation,
};