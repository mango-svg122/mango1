const app = (() => {
  let currentData = null;

  function initRegions() {
    const sel = document.getElementById('birthRegion');
    sel.innerHTML = '';
    REGIONS.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name;
      sel.appendChild(opt);
    });
  }

  function initDateSelectors() {
    const yearSel = document.getElementById('birthYear');
    for (let y = new Date().getFullYear(); y >= 1900; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      if (y === 1990) opt.selected = true;
      yearSel.appendChild(opt);
    }

    const monthSel = document.getElementById('birthMonth');
    for (let m = 1; m <= 12; m++) {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      monthSel.appendChild(opt);
    }

    populateDays();
    document.getElementById('birthYear').addEventListener('change', populateDays);
    document.getElementById('birthMonth').addEventListener('change', populateDays);
  }

  function populateDays() {
    const daySel = document.getElementById('birthDay');
    const year = parseInt(document.getElementById('birthYear').value) || 2024;
    const month = parseInt(document.getElementById('birthMonth').value) || 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const current = daySel.value;
    daySel.innerHTML = '';
    for (let d = 1; d <= daysInMonth; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      daySel.appendChild(opt);
    }
    if (current && parseInt(current) <= daysInMonth) daySel.value = current;
  }

  function populateRegions() {
    const sel = document.getElementById('birthRegion');
    const isEn = i18n.getLang() === 'en';
    const selected = sel.value;
    sel.innerHTML = '';
    REGIONS.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = isEn ? r.name : r.nameZh;
      sel.appendChild(opt);
    });
    if (selected) sel.value = selected;
  }

  function toggleLang() {
    const newLang = i18n.getLang() === 'en' ? 'zh' : 'en';
    i18n.setLang(newLang);
    updateUI();
    document.getElementById('langBtn').textContent = i18n.t('langSwitch');
    if (currentData) renderResults(currentData);
  }

  function updateUI() {
    const isEn = i18n.getLang() === 'en';
    document.title = i18n.t('appTitle') + ' — ' + i18n.t('appSubtitle');
    document.querySelector('meta[name="description"]').setAttribute('content',
      i18n.getLang() === 'en'
        ? 'Free BaZi (Four Pillars of Destiny) fortune reading. Get your personalized birth chart, ten gods analysis, five elements distribution, and daily almanac based on ancient Chinese metaphysics and the I Ching.'
        : '免费八字排盘与命理分析。基于中国千年易经智慧，推算您的四柱八字、十神分析、五行分布和每日运势。');
    document.getElementById('subtitle').textContent = i18n.t('appSubtitle');
    document.getElementById('headerDesc').textContent = i18n.t('headerDesc');
    document.getElementById('inputTitle').textContent = i18n.t('inputTitle');

    document.getElementById('lblYear').textContent = i18n.t('birthYear');
    document.getElementById('lblMonth').textContent = i18n.t('birthMonth');
    document.getElementById('lblDay').textContent = i18n.t('birthDay');
    document.getElementById('lblTime').textContent = i18n.t('birthTime');
    document.getElementById('timeHint').textContent = 'If unknown, use 12:00 (noon)';
    document.getElementById('lblGender').textContent = i18n.t('gender');
    document.getElementById('optMale').textContent = i18n.t('male');
    document.getElementById('optFemale').textContent = i18n.t('female');
    document.getElementById('lblRegion').textContent = i18n.t('birthPlace');
    document.getElementById('regionHint').textContent = 'Used for timezone and solar time correction';
    document.getElementById('btnCalculate').textContent = i18n.t('calculate');

    document.getElementById('chartTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('resultsTitle')}`;
    document.getElementById('elemTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('fiveElements')}`;
    document.getElementById('analysisTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('analysis')}`;
    document.getElementById('dayunTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('dayun')}`;
    document.getElementById('liunianTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('liunian')}`;
    document.getElementById('quickTakeTitle').innerHTML = `<span class="accent">✦</span> ${isEn ? 'Your Fortune Outlook' : '运势总评'}`;
    document.getElementById('glossaryTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('glossary')}`;
    document.getElementById('shareTitle').innerHTML = `<span class="accent">✦</span> ${isEn ? 'Share Your Fortune' : '分享运势'}`;
    document.getElementById('warningsTitle').innerHTML = `<span class="accent">⚠</span> ${i18n.t('warnings')}`;
    document.getElementById('almanacTitle').innerHTML = `<span class="accent">✦</span> ${i18n.t('almanac')}`;

    document.getElementById('thAge').textContent = i18n.t('age');
    document.getElementById('thPillar').textContent = i18n.t('pillar');
    document.getElementById('thElement').textContent = i18n.t('element');
    document.getElementById('thTenGod').textContent = i18n.t('tenGod');

    document.getElementById('lblSolarDate').textContent = i18n.t('solarDate');
    document.getElementById('lblLunarDate').textContent = i18n.t('lunarDate');
    document.getElementById('lblAnimal').textContent = i18n.t('animal');
    document.getElementById('lblAdjustedTime').textContent = i18n.t('adjustedTime');
    document.getElementById('lblDayMasterInfo').textContent = i18n.t('dayMaster') + ':';

    document.querySelector('html').lang = i18n.getLang() === 'zh' ? 'zh-CN' : 'en';

    populateRegions();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errorBox = document.getElementById('errorBox');
    errorBox.classList.remove('active');

    const year = parseInt(document.getElementById('birthYear').value);
    const month = parseInt(document.getElementById('birthMonth').value);
    const day = parseInt(document.getElementById('birthDay').value);
    const timeVal = document.getElementById('birthTime').value;
    if (!year || !month || !day || !timeVal) {
      showError(i18n.t('errorRequired'));
      return;
    }

    const [hour, minute] = timeVal.split(':').map(Number);
    const gender = document.getElementById('gender').value;
    const regionId = document.getElementById('birthRegion').value;
    const region = REGIONS.find(r => r.id === regionId);
    const tzOffset = region ? region.tzOffset : 8;
    const lng = region ? region.lng : undefined;
    const lat = region ? region.lat : undefined;

    showLoading(true);
    try {
      const result = api.calculate({ year, month, day, hour, minute, gender, tzOffset, lng, lat });
      if (result.success) {
        currentData = result.data;
        renderQuickTake(result.data);
        renderResults(result.data);
        renderAlmanac(result.data);
        renderWarnings(result.data);
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
    const pillarLabels = [i18n.t('yearPillar'), i18n.t('monthPillar'), i18n.t('dayPillar'), i18n.t('hourPillar')];
    const pillars = [data.pillars.year, data.pillars.month, data.pillars.day, data.pillars.hour];

    chart.innerHTML = '';

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
      cell.textContent = isEn ? p.tenGod?.english : p.tenGod?.chinese;
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
      const height = Math.max(4, (el.score / maxScore) * 100);
      const pct = total > 0 ? Math.round(el.score / total * 100) : 0;

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
    grid.innerHTML = '';

    if (s.dayMaster) {
      const card = createAnalysisCard(i18n.t('dayMaster'), `<strong>${s.dayMaster.title}</strong><br><br>${s.dayMaster.body}`);
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

    startAgeEl.textContent = isEn ? `Fortune starts at age ${fortune.startAge}` : `起运年龄：${fortune.startAge}岁`;

    tbody.innerHTML = '';
    fortune.dayun.forEach((d) => {
      const tr = document.createElement('tr');
      if (fortune.currentDayun && fortune.currentDayun.ageStart === d.ageStart) tr.className = 'current-row';

      const ageStr = isEn ? `${d.ageStart} - ${d.ageEnd}` : `${d.ageStart} - ${d.ageEnd}岁`;
      const pillarStr = isEn ? `${d.stem} (${d.stemEnglish}) ${d.branch} (${d.branchEnglish})` : `${d.stem}${d.branch}`;
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

    card.innerHTML = `
      <h4>${ly.year} — ${ly.ganZhi}</h4>
      <div class="gan-zhi el-${ly.stemElement}">${ly.ganZhi}</div>
      <div class="info-grid">
        <span class="label">${isEn ? 'Stem' : '天干'}</span>
        <span class="value">${ly.stem} (${ly.stemEnglish} ${ly.stemElement})</span>
        <span class="label">${isEn ? 'Branch' : '地支'}</span>
        <span class="value">${ly.branch} (${ly.branchEnglish} - ${ly.animal})</span>
        <span class="label">${i18n.t('tenGod')}</span>
        <span class="value">${isEn ? ly.tenGod?.english : ly.tenGod?.chinese}</span>
        <span class="label">${i18n.t('vitality')}</span>
        <span class="value el-${ly.stemElement}">${isEn ? ly.vitality?.stateEn : ly.vitality?.state}</span>
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

  function renderWarnings(data) {
    const container = document.getElementById('warningsContainer');
    const isEn = i18n.getLang() === 'en';
    const warnings = data.warnings || [];
    const section = document.getElementById('warningsSection');

    if (!warnings.length) {
      section.style.display = 'none';
      return;
    }
    section.style.display = 'block';

    container.innerHTML = warnings.map(w => {
      const lvlClass = w.level === 'danger' ? 'warning-danger' : w.level === 'caution' ? 'warning-caution' : 'warning-neutral';
      return `<div class="warning-item ${lvlClass}">
        <div class="warning-icon">${w.level === 'danger' ? '⚠️' : w.level === 'caution' ? '⚡' : '●'}</div>
        <div class="warning-text">${w.text}</div>
      </div>`;
    }).join('');
  }

  function renderQuickTake(data) {
    const container = document.getElementById('quickTakeContainer');
    const section = document.getElementById('quickTakeSection');
    const qt = data.quickTake;
    const isEn = i18n.getLang() === 'en';
    if (!qt) { section.style.display = 'none'; return; }
    section.style.display = 'block';

    const scoreColor = qt.score >= 60 ? 'var(--wood)' : qt.score >= 40 ? 'var(--accent-gold)' : 'var(--accent-red)';
    const levelLabel = isEn ? qt.level.charAt(0).toUpperCase() + qt.level.slice(1) : qt.level;

    const indicator = qt.level === 'excellent' ? '🌟' : qt.level === 'good' ? '👍' : qt.level === 'neutral' ? '➡️' : qt.level === 'cautious' ? '⚠️' : '🔴';

    container.innerHTML = `
      <div class="quicktake-score" style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <div style="font-size:2rem">${indicator}</div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <strong style="color:${scoreColor};font-size:1.1rem">${levelLabel}</strong>
            <span style="font-size:0.9rem;color:var(--text-muted)">${Math.round(qt.score)}/100</span>
          </div>
          <div style="height:8px;background:var(--border-color);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${qt.score}%;background:${scoreColor};border-radius:4px;transition:width 0.5s"></div>
          </div>
        </div>
      </div>
      <p style="font-size:0.95rem;line-height:1.7;color:var(--text-secondary);margin-bottom:12px">${qt.summary}</p>
      ${qt.keyPoints && qt.keyPoints.length ? '<div style="display:flex;flex-wrap:wrap;gap:8px">' + qt.keyPoints.map(kp =>
        `<span style="font-size:0.8rem;background:var(--card-bg);border:1px solid var(--border-color);border-radius:4px;padding:4px 10px;color:var(--text-secondary)">${kp}</span>`
      ).join('') + '</div>' : ''}
      ${qt.highlights && qt.highlights.length ? '<div style="margin-top:10px;font-size:0.85rem;color:var(--text-muted)">' + qt.highlights.map(h => `<div>• ${h}</div>`).join('') + '</div>' : ''}
    `;
  }

  function renderAlmanac(data) {
    const container = document.getElementById('almanacContainer');
    const isEn = i18n.getLang() === 'en';
    const a = data.almanac;
    if (!a) return;

    const YI_JI_EN = {
      '嫁娶': 'Marriage', '祭祀': 'Worship', '祈福': 'Prayer', '求嗣': 'Heir Praying',
      '开光': 'Consecration', '开市': 'Market Opening', '交易': 'Trading', '立券': 'Contract',
      '纳财': 'Wealth Intake', '纳畜': 'Livestock Intake', '入宅': 'House Moving',
      '移徙': 'Relocation', '安葬': 'Burial', '探病': 'Hospital Visit', '伐木': 'Logging',
      '上梁': 'Roof Beams', '安门': 'Door Installation', '出行': 'Travel', '入学': 'School Start',
      '安床': 'Bed Installation', '解除': 'Removal', '修造': 'Renovation', '动土': 'Ground Breaking',
      '破土': 'Earth Breaking', '竖柱': 'Pillar Raising', '经络': 'Meridian Work',
      '栽种': 'Planting', '牧养': 'Herding', '酝酿': 'Fermenting', '捕捉': 'Capture',
      '畋猎': 'Hunting', '取渔': 'Fishing', '起基': 'Foundation', '定磉': 'Base Setting',
      '扫舍': 'Cleaning', '剃头': 'Haircut', '沐浴': 'Bathing', '整手足甲': 'Nail Cutting',
      '分居': 'Separation', '开厕': 'Toilet Build', '造仓库': 'Warehouse Build',
      '塞穴': 'Hole Filling', '平治道涂': 'Road Repair', '修饰垣墙': 'Wall Repair',
      '造车器': 'Vehicle Making', '开柱眼': 'Pillar Holes', '作灶': 'Stove Build',
      '补垣': 'Wall Filling', '塞穴': 'Cavity Fill', '断蚁': 'Ant Control',
      '结网': 'Net Weaving', '取渔': 'Fishing', '鼓铸': 'Metal Casting',
      '装修': 'Decoration', '合寿木': 'Coffin Making', '入殓': 'Encoffining',
    };

    const DIRECTION_EN = {
      '坎': 'Kan (North)', '艮': 'Gen (Northeast)', '震': 'Zhen (East)',
      '巽': 'Xun (Southeast)', '离': 'Li (South)', '坤': 'Kun (Southwest)',
      '兑': 'Dui (West)', '乾': 'Qian (Northwest)',
      '正东': 'East', '正西': 'West', '正南': 'South', '正北': 'North',
      '东南': 'Southeast', '西南': 'Southwest', '东北': 'Northeast', '西北': 'Northwest',
      '东': 'East', '西': 'West', '南': 'South', '北': 'North',
    };

    const ANIMAL_EN = {
      '鼠': 'Rat', '牛': 'Ox', '虎': 'Tiger', '兔': 'Rabbit',
      '龙': 'Dragon', '蛇': 'Snake', '马': 'Horse', '羊': 'Goat',
      '猴': 'Monkey', '鸡': 'Rooster', '狗': 'Dog', '猪': 'Pig',
      '子': 'Rat', '丑': 'Ox', '寅': 'Tiger', '卯': 'Rabbit',
      '辰': 'Dragon', '巳': 'Snake', '午': 'Horse', '未': 'Goat',
      '申': 'Monkey', '酉': 'Rooster', '戌': 'Dog', '亥': 'Pig',
    };

    const mapList = (list, dict) => list.map(s => dict[s] || s).join(', ');
    const mapStr = (s, dict) => dict[s] || s;

    const yiStr = a.yi && a.yi.length ? (isEn ? mapList(a.yi, YI_JI_EN) : a.yi.join(', ')) : (isEn ? 'No specific recommendations' : '无');
    const jiStr = a.ji && a.ji.length ? (isEn ? mapList(a.ji, YI_JI_EN) : a.ji.join(', ')) : (isEn ? 'None' : '无');
    const chongStr = a.chong ? (isEn ? mapStr(a.chong, ANIMAL_EN) : a.chong) : (isEn ? 'None' : '无');
    const shaStr = a.sha ? (isEn ? mapStr(a.sha, DIRECTION_EN) : a.sha) : (isEn ? 'None' : '无');
    const caiStr = a.caiPosition ? (isEn ? mapStr(a.caiPosition, DIRECTION_EN) : a.caiPosition) : (isEn ? 'Unknown' : '未知');
    const xiStr = a.xiPosition ? (isEn ? mapStr(a.xiPosition, DIRECTION_EN) : a.xiPosition) : (isEn ? 'Unknown' : '未知');
    const fuStr = a.fuPosition ? (isEn ? mapStr(a.fuPosition, DIRECTION_EN) : a.fuPosition) : (isEn ? 'Unknown' : '未知');

    const almanacSummary = (() => {
      const yi = a.yi || [];
      const ji = a.ji || [];
      const yiCount = yi.length;
      const jiCount = ji.length;

      const has = (list, word) => list.some(s => s.includes(word));

      if (!isEn) {
        if (has(yi, '嫁娶') && has(yi, '祈福')) return '今日宜嫁娶、祈福，万事大吉。';
        if (has(yi, '开市') && has(yi, '交易')) return '今日利开业、交易、签约，财运亨通。';
        if (has(yi, '祭祀') && has(yi, '祈福')) return '今日宜祭祀、祈福，修身养性之日。';
        if (has(ji, '入宅') || has(ji, '移徙')) return '今日忌搬迁、入宅，不宜改变居所。';
        if (has(ji, '安葬') || has(ji, '探病')) return '今日忌安葬、探病，诸事宜谨慎。';
        if (has(ji, '伐木') || has(ji, '上梁')) return '今日忌动土、伐木，不宜破土开工。';
        if (jiCount > yiCount) return '今日宜静不宜动，诸事多加小心。';
        if (yiCount > jiCount) return '今日吉多凶少，适合规划与行动。';
        return '今日运势平平，宜按部就班。';
      }

      if (has(yi, '嫁娶') && has(yi, '祈福')) return 'An excellent day for weddings, worship, and celebration.';
      if (has(yi, '开市') || has(yi, '交易')) return 'A favorable day for business, trading, and financial decisions.';
      if (has(yi, '祭祀')) return 'A day well-suited for reflection, offerings, and spiritual practice.';
      if (has(ji, '入宅') || has(ji, '移徙')) return 'Avoid relocation or moving house today. Focus on stability.';
      if (has(ji, '安葬') || has(ji, '探病')) return 'A cautious day — avoid burials and hospital visits if possible.';
      if (has(ji, '伐木') || has(ji, '上梁')) return 'Not a good day for construction or groundbreaking activities.';
      if (jiCount > yiCount) return 'Better to keep a low profile today. Avoid major undertakings.';
      if (yiCount > jiCount) return 'Auspicious signs outweigh inauspicious ones. A good day to move forward.';
      return 'A neutral day — proceed with routine matters.';
    })();

    container.innerHTML = `
      <div class="almanac-header">
        <div class="almanac-date">${a.date} | ${isEn ? 'Lunar' : '农历'} ${a.lunarMonth}${isEn ? '' : '月'}${a.lunarDay}${isEn ? '' : '日'} (${a.ganZhi})</div>
        <div class="almanac-summary">${almanacSummary}</div>
      </div>
      <div class="almanac-grid">
        <div class="almanac-item good">
          <div class="almanac-label">${isEn ? 'Auspicious' : '宜'}</div>
          <div class="almanac-value">${yiStr}</div>
        </div>
        <div class="almanac-item bad">
          <div class="almanac-label">${isEn ? 'Inauspicious' : '忌'}</div>
          <div class="almanac-value">${jiStr}</div>
        </div>
        <div class="almanac-item">
          <div class="almanac-label">${isEn ? 'Clash Animal' : '冲'}</div>
          <div class="almanac-value">${chongStr}</div>
        </div>
        <div class="almanac-item">
          <div class="almanac-label">${isEn ? 'Sha Direction' : '煞'}</div>
          <div class="almanac-value">${shaStr}</div>
        </div>
        <div class="almanac-item">
          <div class="almanac-label">${isEn ? 'Wealth God' : '财神'}</div>
          <div class="almanac-value">${caiStr}</div>
        </div>
        <div class="almanac-item">
          <div class="almanac-label">${isEn ? 'Joy God' : '喜神'}</div>
          <div class="almanac-value">${xiStr}</div>
        </div>
      </div>
    `;
  }

  function elementToChinese(el) {
    return ({ Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水' })[el] || el;
  }

  function generateShareCard() {
    if (!currentData) return;
    const canvas = document.getElementById('shareCanvas');
    const preview = document.getElementById('sharePreview');
    const ctx = canvas.getContext('2d');
    const W = 600, H = 800;
    canvas.width = W;
    canvas.height = H;

    const bg = '#F5F0E8';
    const text = '#2C2416';
    const accent = '#CC3333';
    const gold = '#C4964A';
    const muted = '#9C8C7A';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    ctx.fillStyle = text;
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('☯ OracleDivine', W / 2, 80);

    ctx.font = '16px Georgia, serif';
    ctx.fillStyle = accent;
    ctx.fillText('BaZi Four Pillars of Destiny', W / 2, 110);

    ctx.strokeStyle = muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 130);
    ctx.lineTo(W - 60, 130);
    ctx.stroke();

    const d = currentData;
    const gz = d.ganZhi;
    const dm = d.dayMaster;

    ctx.font = '18px Georgia, serif';
    ctx.fillStyle = text;
    ctx.textAlign = 'left';
    ctx.fillText('BaZi Chart', 50, 175);

    ctx.font = '22px Georgia, serif';
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.fillText(gz.year + '  ' + gz.month + '  ' + gz.day + '  ' + gz.hour, W / 2, 215);

    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = text;
    ctx.textAlign = 'left';
    ctx.fillText('Day Master: ' + dm.stem + ' (' + dm.english + ' ' + dm.element + ' ' + dm.yinYang + ')', 50, 255);
    ctx.fillText('Zodiac: ' + d.yearAnimal, 50, 280);

    const qt = d.quickTake;
    ctx.strokeStyle = muted;
    ctx.beginPath();
    ctx.moveTo(60, 305);
    ctx.lineTo(W - 60, 305);
    ctx.stroke();

    ctx.fillStyle = text;
    ctx.font = '18px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Fortune Score', 50, 335);

    const score = qt ? Math.round(qt.score) : 50;
    const barW = 400, barH = 12;
    const barX = 100, barY = 350;
    ctx.fillStyle = '#D4C5A9';
    ctx.fillRect(barX, barY, barW, barH);
    const scoreColor = score >= 60 ? '#2E7D32' : score >= 40 ? '#C4964A' : '#CC3333';
    ctx.fillStyle = scoreColor;
    ctx.fillRect(barX, barY, barW * score / 100, barH);

    ctx.fillStyle = text;
    ctx.font = 'bold 14px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(score + '/100', barX + barW + 15, barY + 12);

    if (qt) {
      const words = wrapText(ctx, qt.summary, 500, 16);
      let y = 390;
      ctx.font = '14px Georgia, serif';
      ctx.fillStyle = muted;
      ctx.textAlign = 'left';
      for (const line of words.slice(0,3)) {
        ctx.fillText(line, 50, y);
        y += 22;
      }
    }

    ctx.fillStyle = muted;
    ctx.font = '11px Georgia, serif';
    ctx.textAlign = 'center';

    

    // QR code placeholder
    ctx.fillStyle = '#2C2416';
    ctx.fillRect(W / 2 - 50, H - 220, 100, 100);
    ctx.fillStyle = bg;
    ctx.font = '10px Georgia, serif';
    ctx.fillText('QR', W / 2, H - 170);

    ctx.fillStyle = muted;
    ctx.font = '12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to get your own BaZi reading', W / 2, H - 105);
    ctx.fillStyle = accent;
    ctx.font = '11px Georgia, serif';
    ctx.fillText('mango-svg122.github.io/mango1', W / 2, H - 80);

    canvas.style.display = 'block';
    preview.innerHTML = '';
    preview.appendChild(canvas);

    generateQRCode(W / 2, H);
  }

  function wrapText(ctx, text, maxW, fontSize) {
    ctx.font = fontSize + 'px Georgia, serif';
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const w of words) {
      const test = current ? current + ' ' + w : w;
      if (ctx.measureText(test).width > maxW) {
        lines.push(current);
        current = w;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  let qrInstance = null;
  function generateQRCode(cx, cy) {
    const container = document.createElement('div');
    container.id = 'qrcode-temp';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    try {
      qrInstance = new QRCode(container, {
        text: 'https://mango-svg122.github.io/mango1/',
        width: 100,
        height: 100,
      });
      const img = container.querySelector('img');
      if (img) {
        const canvas = document.getElementById('shareCanvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, canvas.width / 2 - 50, canvas.height - 220, 100, 100);
      }
    } catch(e) { /* QR library may not be loaded */ }
    setTimeout(() => { const el = document.getElementById('qrcode-temp'); if (el) el.remove(); }, 1000);
  }

  function downloadShare() {
    try {
      generateShareCard();
      setTimeout(() => {
        const canvas = document.getElementById('shareCanvas');
        const link = document.createElement('a');
        link.download = 'OracleDivine-BaZi-Reading.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }, 500);
    } catch(e) {
      console.error('[app] downloadShare failed:', e);
    }
  }

  function shareTwitter() {
    const dm = currentData?.dayMaster;
    const text = dm
      ? 'I just got my BaZi reading on OracleDivine! My Day Master is ' + dm.stem + ' (' + dm.english + ' ' + dm.element + '). Check yours:'
      : 'I just got my BaZi reading on OracleDivine! Check yours:';
    const url = 'https://mango-svg122.github.io/mango1/';
    const shareUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }

  function shareFacebook() {
    const url = 'https://mango-svg122.github.io/mango1/';
    const shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }

  function copyLink() {
    navigator.clipboard.writeText('https://mango-svg122.github.io/mango1/').then(() => {
      const btn = document.getElementById('btnCopy');
      const orig = btn.textContent;
      btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = orig, 2000);
    }).catch(() => {
      prompt('Copy this URL:', 'https://mango-svg122.github.io/mango1/');
    });
  }

  function getWeekdayName(weekNum, isEn) {
    return isEn
      ? (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][weekNum] || '')
      : '星期' + (['日', '一', '二', '三', '四', '五', '六'][weekNum] || '');
  }

  // Wrap each init in try/catch so one failure doesn't block the rest
  try { initRegions(); } catch(e) { console.error('[app] initRegions failed:', e); }
  try { initDateSelectors(); } catch(e) { console.error('[app] initDateSelectors failed:', e); }
  try { updateUI(); } catch(e) { console.error('[app] updateUI failed:', e); }

  return { handleSubmit, toggleLang, downloadShare, shareTwitter, shareFacebook, copyLink };
})();