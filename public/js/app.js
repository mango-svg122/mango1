const app = (() => {
  let currentData = null;

  function toggleLang() {
    const newLang = i18n.getLang() === 'en' ? 'zh' : 'en';
    i18n.setLang(newLang);
    updateUI();
    document.getElementById('langBtn').textContent = i18n.t('langSwitch');
    if (currentData) renderResults(currentData);
  }

  function updateUI() {
    document.title = i18n.t('appTitle') + ' — ' + i18n.t('appSubtitle');
    document.getElementById('subtitle').textContent = i18n.t('appSubtitle');
    document.getElementById('inputTitle').textContent = i18n.t('inputTitle');

    document.getElementById('lblDate').textContent = i18n.t('birthDate');
    document.getElementById('lblTime').textContent = i18n.t('birthTime');
    document.getElementById('timeHint').textContent = 'If unknown, use 12:00 (noon)';
    document.getElementById('lblGender').textContent = i18n.t('gender');
    document.getElementById('optMale').textContent = i18n.t('male');
    document.getElementById('optFemale').textContent = i18n.t('female');
    document.getElementById('lblTz').textContent = i18n.t('timezone');
    document.getElementById('lblLng').textContent = i18n.t('longitude');
    document.getElementById('lblLat').textContent = i18n.t('latitude');
    document.getElementById('btnCalculate').textContent = i18n.t('calculate');

    document.getElementById('chartTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('resultsTitle')}`;
    document.getElementById('elemTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('fiveElements')}`;
    document.getElementById('analysisTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('analysis')}`;
    document.getElementById('dayunTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('dayun')}`;
    document.getElementById('liunianTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('liunian')}`;
    document.getElementById('glossaryTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('glossary')}`;

    document.getElementById('thAge').textContent = i18n.t('age');
    document.getElementById('thPillar').textContent = i18n.t('pillar');
    document.getElementById('thElement').textContent = i18n.t('element');
    document.getElementById('thTenGod').textContent = i18n.t('tenGod');

    document.getElementById('lblSolarDate').textContent = i18n.t('solarDate');
    document.getElementById('lblLunarDate').textContent = i18n.t('lunarDate');
    document.getElementById('lblAnimal').textContent = i18n.t('animal');
    document.getElementById('lblAdjustedTime').textContent = i18n.t('adjustedTime');
    document.getElementById('lblDayMasterInfo').textContent = i18n.t('dayMaster') + ':';

    if (i18n.getLang() === 'zh') {
      document.querySelector('html').lang = 'zh-CN';
    } else {
      document.querySelector('html').lang = 'en';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errorBox = document.getElementById('errorBox');
    errorBox.classList.remove('active');

    const dateVal = document.getElementById('birthDate').value;
    const timeVal = document.getElementById('birthTime').value;
    if (!dateVal || !timeVal) {
      showError(i18n.t('errorRequired'));
      return;
    }

    const [year, month, day] = dateVal.split('-').map(Number);
    const [hour, minute] = timeVal.split(':').map(Number);
    const gender = document.getElementById('gender').value;
    const tzOffset = parseFloat(document.getElementById('tzOffset').value);
    const lng = document.getElementById('longitude').value ? parseFloat(document.getElementById('longitude').value) : undefined;
    const lat = document.getElementById('latitude').value ? parseFloat(document.getElementById('latitude').value) : undefined;

    showLoading(true);
    try {
      const result = await api.calculate({ year, month, day, hour, minute, gender, tzOffset, lng, lat });
      if (result.success) {
        currentData = result.data;
        renderResults(result.data);
        document.getElementById('resultsSection').classList.add('active');
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
      } else {
        showError(result.error || i18n.t('errorGeneric'));
      }
    } catch (err) {
      showError(err.message || i18n.t('errorGeneric'));
    } finally {
      showLoading(false);
    }
  }

  function showError(msg) {
    const box = document.getElementById('errorBox');
    box.textContent = msg;
    box.classList.add('active');
  }

  function showLoading(show) {
    document.getElementById('loadingOverlay').classList.toggle('active', show);
    document.getElementById('loadingText').textContent = i18n.t('calculating');
  }

  function renderResults(data) {
    renderBaziChart(data);
    renderElements(data);
    renderAnalysis(data);
    renderDayun(data);
    renderLiunian(data);
    renderGlossary();
    updateInfoDisplay(data);
  }

  function updateInfoDisplay(data) {
    const isEn = i18n.getLang() === 'en';

    const d = data.solar;
    document.getElementById('solarDateDisplay').textContent = `${d.year}-${String(d.month).padStart(2,'0')}-${String(d.day).padStart(2,'0')} ${String(d.hour).padStart(2,'0')}:${String(d.minute).padStart(2,'0')} (${getWeekdayName(d.week, isEn)})`;

    if (data.lunar) {
      const ld = data.lunar;
      document.getElementById('lunarDateDisplay').textContent = isEn
        ? `${ld.year} ${ld.monthInChinese} ${ld.dayInChinese}`
        : `${ld.yearInChinese}年${ld.monthInChinese}月${ld.dayInChinese}日`;
    }

    document.getElementById('animalDisplay').textContent = data.yearAnimal;

    if (data.adjustedTime) {
      const at = data.adjustedTime;
      document.getElementById('adjustedTimeDisplay').textContent =
        `${String(at.hour).padStart(2,'0')}:${String(at.minute).padStart(2,'0')}` +
        (at.diffMinutes ? ` (${at.diffMinutes > 0 ? '+' : ''}${at.diffMinutes}min)` : '');
    }

    const dm = data.dayMaster;
    document.getElementById('dayMasterDisplay').textContent = `${dm.stem} (${dm.english} ${dm.element} ${dm.yinYang})`;
    document.getElementById('dayMasterDisplay').className = `el-${dm.element}`;
  }

  function renderBaziChart(data) {
    const chart = document.getElementById('baziChart');
    const isEn = i18n.getLang() === 'en';
    const pillarLabels = [
      i18n.t('yearPillar'),
      i18n.t('monthPillar'),
      i18n.t('dayPillar'),
      i18n.t('hourPillar'),
    ];
    const pillars = [data.pillars.year, data.pillars.month, data.pillars.day, data.pillars.hour];

    chart.innerHTML = '';

    const headerRow = document.createElement('div');
    headerRow.className = 'pillar-header';
    headerRow.style.cssText = 'display:contents';

    const labels = document.createElement('div');
    labels.style.cssText = 'display:contents';
    pillarLabels.forEach(label => {
      const cell = document.createElement('div');
      cell.className = 'pillar-header';
      cell.textContent = label;
      labels.appendChild(cell);
    });
    chart.appendChild(labels);

    const row1 = document.createElement('div');
    row1.style.cssText = 'display:contents';
    pillars.forEach((p, i) => {
      const cell = document.createElement('div');
      cell.className = `pillar-cell stem-cell el-${p.stemElement} ${i === 2 ? 'day-master-highlight' : ''}`;
      cell.textContent = p.stem;
      row1.appendChild(cell);
    });
    chart.appendChild(row1);

    const row1e = document.createElement('div');
    row1e.style.cssText = 'display:contents';
    pillars.forEach(p => {
      const cell = document.createElement('div');
      cell.className = 'pillar-cell element-label';
      cell.textContent = isEn ? p.stemElement : elementToChinese(p.stemElement);
      row1e.appendChild(cell);
    });
    chart.appendChild(row1e);

    const row2 = document.createElement('div');
    row2.style.cssText = 'display:contents';
    pillars.forEach((p, i) => {
      const cell = document.createElement('div');
      cell.className = `pillar-cell branch-cell el-${p.branchElement} ${i === 2 ? 'day-master-highlight' : ''}`;
      cell.textContent = p.branch;
      row2.appendChild(cell);
    });
    chart.appendChild(row2);

    const row2e = document.createElement('div');
    row2e.style.cssText = 'display:contents';
    pillars.forEach(p => {
      const cell = document.createElement('div');
      cell.className = 'pillar-cell element-label';
      cell.textContent = isEn ? p.branchElement : elementToChinese(p.branchElement);
      row2e.appendChild(cell);
    });
    chart.appendChild(row2e);

    const row3 = document.createElement('div');
    row3.style.cssText = 'display:contents';
    pillars.forEach(p => {
      const cell = document.createElement('div');
      cell.className = 'pillar-cell hidden-cell';
      const hiddenText = p.hiddenStems.map(h => {
        const name = isEn ? h.english : h.stem;
        return `${name}(${isEn ? h.element : elementToChinese(h.element)})`;
      }).join(' ');
      cell.innerHTML = `<small style="font-size:0.65rem;color:var(--text-muted)">${isEn ? 'Hidden' : '藏'}</small><br>${hiddenText}`;
      row3.appendChild(cell);
    });
    chart.appendChild(row3);

    const row4 = document.createElement('div');
    row4.style.cssText = 'display:contents';
    pillars.forEach(p => {
      const cell = document.createElement('div');
      cell.className = 'pillar-cell ten-god-cell';
      const tg = isEn ? p.tenGod?.english : p.tenGod?.chinese;
      cell.textContent = tg || '';
      row4.appendChild(cell);
    });
    chart.appendChild(row4);

    const row5 = document.createElement('div');
    row5.style.cssText = 'display:contents';
    pillars.forEach(p => {
      const cell = document.createElement('div');
      cell.className = 'pillar-cell';
      cell.style.cssText += 'font-size:0.7rem;color:var(--text-muted);padding:6px 4px';
      cell.textContent = p.naYin || '';
      row5.appendChild(cell);
    });
    chart.appendChild(row5);
  }

  function renderElements(data) {
    const container = document.getElementById('elementBars');
    const balanceText = document.getElementById('elementBalance');
    const fe = data.analysis.fiveElements;
    const isEn = i18n.getLang() === 'en';
    const summary = data.analysis.interpretations.fiveElementSummary;

    const elements = [
      { key: 'Wood', score: fe.wood.score },
      { key: 'Fire', score: fe.fire.score },
      { key: 'Earth', score: fe.earth.score },
      { key: 'Metal', score: fe.metal.score },
      { key: 'Water', score: fe.water.score },
    ];

    const maxScore = Math.max(...elements.map(e => e.score), 1);
    const total = elements.reduce((s, e) => s + e.score, 0);

    container.innerHTML = '';
    elements.forEach(el => {
      const wrapper = document.createElement('div');
      wrapper.className = 'element-bar-wrapper';

      const pct = total > 0 ? Math.round(el.score / total * 100) : 0;
      const height = Math.max(4, (el.score / maxScore) * 100);

      const bar = document.createElement('div');
      bar.className = `element-bar bg-el-${el.key}`;
      bar.style.height = height + '%';
      bar.innerHTML = `<span class="score-label el-${el.key}">${el.score}</span>`;

      const label = document.createElement('div');
      label.className = `element-bar-label el-${el.key}`;
      label.textContent = isEn ? el.key : elementToChinese(el.key);

      const pctLabel = document.createElement('div');
      pctLabel.className = 'element-percent';
      pctLabel.textContent = pct + '%';

      wrapper.appendChild(bar);
      wrapper.appendChild(label);
      wrapper.appendChild(pctLabel);
      container.appendChild(wrapper);
    });

    if (summary) {
      balanceText.textContent = isEn ? summary.balanceText : `${summary.strongest}最旺，${summary.weakest}最弱。建议增强${summary.weakest}能量。`;
    }
  }

  function renderAnalysis(data) {
    const grid = document.getElementById('analysisGrid');
    const s = data.analysis.interpretations.summaries;
    const isEn = i18n.getLang() === 'en';

    grid.innerHTML = '';

    if (s.dayMaster) {
      const card = createAnalysisCard(
        i18n.t('dayMaster'),
        `<strong>${s.dayMaster.title}</strong><br><br>${s.dayMaster.body}`
      );
      grid.appendChild(card);
    }

    const categories = [
      { key: 'personality', title: i18n.t('personality'), items: s.personality?.items },
      { key: 'career', title: i18n.t('career'), items: s.career?.items },
      { key: 'wealth', title: i18n.t('wealth'), items: s.wealth?.items },
      { key: 'relationships', title: i18n.t('relationships'), items: s.relationships?.items },
    ];

    categories.forEach(cat => {
      if (cat.items && cat.items.length > 0) {
        const card = createAnalysisCard(cat.title, '');
        cat.items.forEach(item => {
          const p = document.createElement('p');
          p.className = `level-${item.level}`;
          p.textContent = item.text;
          card.querySelector('.analysis-card-body').appendChild(p);
        });
        grid.appendChild(card);
      }
    });
  }

  function createAnalysisCard(title, bodyHTML) {
    const card = document.createElement('div');
    card.className = 'analysis-card';
    const h4 = document.createElement('h4');
    h4.textContent = title;
    card.appendChild(h4);
    const body = document.createElement('div');
    body.className = 'analysis-card-body';
    if (bodyHTML) body.innerHTML = bodyHTML;
    card.appendChild(body);
    return card;
  }

  function renderDayun(data) {
    const tbody = document.getElementById('dayunBody');
    const startAgeEl = document.getElementById('startAgeDisplay');
    const fortune = data.fortune;
    const isEn = i18n.getLang() === 'en';

    const sa = fortune.startAge;
    startAgeEl.textContent = isEn
      ? `Fortune starts at age ${sa}`
      : `起运年龄：${sa}岁`;

    tbody.innerHTML = '';
    fortune.dayun.forEach((d, i) => {
      const tr = document.createElement('tr');
      if (fortune.currentDayun && fortune.currentDayun.ageStart === d.ageStart) {
        tr.className = 'current-row';
      }

      const ageStr = isEn
        ? `${d.ageStart} - ${d.ageEnd}`
        : `${d.ageStart} - ${d.ageEnd}岁`;

      const stemEn = d.stemEnglish;
      const branchEn = d.branchEnglish;
      const pillarStr = isEn ? `${d.stem} (${stemEn}) ${d.branch} (${branchEn})` : `${d.stem}${d.branch}`;

      const elStr = isEn ? d.stemElement : elementToChinese(d.stemElement);
      const tg = isEn ? d.tenGod?.english : d.tenGod?.chinese;

      tr.innerHTML = `
        <td>${ageStr}</td>
        <td><strong>${pillarStr}</strong></td>
        <td class="el-${d.stemElement}">${elStr}</td>
        <td>${tg || ''}</td>
        <td style="font-size:0.85rem;color:var(--text-secondary)">${getDayunInfluence(d, isEn)}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('thDesc').textContent = isEn ? 'Influence' : '影响';
  }

  function getDayunInfluence(d, isEn) {
    const tg = d.tenGod;
    if (!tg) return '';
    const type = tg.type;
    if (isEn) {
      switch (type) {
        case 'wealth': return 'Focus on finance and resources';
        case 'authority': return 'Career advancement and recognition';
        case 'resource': return 'Learning, support, and nurturing';
        case 'output': return 'Creative expression and communication';
        case 'self': return 'Personal growth and peer relations';
        default: return 'Transition and adaptation';
      }
    } else {
      switch (type) {
        case 'wealth': return '财运主导，关注财富积累';
        case 'authority': return '事业运旺，名利可期';
        case 'resource': return '学习运强，贵人相助';
        case 'output': return '才华展现，表达顺畅';
        case 'self': return '自我提升，人际关系活跃';
        default: return '过渡调整期';
      }
    }
  }

  function renderLiunian(data) {
    const card = document.getElementById('liunianCard');
    const ly = data.fortune.currentLiunian;
    const isEn = i18n.getLang() === 'en';
    if (!ly) { card.innerHTML = '<p>Unable to calculate</p>'; return; }

    const ganZhi = ly.ganZhi;
    const stemInfo = `${ly.stem} (${ly.stemEnglish} ${ly.stemElement})`;
    const branchInfo = `${ly.branch} (${ly.branchEnglish} - ${ly.animal})`;
    const tg = isEn ? ly.tenGod?.english : ly.tenGod?.chinese;
    const vitality = isEn ? ly.vitality?.stateEn : ly.vitality?.state;

    card.innerHTML = `
      <h4>${ly.year} — ${ganZhi}</h4>
      <div class="gan-zhi el-${ly.stemElement}">${ganZhi}</div>
      <div class="info-grid">
        <span class="label">${isEn ? 'Stem' : '天干'}</span>
        <span class="value">${stemInfo}</span>
        <span class="label">${isEn ? 'Branch' : '地支'}</span>
        <span class="value">${branchInfo}</span>
        <span class="label">${i18n.t('tenGod')}</span>
        <span class="value">${tg || ''}</span>
        <span class="label">${i18n.t('vitality')}</span>
        <span class="value el-${ly.stemElement}">${vitality || ''}</span>
      </div>
    `;
  }

  function renderGlossary() {
    const container = document.getElementById('glossaryContent');
    const isEn = i18n.getLang() === 'en';

    const items = isEn ? [
      { title: 'What is BaZi?', text: 'BaZi (八字), also known as Four Pillars of Destiny, is a Chinese metaphysical system that uses your birth date and time to analyze destiny, character, and life patterns based on Heavenly Stems, Earthly Branches, and the Five Elements.' },
      { title: 'What is the Day Master?', text: 'The Day Master (日主/Ri Zhu) is the Heavenly Stem of the Day Pillar. It represents your core self and is the reference point for all 10 Gods and Five Element analysis.' },
      { title: 'What are the 10 Gods (十神)?', text: 'The 10 Gods classify how each pillar\'s energy relates to your Day Master. They reveal different life aspects: Career (正官/七杀), Wealth (正财/偏财), Intellect (正印/偏印), Creativity (食神/伤官), and Peer relations (比肩/劫财).' },
      { title: 'What are the Five Elements?', text: 'Wood (木), Fire (火), Earth (土), Metal (金), Water (水). They interact in generation (生) and control (克) cycles, forming the foundation of BaZi analysis.' },
      { title: 'What is Da Yun (大运)?', text: 'Da Yun are 10-year fortune cycles that activate different aspects of your chart throughout your life. Each cycle is marked by a specific Heavenly Stem and Earthly Branch.' },
      { title: 'What is Liunian (流年)?', text: 'Liunian is the current year\'s fortune, calculated from the year\'s Heavenly Stem and Earthly Branch and how they interact with your birth chart.' },
    ] : [
      { title: '什么是八字？', text: '八字（四柱预测）是中国传统命理学，通过出生年月日时的天干地支来分析命运、性格和人生轨迹。' },
      { title: '什么是日主？', text: '日主就是日柱的天干，代表命主自身，是十神和五行分析的基准点。' },
      { title: '什么是十神？', text: '十神是各柱能量与日主的关系分类，揭示事业（官杀）、财运（正偏财）、学识（印星）、才华（食伤）、人际（比劫）等信息。' },
      { title: '什么是五行？', text: '五行（木火土金水）相生相克，构成八字分析的基础。' },
      { title: '什么是大运？', text: '大运是每十年一换的运势周期，每个大运有特定天干地支，影响该十年的整体运势走向。' },
      { title: '什么是流年？', text: '流年即当年的运势，通过当年干支与命局的生克制化关系来判断吉凶。' },
    ];

    container.innerHTML = items.map(item => `
      <div class="glossary-item">
        <h5>${item.title}</h5>
        <p>${item.text}</p>
      </div>
    `).join('');
  }

  function elementToChinese(el) {
    const map = { Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水' };
    return map[el] || el;
  }

  function getWeekdayName(weekNum, isEn) {
    const days = isEn
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['日', '一', '二', '三', '四', '五', '六'];
    return isEn ? days[weekNum] || '' : '星期' + (days[weekNum] || '');
  }

  // Init
  updateUI();

  return { handleSubmit, toggleLang };
})();