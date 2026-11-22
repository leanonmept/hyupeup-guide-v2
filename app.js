/* =========================================================
   장기요양기관 휴·폐업 준비 도우미 v2
   - 4단계 맞춤진단 / 서식·예시 / 편철·계산 / 질문·점검
   - 자료: 국민건강보험공단 별지 서식 원본(PDF) + 이관목록표 작성예시
   ========================================================= */
(() => {
  'use strict';

  /* ---------------- helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const THIS_YEAR = new Date().getFullYear();
  const THIS_MONTH = new Date().getMonth() + 1;
  const curYm = () => `${THIS_YEAR}-${pad(THIS_MONTH)}`;
  const KEY = 'hyupeup-v2';

  /* ---------------- official PDFs ---------------- */
  const PDFS = {
    application: {
      path: 'assets/forms/application.pdf',
      preview: 'assets/previews/application.png',
      filename: '장기요양급여제공자료_공단이관_자체보관_신청서.pdf',
      title: '장기요양급여제공자료 공단이관(자체보관) 신청서',
      meta: '별지 제36호서식 · 개정 2020. 9. 29. · 2쪽'
    },
    transfer: {
      path: 'assets/forms/transfer-list.pdf',
      preview: 'assets/previews/transfer.png',
      filename: '장기요양급여제공자료_이관목록표.pdf',
      title: '장기요양급여 제공자료 이관 목록표',
      meta: '별지 제36호서식 [첨부서류 1] · 제2쪽 · 1쪽'
    },
    lost: {
      path: 'assets/forms/lost-damaged-list.pdf',
      preview: 'assets/previews/lost.png',
      filename: '장기요양급여제공자료_분실및훼손목록표.pdf',
      title: '분실 및 훼손 목록표',
      meta: '별지 제36호서식 [첨부서류 2] · 제3쪽 · 1쪽'
    },
    confirmation: {
      path: 'assets/forms/confirmation.pdf',
      preview: 'assets/previews/confirmation.png',
      filename: '확인서.pdf',
      title: '확인서',
      meta: '별지 제2호서식 · 개정 2022. 9. 30. · 1쪽'
    },
    authorization: {
      path: 'assets/forms/authorization.pdf',
      preview: 'assets/previews/authorization.png',
      filename: '장기요양급여제공자료_공단이관_자체보관_신청위임장.pdf',
      title: '공단이관(자체보관) 신청 위임장',
      meta: '대리 신청 시 작성 · 1쪽'
    },
    annex22: {
      path: 'assets/forms/binding/annex22.pdf',
      preview: 'assets/previews/annex22.png',
      filename: '2026_별지22_이동서비스일지.pdf',
      title: '이동서비스 일지',
      meta: '별지 제22호서식 · 2쪽'
    },
    annex23: {
      path: 'assets/forms/binding/annex23.pdf',
      preview: 'assets/previews/annex23.png',
      filename: '2026_별지23_주야간보호_목욕서비스_제공일지.pdf',
      title: '주·야간보호 목욕서비스 제공 일지',
      meta: '별지 제23호서식 · 1쪽'
    },
    annex24: {
      path: 'assets/forms/binding/annex24.pdf',
      preview: 'assets/previews/annex24.png',
      filename: '2026_별지24_가정방문급여_급여관리_업무수행일지.pdf',
      title: '가정방문급여(통합재가서비스 포함) 급여관리 업무수행일지',
      meta: '별지 제24호서식 · 개정 2026. 1. 1. · 3쪽'
    },
    annex24_2: {
      path: 'assets/forms/binding/annex24-2.pdf',
      preview: 'assets/previews/annex24_2.png',
      filename: '2026_별지24의2_주야간보호기관_인지활동형_프로그램관리자_업무수행일지.pdf',
      title: '주야간보호기관 인지활동형 프로그램관리자 업무수행일지',
      meta: '별지 제24호의2서식 · 개정 2026. 1. 1. · 3쪽'
    },
    annex24_3: {
      path: 'assets/forms/binding/annex24-3.pdf',
      preview: 'assets/previews/annex24_3.png',
      filename: '2026_별지24의3_치매전담형기관_프로그램관리자_업무수행일지.pdf',
      title: '치매전담형기관 프로그램관리자 업무수행일지',
      meta: '별지 제24호의3서식 · 개정 2026. 1. 1. · 3쪽'
    },
    annex25: {
      path: 'assets/forms/binding/annex25.pdf',
      preview: 'assets/previews/annex25.png',
      filename: '2026_별지25_교육시간_관리대장.pdf',
      title: '교육시간 관리 대장',
      meta: '별지 제25호서식 · 1쪽'
    },
    annex26: {
      path: 'assets/forms/binding/annex26.pdf',
      preview: 'assets/previews/annex26.png',
      filename: '2026_별지26_프로그램_운영기록지.pdf',
      title: '프로그램 운영 기록지',
      meta: '별지 제26호서식 · 개정 2024. 1. 1. · 2쪽'
    }
  };

  const MAIN_FORMS = [
    { pdf: 'application', num: '별지\n제36호', title: '공단이관(자체보관) 신청서', sub: '모든 경우 기본으로 작성하는 신청서 · 휴업 시 자체보관 계획까지 기재', tone: '' },
    { pdf: 'transfer', num: '첨부\n서류 1', title: '장기요양급여 제공자료 이관 목록표', sub: '실제 이관하는 자료의 연도별 수량과 매수를 작성', tone: '' },
    { pdf: 'lost', num: '첨부\n서류 2', title: '분실 및 훼손 목록표', sub: '분실·훼손된 이관자료가 있는 경우 작성', tone: 'red' },
    { pdf: 'confirmation', num: '별지\n제2호', title: '확인서', sub: '전건 분실·급여제공이력 없음 등 해당 시 작성', tone: '' },
    { pdf: 'authorization', num: '대리\n신청', title: '공단이관(자체보관) 신청 위임장', sub: '대표자가 아닌 대리인이 신청하는 경우 작성', tone: 'gray' }
  ];

  const ANNEX_FORMS = [
    { pdf: 'annex22', num: '별지\n22', title: '이동서비스 일지', sub: '주야간보호 기관 공통서류', tone: '' },
    { pdf: 'annex23', num: '별지\n23', title: '주·야간보호 목욕서비스 제공 일지', sub: '주야간보호 기관 공통서류', tone: '' },
    { pdf: 'annex24', num: '별지\n24', title: '가정방문급여 급여관리 업무수행일지', sub: '2026. 1. 1. 개정 · 방문요양·방문목욕·방문간호', tone: '' },
    { pdf: 'annex24_2', num: '별지\n24-2', title: '주야간보호기관 인지활동형 프로그램관리자 업무수행일지', sub: '2026. 1. 1. 개정 · 주야간보호', tone: '' },
    { pdf: 'annex24_3', num: '별지\n24-3', title: '치매전담형기관 프로그램관리자 업무수행일지', sub: '2026. 1. 1. 개정 · 치매전담실', tone: '' },
    { pdf: 'annex25', num: '별지\n25', title: '교육시간 관리 대장', sub: '공통서류', tone: '' },
    { pdf: 'annex26', num: '별지\n26', title: '프로그램 운영 기록지', sub: '주야간보호·단기보호·시설·공동생활가정', tone: '' }
  ];

  /* ---------------- services ---------------- */
  const SERVICE_META = {
    '방문요양': { icon: '🚶', docs: ['급여계약 서류', '급여제공기록지', '급여비용 명세서'] },
    '방문목욕': { icon: '🛁', docs: ['급여계약 서류', '급여제공기록지', '급여비용 명세서'] },
    '방문간호': { icon: '🩺', docs: ['급여계약 서류', '급여제공기록지', '방문간호지시서', '급여비용 명세서'] },
    '복지용구': { icon: '♿', docs: ['급여계약 서류', '급여제공기록지', '급여비용 명세서'] },
    '주야간보호': { icon: '☀️', docs: ['급여계약 서류', '급여제공기록지', '급여비용 명세서'] },
    '주야간보호 치매전담실': { icon: '🧩', docs: ['급여계약 서류', '급여제공기록지', '급여비용 명세서'] },
    '단기보호': { icon: '🏠', docs: ['급여계약 서류', '급여제공기록지', '급여비용 명세서'] },
    '노인요양시설': { icon: '🏢', docs: ['급여계약 서류', '급여제공기록지', '급여비용 명세서'] },
    '노인요양시설 치매전담실': { icon: '🌿', docs: ['급여계약 서류', '급여제공기록지', '급여비용 명세서'] },
    '공동생활가정': { icon: '🏡', docs: ['급여계약 서류', '급여제공기록지', '급여비용 명세서'] }
  };
  const SERVICE_NAMES = Object.keys(SERVICE_META);

  /** 2026년 편철구조 기준 공통서류 (원본 앱 로직 유지) */
  function commonDocsFor(service, year) {
    const base = [{ tag: '자체', name: '배상책임보험 증서' }, { tag: '자체', name: '직원 근무일지(출근부)' }];
    const education = { tag: '별지25', name: '교육시간 관리대장', pdf: 'annex25' };
    const program = { tag: '별지26', name: '프로그램 운영기록지', pdf: 'annex26' };
    const yNote = year > 2026 ? '2026년 기준 자동 적용' : '2026.1.1.부터';
    const homeTask = year >= 2026
      ? { tag: '별지24', name: '가정방문급여 급여관리 업무수행일지', pdf: 'annex24', newNote: yNote }
      : { tag: '별지24', name: '프로그램관리자·사회복지사 업무수행일지', pdf: 'annex24' };
    const dayTask = year >= 2026
      ? { tag: '별지24-2', name: '주야간보호기관 인지활동형 프로그램관리자 업무수행일지', pdf: 'annex24_2', newNote: yNote }
      : { tag: '별지24-2', name: '주·야간보호 및 치매전담형 프로그램관리자 업무수행일지', pdf: 'annex24_2' };
    const dementiaTask = year >= 2026
      ? { tag: '별지24-3', name: '치매전담형 기관 프로그램관리자 업무수행일지', pdf: 'annex24_3', newNote: yNote }
      : { tag: '별지24-2', name: '주·야간보호 및 치매전담형 프로그램관리자 업무수행일지', pdf: 'annex24_2' };

    if (['방문요양', '방문목욕', '방문간호'].includes(service)) return [...base, homeTask, education];
    if (service === '복지용구') return [];
    if (service === '주야간보호') return [...base,
      { tag: '별지22', name: '이동서비스일지', pdf: 'annex22' },
      { tag: '별지23', name: '주·야간보호 목욕서비스 제공일지', pdf: 'annex23' },
      dayTask, education, program];
    if (service === '주야간보호 치매전담실') return [...base,
      { tag: '별지22', name: '이동서비스일지', pdf: 'annex22' },
      { tag: '별지23', name: '주·야간보호 목욕서비스 제공일지', pdf: 'annex23' },
      dementiaTask, education, program];
    if (service === '노인요양시설 치매전담실') return [...base, dementiaTask, education, program];
    if (['단기보호', '노인요양시설', '공동생활가정'].includes(service)) return [...base, education, program];
    return base;
  }

  function uniqueCommonDocs(services, year) {
    const map = new Map();
    services.forEach((s) => commonDocsFor(s, year).forEach((d) => map.set(d.tag + '|' + d.name, d)));
    const rank = (d) => {
      if (d.tag === '자체') return 0;
      const m = /별지\s*([0-9]+)(?:-([0-9]+))?/.exec(d.tag);
      if (!m) return 999;
      return Number(m[1]) * 10 + (m[2] ? Number(m[2]) : 0);
    };
    return [...map.values()]
      .map((d, i) => ({ d, i }))
      .sort((a, b) => rank(a.d) - rank(b.d) || a.i - b.i)
      .map((x) => x.d);
  }

  /* ---------------- FAQ ---------------- */
  const FAQ_CATS = ['전체', '절차', '서류', '자료이관', '편철', '서식'];
  const FAQS = [
    {
      cat: '절차',
      q: '휴·폐업 준비를 시작하면 무엇을 먼저 해야 하나요?',
      a: '공단에 자료이관 또는 해당 유형의 접수를 진행하여 <b>접수증</b>을 받은 뒤, 그 접수증을 포함해 관할 <b>시·군·구 휴·폐업 신고</b>를 진행하는 흐름으로 확인합니다.'
    },
    {
      cat: '절차',
      q: '휴업 중 자료를 기관에서 직접 보관할 수 있나요?',
      a: '휴업기관은 <b>휴업 예정일 전에 자체보관을 신청</b>하고 공단의 허가를 받은 경우 자체보관이 가능합니다. 신청서에 보관기간·보관장소·보관책임자 등 기재사항을 확인하세요.'
    },
    {
      cat: '서류',
      q: '모든 경우 기본으로 작성하는 서류는 무엇인가요?',
      a: '공단이관(자체보관) <b>신청서</b>와 <b>이관 목록표</b>를 기본으로 확인합니다. 상황에 따라 분실 및 훼손 목록표, 확인서, 위임장이 추가됩니다.'
    },
    {
      cat: '서류',
      q: '대리인이 제출하면 무엇이 필요한가요?',
      a: '<b>위임장</b>과 <b>대리인 신분증</b>을 준비합니다. 개인기관은 인감증명서, 법인기관은 법인 인감증명서를 준비하며, 인감증명서는 최근 3개월 이내 발급본으로 준비하세요. 제출 전 관할 지사 기준을 확인하세요.'
    },
    {
      cat: '서류',
      q: '전건 분실이면 어떻게 처리하나요?',
      a: '신청서, 이관 목록표, <b>분실 및 훼손 목록표</b>, <b>확인서</b>를 준비하고 분실·훼손 경위를 정리합니다.'
    },
    {
      cat: '서류',
      q: '급여제공이력 없음은 어떤 경우인가요?',
      a: '최근 5년간 장기요양급여 제공이력이 없거나, 휴업 후 새로운 급여제공이력 없이 폐업하는 경우를 확인합니다. 신청서·이관 목록표·확인서를 준비합니다.'
    },
    {
      cat: '자료이관',
      q: '이관자료 준비기간은 어떻게 계산하나요?',
      a: '휴·폐업월을 포함한 <b>61개월분</b>입니다. 월 중간에 휴·폐업하더라도 <b>해당 월 전체</b>를 포함하며, 시작월과 종료월 모두 그 달 전체를 포함합니다.'
    },
    {
      cat: '자료이관',
      q: '급여비용 청구서·청구명세서도 이관하나요?',
      a: '휴·폐업 시 공단 이관 대상에서는 <b>제외</b>됩니다. 기관의 보존대상과 공단 이관대상을 구분하세요. 이관대상은 급여계약 서류, 급여제공기록지 등, 방문간호지시서, 급여비용 명세서 부본입니다.'
    },
    {
      cat: '자료이관',
      q: '전자문서로 관리한 자료는 어떻게 하나요?',
      a: '급여제공기록지, 방문간호지시서, 급여비용 명세 관련 자료를 전자문서로 관리한 경우 <b>신청서와 목록표의 전자문서 항목</b>을 함께 확인하세요.'
    },
    {
      cat: '편철',
      q: '편철할 때 가장 먼저 볼 기준은 무엇인가요?',
      a: '<b>연도별 구분</b>, <b>300매 기준</b>, <b>수급자 자료가 중간에 끊기지 않는지</b>, <b>목록표 수량과 실제 매수가 맞는지</b>를 확인합니다.'
    },
    {
      cat: '편철',
      q: '자료 수량은 어떻게 맞추나요?',
      a: '이관목록표에 적은 수량과 실제 이관자료의 매수가 일치하도록 최종 대조합니다. 분실·훼손 자료는 별도 목록표에 구분합니다.'
    },
    {
      cat: '편철',
      q: '한 권은 몇 매로 묶나요?',
      a: '약 <b>300매</b>를 1권 기준으로 나눕니다. 해가 바뀌면 새 권으로 시작하고, 한 수급자의 자료는 중간에 끊지 않습니다. 각 자료의 우측하단에는 연필로 매수를 적습니다.'
    },
    {
      cat: '서식',
      q: '2026년에 별지 24 계열 서식이 바뀌었나요?',
      a: '제공 중인 PDF 기준으로 <b>2026. 1. 1.</b>부터 별지 제24호(가정방문급여 급여관리 업무수행일지), 별지 제24호의2(주야간보호기관 인지활동형), 별지 제24호의3(치매전담형) 서식이 적용됩니다. 2025년 이전 자료는 적용 서식이 다를 수 있습니다.'
    },
    {
      cat: '서식',
      q: '이관목록표 작성예시는 어디서 보나요?',
      a: '<b>서식·예시</b> 탭에서 방문요양 기준 작성예시를 크게 볼 수 있습니다. 공통서류는 인정번호 칸에 서류명을, 매수는 ② 급여제공기록지 등 칸에 적습니다.'
    }
  ];

  /* ---------------- final checklist ---------------- */
  const FINAL_CHECKS = [
    { id: 'f-type', text: '휴업·폐업 및 처리유형을 확인했다' },
    { id: 'f-docs', text: '신청서와 이관목록표를 작성했다' },
    { id: 'f-extra', text: '확인서·분실목록표·위임장 등 추가서류를 확인했다' },
    { id: 'f-records', text: '이관대상과 이관 제외자료를 구분했다' },
    { id: 'f-binding', text: '연도·급여종류별 편철을 마쳤다' },
    { id: 'f-count', text: '이관목록표 수량과 실제 매수를 대조했다' },
    { id: 'f-visitor', text: '대표자/대리인 확인서류를 준비했다' },
    { id: 'f-receipt', text: '공단 접수증 및 시·군·구 신고 흐름을 확인했다' },
    { id: 'f-keep', text: '휴업기관 자체보관 허가 신청 해당 여부를 확인했다' },
    { id: 'f-elec', text: '전자문서로 관리한 자료의 항목을 확인했다' },
    { id: 'f-pencil', text: '각 자료 우측하단에 연필로 매수를 기입했다' },
    { id: 'f-office', text: '관할 지사에 추가 확인서류·접수방법을 확인했다' }
  ];

  /* ---------------- state ---------------- */
  const lastSixYears = () => Array.from({ length: 6 }, (_, i) => THIS_YEAR - 5 + i);

  function defaultState() {
    return {
      tab: 'diagnose',
      view: 'wizard',
      step: 1,
      business: null,
      situation: null,
      operation: null,
      visitor: null,
      entity: null,
      endMonth: curYm(),
      services: [],
      done: {},
      final: {},
      calcMonth: curYm(),
      years: lastSixYears(),
      bindServices: [],
      sheets: '',
      faqCat: '전체',
      fontLarge: false
    };
  }

  let state = defaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (saved && typeof saved === 'object') state = Object.assign(state, saved);
  } catch (e) { /* ignore corrupted storage */ }
  // normalize
  if (state.view !== 'result') state.view = 'wizard';
  if (!Array.isArray(state.services)) state.services = [];
  if (!Array.isArray(state.years)) state.years = lastSixYears();
  if (!Array.isArray(state.bindServices)) state.bindServices = [];
  if (!state.done || typeof state.done !== 'object') state.done = {};
  if (!state.final || typeof state.final !== 'object') state.final = {};
  if (!FAQ_CATS.includes(state.faqCat)) state.faqCat = '전체';
  if (!/^\d{4}-\d{2}$/.test(state.endMonth || '')) state.endMonth = curYm();
  if (!/^\d{4}-\d{2}$/.test(state.calcMonth || '')) state.calcMonth = curYm();
  if (typeof state.step !== 'number' || state.step < 1 || state.step > 4) state.step = 1;

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
  };

  /* ---------------- month math ---------------- */
  function calcPeriod(endYm, count = 61) {
    const [ey, em] = String(endYm).split('-').map(Number);
    if (!ey || !em) return null;
    const endIdx = ey * 12 + (em - 1);
    const startIdx = endIdx - (count - 1);
    const sy = Math.floor(startIdx / 12);
    const sm = (startIdx % 12) + 1;
    const years = [];
    for (let idx = startIdx; idx <= endIdx; idx++) {
      const y = Math.floor(idx / 12);
      const m = (idx % 12) + 1;
      let bucket = years[years.length - 1];
      if (!bucket || bucket.year !== y) {
        bucket = { year: y, from: m, to: m, count: 0 };
        years.push(bucket);
      }
      bucket.to = m;
      bucket.count += 1;
    }
    return { startY: sy, startM: sm, endY: ey, endM: em, count, years };
  }
  const ymLabel = (y, m) => `${y}.${pad(m)}`;
  function endMonthLabel() {
    const [y, m] = String(state.endMonth || curYm()).split('-').map(Number);
    return `${y}년 ${m}월`;
  }

  /* ---------------- plan builder ---------------- */
  const SITUATION_LABEL = { transfer: '자료이관', lost: '전건 분실', none: '급여제공이력 없음' };

  function buildPlan(s) {
    const period = calcPeriod(s.endMonth, 61);
    const yearForDocs = period ? period.endY : THIS_YEAR;
    const businessLabel = s.business === 'pause' ? '휴업' : '폐업';
    const situationLabel = SITUATION_LABEL[s.situation] || '미선택';
    const operationLabel = s.situation === 'transfer'
      ? (s.operation === 'active' ? '일부이관' : '이관완료')
      : null;
    const visitorLabel = s.visitor === 'rep' ? '대표자 직접 방문' : (s.visitor ? '대리인 방문' : '방문자 미정');
    const entityLabel = s.entity === 'individual' ? '개인기관' : (s.entity === 'corporate' ? '법인기관' : '');

    /* 공통 서류 */
    const common = [
      {
        id: 'doc-application', tag: '별지 제36호', name: '공단이관(자체보관) 신청서',
        sub: s.business === 'pause' ? '휴업 구분과 자체보관 계획(보관기간·장소·책임자)을 함께 기재' : '폐업 구분과 폐업일을 기재',
        pdf: 'application'
      },
      {
        id: 'doc-transferlist', tag: '첨부서류 1', name: '장기요양급여 제공자료 이관 목록표',
        sub: '실제 이관하는 자료의 연도별 수량과 매수를 기재 · 목록표 수량과 실제 매수를 대조',
        pdf: 'transfer'
      }
    ];

    /* 상황별 서류 */
    let situation = { label: '', items: [], note: '' };
    if (s.situation === 'transfer') {
      situation = {
        label: '자료이관 · 추가서류 없음',
        items: [],
        note: s.operation === 'active'
          ? '현재 급여제공 중이므로 기존 자료를 먼저 <b>일부이관</b>하고, 급여제공 종료 후 새로 발생한 자료까지 추가 이관합니다.'
          : '현재 급여제공이 없으므로 보존 중인 이관대상 자료를 정리해 <b>이관완료</b> 절차를 진행합니다.'
      };
    } else if (s.situation === 'lost') {
      situation = {
        label: '전건 분실',
        items: [
          { id: 'doc-lost', tag: '첨부서류 2', name: '분실 및 훼손 목록표', sub: '분실·훼손 자료를 구체적으로 기재', pdf: 'lost' },
          { id: 'doc-confirm', tag: '별지 제2호', name: '확인서', sub: '분실 경위 및 사실관계 확인', pdf: 'confirmation' }
        ],
        note: '신청서·이관목록표·분실 및 훼손 목록표·확인서를 준비하고 분실 경위와 남아 있는 증빙을 정리하세요.'
      };
    } else if (s.situation === 'none') {
      situation = {
        label: '급여제공이력 없음',
        items: [
          { id: 'doc-confirm', tag: '별지 제2호', name: '확인서', sub: '급여제공이력 없음 확인', pdf: 'confirmation' }
        ],
        note: '실제 최근 5년 급여제공이력이 없는지 다시 확인한 뒤 확인서를 작성하세요.'
      };
    }

    /* 신청인 확인서류 */
    let applicant = { label: '', items: [], note: '' };
    if (s.visitor === 'rep') {
      applicant.label = `대표자 직접 방문 · ${entityLabel || '기관 구분 미정'}`;
      applicant.items = s.entity === 'corporate'
        ? [
          { id: 'doc-rep-corp', tag: '확인', name: '법인 대표자 본인 확인서류', sub: '법인 관련 확인서류는 관할 지사 기준 확인' }
        ]
        : [
          { id: 'doc-rep-id', tag: '확인', name: '대표자 본인 확인이 가능한 신분증', sub: '방문 시 지참' }
        ];
      applicant.note = s.entity === 'corporate' ? '법인 관련 확인서류는 관할 지사 기준을 확인하세요.' : '';
    } else if (s.visitor === 'agent') {
      applicant.label = `대리인 방문 · ${entityLabel || '기관 구분 미정'}`;
      applicant.items = [
        { id: 'doc-auth', tag: '대리 신청', name: '공단이관(자체보관) 신청 위임장', sub: '위임내용을 구체적으로 기재', pdf: 'authorization' },
        { id: 'doc-agent-id', tag: '확인', name: '대리인 신분증', sub: '방문 시 지참' },
        s.entity === 'corporate'
          ? { id: 'doc-seal', tag: '확인', name: '법인 인감증명서', sub: '최근 3개월 이내 발급본' }
          : { id: 'doc-seal', tag: '확인', name: '인감증명서', sub: '최근 3개월 이내 발급본' }
      ];
      applicant.note = '인감증명서는 최근 3개월 이내 발급본으로 준비하세요.';
    }

    /* 이관대상 자료 */
    const records = [
      { id: 'rec-contract', tag: '①', name: '장기요양급여 계약에 관한 서류', sub: '수급자와 체결한 급여계약 관련 보존자료' },
      { id: 'rec-log', tag: '②', name: '급여제공기록지 등', sub: '급여제공기록지 및 급여비용 산정 관련 증빙자료' },
      { id: 'rec-nurse', tag: '③', name: '방문간호지시서', sub: '방문간호를 운영한 기관만 해당' },
      { id: 'rec-bill', tag: '④', name: '급여비용 명세서 부본', sub: '급여비용 명세서 또는 본인부담금 수납대장' }
    ];

    /* 급여종류별 공통서류 */
    const serviceDocs = Array.isArray(s.services) && s.services.length
      ? uniqueCommonDocs(s.services, yearForDocs)
      : [];

    /* 체크리스트 */
    const checklist = [];
    common.forEach((d) => checklist.push({ id: d.id, group: '공통', text: d.name }));
    situation.items.forEach((d) => checklist.push({ id: d.id, group: '상황별', text: d.name }));
    applicant.items.forEach((d) => checklist.push({ id: d.id, group: '신청인', text: d.name }));
    if (s.situation === 'transfer' || s.situation === 'lost') {
      checklist.push({ id: 'rec-check', group: '이관대상', text: '이관대상 자료 4종을 구분하고 매수를 확인했다' });
    }
    serviceDocs.forEach((d) => checklist.push({
      id: 'svc-' + d.tag + '-' + d.name,
      group: '편철',
      text: `${d.name} (${d.tag === '자체' ? '자체서식' : '별지 제' + d.tag.replace('별지', '') + '호'})`
    }));

    return {
      period,
      yearForDocs,
      businessLabel,
      situationLabel,
      operationLabel,
      visitorLabel,
      entityLabel,
      common,
      situation,
      applicant,
      records,
      serviceDocs,
      excluded: {
        name: '장기요양급여비용 청구서·청구명세서',
        note: '보존자료에는 포함될 수 있지만 휴·폐업 시 공단 이관 대상에서는 제외됩니다.'
      },
      checklist
    };
  }

  /* ---------------- render: wizard ---------------- */
  const WIZ_META = [
    { q: '휴업인가요, 폐업인가요?', s: '진행하려는 업무를 먼저 선택하세요. 휴업은 자체보관 허가 여부도 함께 확인합니다.' },
    { q: '어떤 처리유형에 해당하나요?', s: '지금 보유한 자료 상황을 기준으로 선택하세요.' },
    { q: '누가, 어떤 상태로 신청하나요?', s: '현재 급여제공 여부와 방문자를 확인합니다.' },
    { q: '언제, 어떤 급여를 운영했나요?', s: '휴·폐업 예정월과 운영한 급여종류를 선택하면 맞춤 결과를 정리해 드립니다.' }
  ];

  const ICON = {
    pause: '<svg viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  const isStepValid = (step) => {
    if (step === 1) return !!state.business;
    if (step === 2) return !!state.situation;
    if (step === 3) {
      const opOk = state.situation === 'transfer' ? !!state.operation : true;
      return opOk && !!state.visitor && !!state.entity;
    }
    if (step === 4) return !!state.endMonth;
    return false;
  };

  function stepBody(step) {
    if (step === 1) {
      return `
        <div class="opt-grid">
          <button type="button" class="opt ${state.business === 'pause' ? 'selected' : ''}" data-act="pick" data-key="business" data-value="pause" aria-pressed="${state.business === 'pause'}">
            <span class="ico">${ICON.pause}</span><strong>휴업</strong>
          </button>
          <button type="button" class="opt ${state.business === 'close' ? 'selected' : ''}" data-act="pick" data-key="business" data-value="close" aria-pressed="${state.business === 'close'}">
            <span class="ico">${ICON.close}</span><strong>폐업</strong>
          </button>
        </div>
        <p class="out-note">${state.business === 'pause'
          ? '휴업은 휴업 예정일 전에 자체보관을 신청해 공단 허가를 받으면 기관 보관이 가능합니다.'
          : state.business === 'close'
            ? '폐업은 폐업일 기준으로 이관대상 자료를 정리해 공단에 이관합니다.'
            : '휴업과 폐업은 신청서 기재사항과 자체보관 안내가 달라집니다.'}</p>
        <details class="accordion" data-acc="keep">
          <summary>휴업기관의 자체보관 허가 <b>＋</b></summary>
          <div class="acc-body"><p>휴업기관은 휴업 예정일 전에 자체보관을 신청하고 공단의 허가를 받은 경우 기관에서 자료를 보관할 수 있습니다. 보관기간·장소·책임자 등 신청서 기재사항을 확인해야 합니다.</p></div>
        </details>`;
    }
    if (step === 2) {
      const opt = (key, title, sub) => `
        <button type="button" class="opt ${state.situation === key ? 'selected' : ''}" data-act="pick" data-key="situation" data-value="${key}" aria-pressed="${state.situation === key}">
          <span class="dot">✓</span>
          <span><strong>${title}</strong><small>${sub}</small></span>
        </button>`;
      return `
        <div class="opt-grid one">
          ${opt('transfer', '자료이관', '이관할 장기요양급여 제공자료가 있는 경우')}
          ${opt('lost', '전건 분실', '이관해야 할 자료 전체를 제출할 수 없는 경우')}
          ${opt('none', '급여제공이력 없음', '최근 5년간 제공이력이 없거나 휴업 후 새 이력 없이 폐업하는 경우')}
        </div>
        <details class="accordion" data-acc="diff">
          <summary>일부이관과 이관완료 차이 <b>＋</b></summary>
          <div class="acc-body">
            <p><b>일부이관</b>은 아직 급여제공이 계속되고 있어 기존 자료를 먼저 이관하는 경우입니다.</p>
            <p><b>이관완료</b>는 급여제공이 끝난 뒤 보존 중인 이관대상 자료를 최종적으로 모두 이관한 상태입니다.</p>
          </div>
        </details>`;
    }
    if (step === 3) {
      const seg = (key, value, label, icon) => `
        <button type="button" class="opt ${state[key] === value ? 'selected' : ''}" data-act="pick" data-key="${key}" data-value="${value}" aria-pressed="${state[key] === value}">
          <span class="dot">✓</span>
          <span><strong>${label}</strong></span>
        </button>`;
      const operationBlock = state.situation === 'transfer'
        ? `<div class="sub-head"><strong>현재 급여제공 여부</strong><span class="tag tag-blue">${state.operation === 'active' ? '일부이관' : state.operation === 'ended' ? '이관완료' : '선택 필요'}</span></div>
           <div class="opt-grid one">
             ${seg('operation', 'active', '현재 급여제공 중')}
             ${seg('operation', 'ended', '현재 급여제공 없음')}
           </div>`
        : `<div class="note note-blue"><b>참고</b><p>현재 급여제공 여부는 <b>자료이관</b> 유형에서 일부이관·이관완료를 나눌 때 사용합니다. 선택한 유형에서는 적용되지 않습니다.</p></div>`;

      return `
        ${operationBlock}
        <div class="sub-head"><strong>누가 방문하나요?</strong></div>
        <div class="opt-grid">
          ${seg('visitor', 'rep', '대표자 직접 방문')}
          ${seg('visitor', 'agent', '대리인 방문')}
        </div>
        ${state.visitor ? `
          <div class="sub-head"><strong>기관 구분</strong></div>
          <div class="opt-grid">
            ${seg('entity', 'individual', '개인기관')}
            ${seg('entity', 'corporate', '법인기관')}
          </div>` : ''}
        <details class="accordion" data-acc="seal">
          <summary>개인·법인 인감 차이 <b>＋</b></summary>
          <div class="acc-body">
            <p><b>개인기관</b>은 대표자 인감증명서를, <b>법인기관</b>은 법인 인감증명서를 준비합니다.</p>
            <p>대리인이 방문하는 경우 위임장과 대리인 신분증이 함께 필요하며, 인감증명서는 최근 3개월 이내 발급본으로 준비하세요.</p>
          </div>
        </details>`;
    }
    /* step 4 */
    const chips = SERVICE_NAMES.map((name) => `
      <button type="button" class="chip ${state.services.includes(name) ? 'on' : ''}" data-act="toggle-service" data-value="${esc(name)}" aria-pressed="${state.services.includes(name)}">
        <span class="tick">✓</span>${esc(name)}
      </button>`).join('');
    return `
      <label class="field" for="endMonth"><span>휴·폐업 예정월</span>
        <input type="month" id="endMonth" value="${esc(state.endMonth)}" />
      </label>
      <p class="out-note" style="margin-top:6px">선택한 월: <b>${endMonthLabel()}</b> · 이 달 전체를 포함해 61개월을 계산합니다.</p>
      <div class="sub-head"><strong>운영한 급여종류</strong><span class="tag tag-gray">복수 선택</span></div>
      <div class="chip-grid chips-service">${chips}</div>
      <p class="out-note">${state.services.length
        ? '선택한 급여종류에 따라 편철할 공통서류(별지 제22~26호 등)가 달라집니다.'
        : '급여종류를 고르지 않아도 진단은 가능합니다. 급여제공이력이 없다면 비워 두셔도 됩니다.'}</p>`;
  }

  function renderWizard() {
    const openAcc = $$('#wizardView details[data-acc]').filter((d) => d.open).map((d) => d.dataset.acc);
    const step = state.step;
    const meta = WIZ_META[step - 1];
    const valid = isStepValid(step);
    const bars = [1, 2, 3, 4].map((i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('');
    $('#wizardView').innerHTML = `
      <section class="wizard" aria-label="맞춤진단 4단계">
        <div class="wiz-bars">${bars}</div>
        <div class="wiz-meta"><span>STEP ${step} / 4</span><em>${['업무 구분', '처리유형', '신청 조건', '기간·급여'][step - 1]}</em></div>
        <h2 class="wiz-q">${meta.q}</h2>
        <p class="wiz-sub">${meta.s}</p>
        <div class="wiz-body">${stepBody(step)}</div>
        <div class="wiz-actions${step > 1 ? '' : ' single'}">
          ${step > 1 ? '<button type="button" class="btn ghost" data-act="wiz-prev" style="width:auto">이전</button>' : ''}
          <button type="button" class="btn primary" data-act="wiz-next" ${valid ? '' : 'disabled'}>${step < 4 ? '다음 단계' : '진단 결과 보기'}</button>
        </div>
      </section>`;
    openAcc.forEach((key) => {
      const el = $(`#wizardView details[data-acc="${key}"]`);
      if (el) el.open = true;
    });
  }

  /* ---------------- render: result ---------------- */
  function docRow(item, opts = {}) {
    const pdf = item.pdf ? PDFS[item.pdf] : null;
    return `
      <div class="doc-row">
        <div class="dr-main">
          <div class="dr-line"><strong>${esc(item.name)}</strong>${item.tag ? `<span class="tag ${opts.tagClass || 'tag-blue'}">${esc(item.tag)}</span>` : ''}</div>
          ${item.sub ? `<small>${esc(item.sub)}</small>` : ''}
        </div>
        ${pdf ? `<button type="button" class="dr-btn" data-act="pdf" data-pdf="${item.pdf}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6zM14 3v5h5"/></svg>서식
        </button>` : ''}
      </div>`;
  }

  function groupHead(no, title, sub) {
    return `<div class="doc-group-head"><b>${no}</b><div><strong>${title}</strong>${sub ? `<small style="display:block">${sub}</small>` : ''}</div></div>`;
  }

  function renderResult() {
    const plan = buildPlan(state);
    const p = plan.period;
    const doneCount = plan.checklist.filter((c) => state.done[c.id]).length;
    const pct = plan.checklist.length ? Math.round((doneCount / plan.checklist.length) * 100) : 0;

    const yearbars = p.years.map((b) => `
      <div class="yearbar">
        <b>${b.year}년</b>
        <span class="track"><i style="width:${Math.round((b.count / 12) * 100)}%"></i></span>
        <em>${b.count}개월</em>
      </div>`).join('');

    const checklistHTML = plan.checklist.map((c) => `
      <label class="check-item ${state.done[c.id] ? 'on' : ''}" data-group="${esc(c.group)}">
        <input type="checkbox" data-chk="done" data-id="${esc(c.id)}" ${state.done[c.id] ? 'checked' : ''} />
        <span class="box">✓</span>
        <span>${esc(c.text)}</span>
      </label>`).join('');

    const situationBlock = plan.situation.items.length
      ? plan.situation.items.map((d) => docRow(d, { tagClass: 'tag-gray' })).join('')
      : `<div class="doc-empty">${plan.situation.note || '추가로 준비할 서류가 없습니다.'}</div>`;

    const recordBlock = (state.situation === 'transfer' || state.situation === 'lost')
      ? `<div class="sec-title"><h3>이관대상 자료</h3><small>${state.situation === 'lost' ? '원래 이관대상이었던 자료 기준' : '61개월분'}</small></div>
         <div class="doc-group">
           ${groupHead('4', '공단으로 이관하는 자료', '급여비용 청구서·청구명세서는 제외됩니다')}
           ${plan.records.map((d) => docRow({ ...d, tag: d.tag })).join('')}
         </div>`
      : '';

    const serviceBlock = plan.serviceDocs.length
      ? `<div class="sec-title"><h3>급여종류별 공통서류</h3><small>${plan.yearForDocs}년 편철 기준</small></div>
         <div class="doc-group">
           ${groupHead('5', '연도별 앞부분에 편철', '선택한 급여종류의 공통서류만 모았습니다')}
           ${plan.serviceDocs.map((d) => docRow({ id: 'svc-' + d.tag + '-' + d.name, name: d.name, tag: d.tag, sub: d.newNote ? `NEW · ${d.newNote}` : '', pdf: d.pdf }, { tagClass: d.tag === '자체' ? 'tag-gray' : 'tag-blue' })).join('')}
         </div>`
      : `<div class="note note-blue" style="margin-top:12px"><b>참고</b><p>급여종류를 선택하지 않아 급여종류별 공통서류는 표시하지 않았습니다. 필요하면 <b>답변 수정하기</b>에서 급여종류를 추가할 수 있습니다.</p></div>`;

    $('#resultView').innerHTML = `
      <div class="result-hero">
        <div class="rh-top"><span>맞춤 진단 결과</span><span class="tag tag-navy">4단계 완료</span></div>
        <h2>${esc(plan.businessLabel)} · ${esc(plan.situationLabel)}${plan.operationLabel ? ` · <em>${esc(plan.operationLabel)}</em>` : ''}</h2>
        <p>${esc(plan.visitorLabel)}${plan.entityLabel ? ' · ' + esc(plan.entityLabel) : ''} 기준으로 준비물을 정리했습니다.</p>
        <div class="rh-chips">
          ${state.situation === 'none'
            ? `<span>이관자료 없음</span><span>급여종류 ${state.services.length ? state.services.length + '개' : '미선택'}</span>`
            : `<span>${p ? `${ymLabel(p.startY, p.startM)} ~ ${ymLabel(p.endY, p.endM)}` : '기간 미정'}</span>
               <span>61개월분</span>
               <span>${state.services.length ? `급여종류 ${state.services.length}개` : '급여종류 미선택'}</span>`}
        </div>
      </div>

      <div class="flow3" aria-label="진행 순서">
        <div><b>1</b><strong>공단 접수</strong></div><i>›</i>
        <div><b>2</b><strong>접수증 수령</strong></div><i>›</i>
        <div><b>3</b><strong>시·군·구 신고</strong></div>
      </div>

      ${state.situation === 'none' ? `
      <section class="card">
        <div class="card-head">
          <span class="kicker">이관자료</span>
          <h3>이관할 자료가 없습니다</h3>
          <p>최근 5년간 급여제공이력이 없어 61개월 이관자료 준비기간은 해당되지 않습니다. 확인서에 이력 없음 사유를 기재해 제출하세요.</p>
        </div>
        <div class="doc-empty">신청서 · 이관 목록표(자료 없음) · 확인서를 준비합니다.</div>
      </section>` : `
      <section class="card">
        <div class="card-head">
          <span class="kicker">이관자료 준비기간</span>
          <h3>휴·폐업월 포함 61개월</h3>
          <p>예정월 ${p ? `${p.endY}년 ${p.endM}월` : '-'}을 포함해 계산했습니다. 시작월과 종료월은 그 달 전체를 포함합니다.</p>
        </div>
        <div class="period-big">
          <span class="period-badge"><b>61</b><small>개월</small></span>
          <div class="period-main">
            <span>${esc(plan.businessLabel)} 예정월 기준</span>
            <strong>${p ? `${ymLabel(p.startY, p.startM)} ~ ${ymLabel(p.endY, p.endM)}` : '기간을 선택하세요'}</strong>
            <small>${p ? p.years.map((b) => `${b.year}년 ${b.count}개월`).join(' · ') : ''}</small>
          </div>
        </div>
        <div class="yearbars">${yearbars}</div>
      </section>`}

      <div class="sec-title"><h3>제출·준비 서류</h3><small>${plan.checklist.length}개 항목</small></div>

      <div class="doc-group">
        ${groupHead('1', '공통 서류', '모든 경우 기본으로 작성')}
        ${plan.common.map((d) => docRow(d)).join('')}
      </div>

      <div class="doc-group">
        ${groupHead('2', `${esc(plan.situationLabel)} · 상황별 서류`, esc(plan.situation.label))}
        ${situationBlock}
      </div>

      <div class="doc-group">
        ${groupHead('3', '신청인 확인서류', esc(plan.applicant.label))}
        ${plan.applicant.items.map((d) => docRow(d, { tagClass: 'tag-gray' })).join('')}
        ${plan.applicant.note ? `<div class="note note-amber"><b>확인</b><p>${esc(plan.applicant.note)}</p></div>` : ''}
      </div>

      ${recordBlock}
      ${serviceBlock}

      <div class="excl">
        <b>이관 제외</b>
        <strong>${esc(plan.excluded.name)}</strong>
        <p>${esc(plan.excluded.note)}</p>
      </div>

      <section class="card" id="resCheckCard">
        <div class="card-head">
          <span class="kicker">준비 체크리스트</span>
          <h3>이 상황에 필요한 항목만</h3>
          <p>체크 상태는 이 기기에 저장됩니다.</p>
        </div>
        <div class="progress-box">
          <div class="progress-top"><span>준비 진행률</span><strong id="resPct">${pct}%</strong></div>
          <div class="progress-track"><i id="resBar" style="width:${pct}%"></i></div>
          <small id="resCount">${doneCount} / ${plan.checklist.length} 항목</small>
        </div>
        <div class="check-list" id="resChecks">${checklistHTML}</div>
      </section>

      <div class="result-actions">
        <button type="button" class="btn primary" data-act="copy">📋 준비물 요약 복사</button>
        <button type="button" class="btn line" data-act="edit-answers">답변 수정하기</button>
        <button type="button" class="btn ghost" data-act="restart">다시 진단하기</button>
      </div>
      <div class="note note-green" style="margin-top:12px">
        <b>마지막 확인</b>
        <p>최종 제출 전 관할 지사에 추가 확인서류와 접수방법을 확인하세요. 기관 상황에 따라 안내가 달라질 수 있습니다.</p>
      </div>`;
    $('#hero').classList.add('hidden');
  }

  function refreshResultProgress() {
    const plan = buildPlan(state);
    const doneCount = plan.checklist.filter((c) => state.done[c.id]).length;
    const pct = plan.checklist.length ? Math.round((doneCount / plan.checklist.length) * 100) : 0;
    const pctEl = $('#resPct'); const barEl = $('#resBar'); const cntEl = $('#resCount');
    if (pctEl) pctEl.textContent = pct + '%';
    if (barEl) barEl.style.width = pct + '%';
    if (cntEl) cntEl.textContent = `${doneCount} / ${plan.checklist.length} 항목`;
  }

  /* ---------------- render: forms ---------------- */
  function fileRow(item, opts = {}) {
    const pdf = PDFS[item.pdf];
    return `
      <div class="file-row">
        <span class="file-num ${item.tone || ''}">${esc(item.num).replace(/\n/g, '<br>')}</span>
        <div class="file-body">
          <strong>${esc(item.title)}</strong>
          <small>${esc(item.sub)}</small>
          <small style="margin-top:2px;color:#93A1B4">${esc(pdf.meta)}</small>
          <div class="file-actions">
            <button type="button" class="prev" data-act="pdf" data-pdf="${item.pdf}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></svg>미리보기
            </button>
            <button type="button" class="save" data-act="download" data-pdf="${item.pdf}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M8 11l4 4 4-4M5 20h14"/></svg>저장
            </button>
          </div>
        </div>
      </div>`;
  }

  function renderForms() {
    $('#formMain').innerHTML = MAIN_FORMS.map((f) => fileRow(f)).join('');
    $('#formAnnex').innerHTML = ANNEX_FORMS.map((f) => fileRow(f)).join('');
  }

  /* ---------------- render: binding ---------------- */
  function renderYearChips() {
    $('#yearChips').innerHTML = lastSixYears().map((y) => `
      <button type="button" class="chip ${state.years.includes(y) ? 'on' : ''}" data-act="toggle-year" data-value="${y}" aria-pressed="${state.years.includes(y)}">
        <span class="tick">✓</span>${y}년
      </button>`).join('');
  }

  function renderServiceChips() {
    $('#svcChips').innerHTML = SERVICE_NAMES.map((name) => `
      <button type="button" class="chip ${state.bindServices.includes(name) ? 'on' : ''}" data-act="toggle-bind-service" data-value="${esc(name)}" aria-pressed="${state.bindServices.includes(name)}">
        <span class="tick">✓</span>${esc(name)}
      </button>`).join('');
  }

  function renderAnnexLinks() {
    $('#annexLinks').innerHTML = ANNEX_FORMS.map((f) => fileRow({ ...f, num: (PDFS[f.pdf].meta.match(/별지 제([0-9-]+)호/) || [, f.num])[1], sub: f.sub })).join('');
  }

  function renderCalc() {
    const p = calcPeriod(state.calcMonth, 61);
    if (!p) { $('#calcOut').innerHTML = ''; return; }
    $('#calcOut').innerHTML = `
      <div class="period-big">
        <span class="period-badge"><b>61</b><small>개월</small></span>
        <div class="period-main">
          <span>휴·폐업 예정월 ${p.endY}년 ${p.endM}월 포함</span>
          <strong>${ymLabel(p.startY, p.startM)} ~ ${ymLabel(p.endY, p.endM)}</strong>
          <small>시작월·종료월 모두 그 달 전체를 포함합니다.</small>
        </div>
      </div>
      <div class="yearbars">${p.years.map((b) => `
        <div class="yearbar">
          <b>${b.year}년</b>
          <span class="track"><i style="width:${Math.round((b.count / 12) * 100)}%"></i></span>
          <em>${b.count}개월</em>
        </div>`).join('')}</div>
      <p class="out-note">${p.years[0].year}년은 ${p.years[0].from}월~${p.years[0].to}월, ${p.years[p.years.length - 1].year}년은 ${p.years[p.years.length - 1].from}월~${p.years[p.years.length - 1].to}월까지 포함합니다.</p>`;
  }

  function renderSheets() {
    const n = Number(state.sheets);
    if (!state.sheets || !Number.isFinite(n) || n <= 0) {
      $('#sheetsOut').innerHTML = '<p class="out-note">이관할 전체 매수를 입력하면 약 300매 기준 예상 권수를 계산합니다.</p>';
      return;
    }
    const total = Math.round(n);
    const vols = Math.ceil(total / 300);
    const last = total - (vols - 1) * 300;
    $('#sheetsOut').innerHTML = `
      <div class="kpi-row">
        <div class="kpi"><span>이관 매수</span><strong>${total.toLocaleString()}매</strong></div>
        <div class="kpi total"><span>예상 권수</span><strong>${vols}권</strong></div>
      </div>
      <p class="out-note">약 300매를 1권 기준으로 계산했습니다. 마지막 권은 <b>${last}매</b>입니다. 연도가 바뀌면 새 권으로 시작하므로 실제 권수는 달라질 수 있습니다.</p>`;
  }

  function renderBindingResult() {
    const years = [...state.years].sort((a, b) => a - b);
    const services = [...state.bindServices];
    const box = $('#bindingOut');
    if (!years.length || !services.length) {
      box.innerHTML = '';
      $('#bindingError').classList.remove('hidden');
      toast(!years.length ? '운영연도를 1개 이상 선택해 주세요.' : '급여종류를 1개 이상 선택해 주세요.');
      return;
    }
    $('#bindingError').classList.add('hidden');

    const nav = `<div class="year-nav" aria-label="선택 연도 바로가기">${years.map((y) => `<button type="button" data-act="year-jump" data-value="${y}">${y}년</button>`).join('')}</div>`;

    const cards = years.map((year, i) => {
      const common = uniqueCommonDocs(services, year);
      const commonHTML = common.length ? `
        <div class="common-box">
          <div class="block-title"><b>1</b><div><strong>공통서류</strong><small>해당 연도 자료의 앞부분에 먼저 정리</small></div></div>
          ${common.map((d) => `
            <div class="common-row">
              <span class="tag ${d.tag === '자체' ? 'tag-gray' : 'tag-blue'}">${esc(d.tag)}</span>
              <span class="name">${esc(d.name)}${d.newNote ? `<span class="new">NEW · ${esc(d.newNote)}</span>` : ''}</span>
              ${d.pdf ? `<button type="button" class="dr-btn" data-act="pdf" data-pdf="${d.pdf}">서식</button>` : '<span></span>'}
            </div>`).join('')}
          <div class="each-line"><b>✎</b> 각 자료 우측하단에 연필로 매수를 적습니다.</div>
        </div>` : `
        <div class="common-box"><div class="block-title"><b>1</b><div><strong>공통서류 없음</strong><small>복지용구는 수급자별 자료만 편철합니다</small></div></div></div>`;

      const serviceHTML = services.map((s) => {
        const meta = SERVICE_META[s];
        return `
          <div class="service-card">
            <div class="sc-head">
              <span class="ico">${meta.icon}</span>
              <div><small>급여종류</small><strong>${esc(s)}</strong></div>
            </div>
            <ol class="order-list">
              ${meta.docs.map((d, idx) => `
                <li>
                  <span class="no">${idx + 1}</span>
                  <span>${esc(d)}${d === '급여비용 명세서' ? '<small>(또는 본인부담금 수납대장)</small>' : ''}</span>
                  <span class="pen">✎ 매수</span>
                </li>`).join('')}
            </ol>
          </div>`;
      }).join('');

      return `
        <article class="year-card" id="binding-year-${year}">
          <div class="year-card-head">
            <h3>${year}년</h3>
            <small>${i + 1} / ${years.length}${year > 2026 ? '<em class="future-badge">2026년 기준 구조</em>' : ''}</small>
          </div>
          <div class="year-flow"><span>공통서류</span><i>→</i><span>수급자별 서류</span><i>→</i><span>다음 수급자 반복</span></div>
          ${commonHTML}
          <div class="block-title"><b>${common.length ? '2' : '1'}</b><div><strong>급여종류별 · 수급자별 서류</strong><small>수급자는 가나다 순으로 한 사람씩 이어서 편철</small></div></div>
          ${serviceHTML}
          <div class="repeat">↓ <b>다음 수급자도 같은 순서로 반복</b> · 한 수급자의 자료가 중간에 끊기지 않도록 묶은 뒤 다음 수급자로 넘어갑니다.</div>
        </article>`;
    }).join('');

    const oldYearNote = years.some((y) => y < 2026)
      ? `<div class="note note-amber"><b>서식 안내</b><p>2026년 이전 연도는 별지 제24호 계열 서식명을 당시 기준으로 표시합니다. 2025년 별지 24 계열은 7월 1일 서식 개정이 있었으니 실제 작성 시 적용 월의 서식을 확인하세요.</p></div>`
      : '';

    box.innerHTML = `
      <div class="binding-result-head"><strong>${years[0]}년 ~ ${years[years.length - 1]}년 편철 구조</strong><small>급여종류 ${services.length}개 선택</small></div>
      ${nav}
      ${cards}
      <div class="note note-blue"><b>마지막 확인</b><p>공통서류를 먼저 정리한 뒤, 수급자는 가나다 순으로 <b>급여계약 서류 → 급여제공기록지 → 방문간호지시서(해당 시) → 급여비용 명세서</b> 순으로 편철합니다. 각 자료의 우측하단에는 연필로 매수를 적습니다.</p></div>
      ${oldYearNote}`;
  }

  /* ---------------- render: FAQ ---------------- */
  function renderFaq() {
    $('#faqCats').innerHTML = FAQ_CATS.map((c) => `
      <button type="button" class="pill ${state.faqCat === c ? 'on' : ''}" data-act="faq-cat" data-value="${esc(c)}">${esc(c)}</button>`).join('');

    const q = ($('#faqSearch').value || '').trim().toLowerCase();
    const list = FAQS.filter((f) => {
      const catOk = state.faqCat === '전체' || f.cat === state.faqCat;
      if (!catOk) return false;
      if (!q) return true;
      const plain = (f.q + ' ' + f.a).replace(/<[^>]+>/g, ' ').toLowerCase();
      return plain.includes(q);
    });

    $('#faqList').innerHTML = list.length
      ? list.map((f) => `
          <details>
            <summary>${esc(f.q)}<i>＋</i></summary>
            <div class="a"><span class="faq-cat">${esc(f.cat)}</span><div>${f.a}</div></div>
          </details>`).join('')
      : `<div class="faq-empty">검색 결과가 없습니다. 다른 단어로 찾아보세요.</div>`;
  }

  function renderFinal() {
    const total = FINAL_CHECKS.length;
    const done = FINAL_CHECKS.filter((c) => state.final[c.id]).length;
    const pct = Math.round((done / total) * 100);
    $('#finalPct').textContent = pct + '%';
    $('#finalBar').style.width = pct + '%';
    $('#finalCount').textContent = `${done} / ${total} 항목`;
    $('#finalList').innerHTML = FINAL_CHECKS.map((c) => `
      <label class="check-item ${state.final[c.id] ? 'on' : ''}">
        <input type="checkbox" data-chk="final" data-id="${c.id}" ${state.final[c.id] ? 'checked' : ''} />
        <span class="box">✓</span>
        <span>${esc(c.text)}</span>
      </label>`).join('');
  }

  /* ---------------- tabs / font ---------------- */
  function setTab(name, opts = {}) {
    if (!['diagnose', 'forms', 'binding', 'qa'].includes(name)) return;
    state.tab = name;
    save();
    $$('.panel').forEach((p) => p.classList.toggle('active', p.dataset.panel === name));
    $$('.tab').forEach((b) => {
      const on = b.dataset.tab === name;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: opts.smooth ? 'smooth' : 'auto' });
  }

  function applyFont() {
    document.documentElement.classList.toggle('lg', !!state.fontLarge);
    const btn = $('#fontBtn');
    btn.textContent = state.fontLarge ? '가−' : '가+';
    btn.setAttribute('aria-pressed', state.fontLarge ? 'true' : 'false');
    btn.setAttribute('aria-label', state.fontLarge ? '기본 글자 크기로' : '글자 크게 보기');
  }

  /* ---------------- toast / modal / clipboard ---------------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2100);
  }

  function openModal({ kicker, title, body, foot, short }) {
    $('#modalKicker').textContent = kicker;
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = body;
    $('#modalFoot').innerHTML = foot || '';
    $('#modal').classList.toggle('sheet-short', !!short);
    $('#modal').classList.add('open');
    $('#modal').setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-lock');
  }
  function closeModal() {
    // 서식(iframe) 문서를 유지한 채 모달만 닫습니다.
    // (닫는 순간 iframe을 지우면 로딩 중인 PDF 요청이 중단됩니다)
    $('#modal').classList.remove('open');
    $('#modal').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-lock');
  }

  function openPdf(key) {
    const pdf = PDFS[key];
    if (!pdf) return;
    const yearMatch = /별지 제(\d+(?:-\d+)?)호/.exec(pdf.meta);
    openModal({
      kicker: yearMatch ? `별지 제${yearMatch[1]}호서식` : '제출서식',
      title: pdf.title,
      body: `<div class="image-scroll pdf-preview"><img src="${pdf.preview}" alt="${esc(pdf.title)} 1쪽 미리보기" /></div>`,
      foot: `
        <div class="foot-note">${esc(pdf.meta)} · 1쪽 미리보기입니다. 원본 전체는 ‘PDF 원본 열기’에서 확인하세요.</div>
        <a class="acc" href="${pdf.path}" target="_blank" rel="noopener">PDF 원본 열기</a>
        <button type="button" data-act="download" data-pdf="${key}">PDF 저장</button>
        <button type="button" data-act="modal-close">닫기</button>`
    });
    const scroll = $('#modalBody .image-scroll');
    if (scroll) { scroll.scrollTop = 0; scroll.scrollLeft = 0; }
  }

  function downloadPdf(key) {
    const pdf = PDFS[key];
    if (!pdf) return;
    const a = document.createElement('a');
    a.href = pdf.path;
    a.download = pdf.filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('PDF 저장을 시작합니다.');
  }

  function openExample() {
    openModal({
      kicker: '작성예시 · 방문요양',
      title: '이관목록표 작성예시',
      body: `<div class="image-scroll center" id="imgScroll"><img src="assets/transfer_list_example.png" alt="방문요양 이관목록표 작성예시 크게 보기" /></div>`,
      short: true,
      foot: `
        <div class="foot-note">처음에는 전체가 보입니다. 필요한 경우에만 ‘조금 크게’를 눌러 확인하세요.</div>
        <button type="button" data-act="example-zoom" id="zoomBtn">조금 크게</button>
        <a class="acc" href="assets/transfer_list_example.png" download="이관목록표_작성예시.png">이미지 저장</a>
        <button type="button" data-act="modal-close">닫기</button>`
    });
    const scroll = $('#imgScroll');
    if (scroll) { scroll.scrollTop = 0; scroll.scrollLeft = 0; }
  }

  function toggleExampleZoom() {
    const scroll = $('#imgScroll');
    const btn = $('#zoomBtn');
    if (!scroll) return;
    const on = scroll.classList.toggle('zoomed');
    btn.textContent = on ? '전체 보기' : '조금 크게';
    if (!on) { scroll.scrollLeft = 0; scroll.scrollTop = 0; }
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fall through */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  function tagLabel(tag) {
    if (!tag || tag === '확인') return '';
    if (tag === '자체') return '자체서식';
    const m = /^별지\s*제?([0-9-]+)호?$/.exec(tag);
    if (m) return `별지 제${m[1]}호`;
    return tag;
  }

  function summarySection(title, items) {
    if (!items || !items.length) return '';
    const rows = items.map((d) => {
      const t = tagLabel(d.tag);
      return `□ ${d.name}${t ? ` (${t})` : ''}`;
    });
    return `[${title}]\n${rows.join('\n')}`;
  }

  function buildSummaryText() {
    const plan = buildPlan(state);
    const p = plan.period;
    const doneCount = plan.checklist.filter((c) => state.done[c.id]).length;
    const records = (state.situation === 'transfer' || state.situation === 'lost')
      ? plan.records.map((d) => ({ name: d.name, tag: '' }))
      : [];

    const head = [
      '📋 장기요양기관 휴·폐업 준비 요약',
      '────────────────',
      `· 구분: ${plan.businessLabel}`,
      `· 처리유형: ${plan.situationLabel}${plan.operationLabel ? ` (${plan.operationLabel})` : ''}`,
      `· 방문자: ${plan.visitorLabel}${plan.entityLabel ? ` · ${plan.entityLabel}` : ''}`,
      `· 이관자료 기간: ${state.situation === 'none' ? '해당 없음 (급여제공이력 없음)' : (p ? `${ymLabel(p.startY, p.startM)} ~ ${ymLabel(p.endY, p.endM)} (61개월분)` : '미정')}`,
      `· 급여종류: ${state.services.length ? state.services.join(', ') : '미선택'}`,
      `· 준비 체크: ${doneCount} / ${plan.checklist.length} 완료`,
      '[진행 순서]',
      '1. 공단 접수 → 2. 접수증 수령 → 3. 시·군·구 신고'
    ].join('\n');

    return [
      head,
      summarySection('공통 서류', plan.common),
      summarySection(`상황별 서류 · ${plan.situationLabel}`, plan.situation.items),
      summarySection('신청인 확인서류', plan.applicant.items),
      summarySection('이관대상 자료', records),
      summarySection('급여종류별 공통서류 · 편철 시', plan.serviceDocs),
      `[이관 제외]\n- ${plan.excluded.name}`,
      '※ 최종 제출 전 관할 지사 기준을 다시 확인하세요.'
    ].filter(Boolean).join('\n\n');
  }

  /* ---------------- wizard flow ---------------- */
  function goStep(step) {
    state.step = Math.min(4, Math.max(1, step));
    save();
    const hero = $('#hero');
    if (hero) hero.classList.toggle('hidden', state.step > 1);
    renderWizard();
    const wiz = $('#wizardView .wizard');
    if (wiz) wiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showResult() {
    state.view = 'result';
    save();
    $('#wizardView').innerHTML = '';
    $('#wizardView').hidden = true;
    $('#resultView').hidden = false;
    renderResult();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showWizard() {
    state.view = 'wizard';
    save();
    $('#resultView').innerHTML = '';
    $('#resultView').hidden = true;
    $('#wizardView').hidden = false;
    $('#hero').classList.remove('hidden');
    if (state.step > 1) $('#hero').classList.add('hidden');
    renderWizard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function restart() {
    state.business = null;
    state.situation = null;
    state.operation = null;
    state.visitor = null;
    state.entity = null;
    state.services = [];
    state.step = 1;
    state.view = 'wizard';
    state.done = {};
    save();
    showWizard();
    toast('진단을 처음부터 다시 시작합니다.');
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { setTab(tab.dataset.tab); return; }

    const el = e.target.closest('[data-act]');
    if (!el) {
      if (e.target.id === 'modal') closeModal();
      return;
    }
    const act = el.dataset.act;
    switch (act) {
      case 'pick': {
        const key = el.dataset.key;
        state[key] = el.dataset.value;
        if (key === 'business') {
          // nothing extra
        }
        if (key === 'situation') {
          if (state.situation !== 'transfer') state.operation = null;
        }
        save();
        renderWizard();
        break;
      }
      case 'wiz-next': {
        if (!isStepValid(state.step)) return;
        if (state.step === 4) showResult();
        else goStep(state.step + 1);
        break;
      }
      case 'wiz-prev': goStep(state.step - 1); break;
      case 'toggle-service': {
        const v = el.dataset.value;
        state.services = state.services.includes(v) ? state.services.filter((x) => x !== v) : [...state.services, v];
        save();
        renderWizard();
        break;
      }
      case 'restart': restart(); break;
      case 'edit-answers': {
        state.view = 'wizard';
        state.step = 1;
        save();
        showWizard();
        break;
      }
      case 'copy': {
        const text = buildSummaryText();
        copyText(text).then((ok) => toast(ok ? '준비물 요약을 복사했습니다. 메모·카톡에 붙여넣으세요.' : '복사에 실패했습니다. 화면의 서류 목록을 확인해 주세요.'));
        break;
      }
      case 'pdf': openPdf(el.dataset.pdf); break;
      case 'download': downloadPdf(el.dataset.pdf); break;
      case 'modal-close': closeModal(); break;
      case 'example-open': openExample(); break;
      case 'example-zoom': toggleExampleZoom(); break;
      case 'faq-cat': state.faqCat = el.dataset.value; save(); renderFaq(); break;
      case 'toggle-year': {
        const y = Number(el.dataset.value);
        state.years = state.years.includes(y) ? state.years.filter((x) => x !== y) : [...state.years, y].sort((a, b) => a - b);
        save(); renderYearChips(); break;
      }
      case 'toggle-bind-service': {
        const v = el.dataset.value;
        state.bindServices = state.bindServices.includes(v) ? state.bindServices.filter((x) => x !== v) : [...state.bindServices, v];
        save(); renderServiceChips(); break;
      }
      case 'years-clear': state.years = []; save(); renderYearChips(); break;
      case 'services-clear': state.bindServices = []; save(); renderServiceChips(); break;
      case 'binding-make': renderBindingResult(); break;
      case 'year-jump': {
        const target = document.getElementById('binding-year-' + el.dataset.value);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
      case 'final-reset': {
        state.final = {};
        save();
        renderFinal();
        toast('최종 점검 체크를 초기화했습니다.');
        break;
      }
      default: break;
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'endMonth') {
      state.endMonth = t.value || curYm();
      save();
      if (state.view === 'wizard') renderWizard();
      else renderResult();
      return;
    }
    if (t.id === 'calcMonth') {
      state.calcMonth = t.value || curYm();
      save();
      renderCalc();
      return;
    }
    if (t.dataset && t.dataset.chk === 'done') {
      const id = t.dataset.id;
      if (t.checked) state.done[id] = true; else delete state.done[id];
      save();
      const label = t.closest('.check-item');
      if (label) label.classList.toggle('on', t.checked);
      refreshResultProgress();
      return;
    }
    if (t.dataset && t.dataset.chk === 'final') {
      const id = t.dataset.id;
      if (t.checked) state.final[id] = true; else delete state.final[id];
      save();
      const label = t.closest('.check-item');
      if (label) label.classList.toggle('on', t.checked);
      renderFinalProgressOnly();
      return;
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'sheetsInput') {
      state.sheets = t.value;
      save();
      renderSheets();
      return;
    }
    if (t.id === 'faqSearch') {
      renderFaq();
      return;
    }
  });

  function renderFinalProgressOnly() {
    const total = FINAL_CHECKS.length;
    const done = FINAL_CHECKS.filter((c) => state.final[c.id]).length;
    const pct = Math.round((done / total) * 100);
    $('#finalPct').textContent = pct + '%';
    $('#finalBar').style.width = pct + '%';
    $('#finalCount').textContent = `${done} / ${total} 항목`;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#modal').classList.contains('open')) closeModal();
  });

  $('#fontBtn').addEventListener('click', () => {
    state.fontLarge = !state.fontLarge;
    save();
    applyFont();
    toast(state.fontLarge ? '큰 글씨를 적용했습니다.' : '기본 글씨 크기로 돌아왔습니다.');
  });

  /* ---------------- init ---------------- */
  function init() {
    applyFont();
    renderForms();
    renderYearChips();
    renderServiceChips();
    renderAnnexLinks();
    $('#calcMonth').value = state.calcMonth;
    $('#sheetsInput').value = state.sheets || '';
    renderCalc();
    renderSheets();
    renderFaq();
    renderFinal();
    setTab(state.tab || 'diagnose', { keepScroll: true });

    if (state.view === 'result' && state.business && state.situation) {
      $('#wizardView').hidden = true;
      $('#resultView').hidden = false;
      renderResult();
    } else {
      state.view = 'wizard';
      $('#wizardView').hidden = false;
      $('#resultView').hidden = true;
      renderWizard();
      if (state.step === 1) $('#hero').classList.remove('hidden');
      else $('#hero').classList.add('hidden');
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  init();
})();
