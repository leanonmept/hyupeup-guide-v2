/* =========================================================
   장기요양기관 휴·폐업 도우미 — White Minimal Real-Time Dashboard
   - 3탭: 실시간 대시보드 / 서식·예시 / 질문·점검
   - 선택 즉시 서류·기간·권수가 갱신되는 반응형 대시보드
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
  const MONTH_NATIVE = (() => {
    try { const i = document.createElement('input'); i.type = 'month'; return i.type === 'month'; } catch (e) { return false; }
  })();

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

  /* ---------------- state ---------------- */
  const TABS = ['dashboard', 'forms', 'qa'];
  const BUSINESSES = ['pause', 'close'];
  const SITUATIONS = ['transfer', 'lost', 'none'];
  const VISITS = ['rep', 'agent_ind', 'agent_corp'];

  function defaultState() {
    return {
      tab: 'dashboard',
      business: null,
      situation: null,
      operation: null,
      visit: null,
      services: [],
      done: {},
      final: {},
      endMonth: curYm(),
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

  // 이전 4단계 버전 저장값 이관 (visitor/entity → visit)
  if (!state.visit) {
    state.visit = state.visitor === 'rep'
      ? 'rep'
      : (state.visitor === 'agent' ? (state.entity === 'corporate' ? 'agent_corp' : 'agent_ind') : null);
  }
  // normalize
  if (!TABS.includes(state.tab)) state.tab = 'dashboard';
  if (!BUSINESSES.includes(state.business)) state.business = null;
  if (!SITUATIONS.includes(state.situation)) state.situation = null;
  if (state.situation !== 'transfer' || !['active', 'none'].includes(state.operation)) state.operation = null;
  if (!VISITS.includes(state.visit)) state.visit = null;
  if (!Array.isArray(state.services)) state.services = [];
  state.services = state.services.filter((s) => SERVICE_NAMES.includes(s));
  if (!state.done || typeof state.done !== 'object') state.done = {};
  if (!state.final || typeof state.final !== 'object') state.final = {};
  if (!/^\d{4}-\d{2}$/.test(state.endMonth || '')) state.endMonth = curYm();
  if (typeof state.sheets !== 'string') state.sheets = state.sheets ? String(state.sheets) : '';
  if (!FAQ_CATS.includes(state.faqCat)) state.faqCat = '전체';
  state.fontLarge = !!state.fontLarge;
  delete state.view;
  delete state.step;
  delete state.visitor;
  delete state.entity;
  delete state.years;
  delete state.bindServices;
  delete state.calcMonth;

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
  };

  /* ---------------- derived ---------------- */
  const visitorValue = () => (state.visit === 'rep' ? 'rep' : (state.visit ? 'agent' : null));
  const entityValue = () => (state.visit === 'agent_corp' ? 'corporate' : (state.visit ? 'individual' : null));
  const planNow = () => buildPlan({ ...state, visitor: visitorValue(), entity: entityValue() });

  const VISIT_LABEL = { rep: '대표자', agent_ind: '대리인(개인)', agent_corp: '대리인(법인)' };
  const VISIT_FULL = { rep: '대표자 직접 방문', agent_ind: '대리인 방문 · 개인기관', agent_corp: '대리인 방문 · 법인기관' };

  const monthTitle = () => {
    const [y, m] = String(state.endMonth || curYm()).split('-').map(Number);
    return `${y}년 ${m}월`;
  };

  /* ---------------- dashboard model ---------------- */
  function dashboardModel() {
    const plan = planNow();
    const groups = [];

    groups.push({
      key: 'common',
      title: '공통 서류',
      note: '',
      items: plan.common.map((d) => ({ ...d }))
    });

    if (plan.situation.items.length) {
      groups.push({
        key: 'situation',
        title: `상황별 서류 · ${plan.situationLabel}`,
        note: plan.situation.note,
        items: plan.situation.items.map((d) => ({ ...d }))
      });
    }

    if (plan.applicant.items.length) {
      groups.push({
        key: 'applicant',
        title: `신청인 확인서류 · ${VISIT_LABEL[state.visit] || ''}`,
        note: plan.applicant.note,
        items: plan.applicant.items.map((d) => ({ ...d }))
      });
    }

    if (state.situation === 'transfer' || state.situation === 'lost') {
      groups.push({
        key: 'records',
        title: '이관대상 자료',
        note: '수급자별 자료를 ①~④ 순서로 구분하고 매수를 확인하세요.',
        items: plan.records.map((d) => ({ ...d }))
      });
    }

    if (plan.serviceDocs.length) {
      groups.push({
        key: 'service',
        title: '급여종류별 공통서류 · 편철 시',
        note: '',
        items: plan.serviceDocs.map((d) => ({
          id: 'svc-' + d.tag + '-' + d.name,
          tag: d.tag,
          name: d.name,
          sub: d.tag === '자체' ? '기관 자체서식으로 편철' : '연도별 공통서류로 편철',
          pdf: d.pdf
        }))
      });
    }

    const items = groups.flatMap((g) => g.items);
    return { plan, groups, items };
  }

  /* ---------------- render helpers ---------------- */
  function docItem(d) {
    const done = !!state.done[d.id];
    const tag = tagLabel(d.tag);
    return `
      <div class="doc-item ${done ? 'on' : ''}" data-doc="${esc(d.id)}">
        <label class="doc-check" aria-label="${esc(d.name)} 준비 완료">
          <input type="checkbox" data-chk="done" data-id="${esc(d.id)}" ${done ? 'checked' : ''} />
          <span class="box"></span>
        </label>
        <div class="doc-body">
          ${tag ? `<span class="doc-tag">${esc(tag)}</span>` : ''}
          <strong>${esc(d.name)}</strong>
          ${d.sub ? `<small>${esc(d.sub)}</small>` : ''}
        </div>
        ${d.pdf ? `<div class="doc-actions">
          <button type="button" class="pill" data-act="pdf" data-pdf="${d.pdf}">미리보기</button>
          <button type="button" class="pill dark" data-act="download" data-pdf="${d.pdf}">PDF</button>
        </div>` : ''}
      </div>`;
  }

  function renderControls() {
    const seg = (key, value, text, opts = {}) => `
      <button type="button" class="seg-btn ${opts.on ? 'on' : ''} ${opts.dim ? 'dim' : ''}"
        data-act="set" data-key="${key}" data-value="${value}"
        aria-pressed="${opts.on ? 'true' : 'false'}" ${opts.dim ? 'disabled' : ''}>${text}</button>`;

    const opOn = state.situation === 'transfer';
    let opNote = '';
    if (state.situation === 'none') opNote = '<b>이력 없음</b>은 급여 상태를 선택하지 않습니다.';
    else if (state.situation === 'lost') opNote = '전건 분실은 급여 상태 없이 진행합니다.';
    else if (state.situation !== 'transfer') opNote = '자료유형을 먼저 선택하면 급여 상태를 고를 수 있습니다.';

    return `
      <section class="card ctl-card" aria-label="진단 선택">
        <div class="ctl-row">
          <span class="ctl-label">업무</span>
          <div class="seg">
            ${seg('business', 'pause', '휴업', { on: state.business === 'pause' })}
            ${seg('business', 'close', '폐업', { on: state.business === 'close' })}
          </div>
          ${state.business === 'pause' ? `
          <details class="inline-note">
            <summary>휴업은 자체보관 신청·허가가 필요합니다</summary>
            <div class="note-body">휴업기관은 <b>휴업 예정일 전에 자체보관을 신청</b>하고 공단의 허가를 받은 경우 자체보관이 가능합니다. 신청서에 <b>보관기간·보관장소·보관책임자</b>를 함께 기재하세요.</div>
          </details>` : ''}
        </div>

        <div class="ctl-row">
          <span class="ctl-label">자료</span>
          <div class="seg">
            ${seg('situation', 'transfer', '자료이관', { on: state.situation === 'transfer' })}
            ${seg('situation', 'lost', '전건 분실', { on: state.situation === 'lost' })}
            ${seg('situation', 'none', '이력 없음', { on: state.situation === 'none' })}
          </div>
        </div>

        <div class="ctl-row">
          <span class="ctl-label">급여</span>
          <div class="seg">
            ${seg('operation', 'active', '제공 중(일부이관)', { on: state.operation === 'active', dim: !opOn })}
            ${seg('operation', 'none', '없음(이관완료)', { on: state.operation === 'none', dim: !opOn })}
          </div>
          ${opNote ? `<p class="ctl-note">${opNote}</p>` : ''}
        </div>

        <div class="ctl-row">
          <span class="ctl-label">방문</span>
          <div class="seg">
            ${seg('visit', 'rep', '대표자', { on: state.visit === 'rep' })}
            ${seg('visit', 'agent_ind', '대리인(개인)', { on: state.visit === 'agent_ind' })}
            ${seg('visit', 'agent_corp', '대리인(법인)', { on: state.visit === 'agent_corp' })}
          </div>
          ${state.visit === 'rep' ? '<p class="ctl-note">법인기관 대표자는 법인 관련 확인서류를 관할 지사에 확인하세요.</p>' : ''}
        </div>

        <div class="ctl-row">
          <span class="ctl-label">예정월</span>
          <div class="month-wrap">
            ${MONTH_NATIVE ? `<input type="month" id="endMonth" class="month-input" lang="ko-KR" value="${esc(state.endMonth)}" min="2015-01" max="2035-12" aria-label="휴·폐업 예정월" />` : `
              <div class="month-fallback">
                <select id="endY" class="month-select" aria-label="예정 연도">
                  ${Array.from({ length: 21 }, (_, i) => 2015 + i).map((y) => `<option value="${y}" ${Number(state.endMonth.slice(0, 4)) === y ? 'selected' : ''}>${y}년</option>`).join('')}
                </select>
                <select id="endM" class="month-select" aria-label="예정 월">
                  ${Array.from({ length: 12 }, (_, i) => i + 1).map((m) => `<option value="${m}" ${Number(state.endMonth.slice(5, 7)) === m ? 'selected' : ''}>${m}월</option>`).join('')}
                </select>
              </div>`}
            <span class="month-cap">${monthTitle()}</span>
          </div>
        </div>

        <div class="ctl-block">
          <div class="ctl-block-head"><span>급여종류</span><small>복수 선택 · 편철 서류에 반영</small></div>
          <div class="chips">
            ${SERVICE_NAMES.map((name) => `
              <button type="button" class="chip ${state.services.includes(name) ? 'on' : ''}"
                data-act="toggle-service" data-value="${esc(name)}" aria-pressed="${state.services.includes(name)}">
                <span class="tick">✓</span>${esc(name)}
              </button>`).join('')}
          </div>
        </div>
      </section>`;
  }

  function renderSummary(plan, items) {
    const period = calcPeriod(state.endMonth, 61);
    const none = state.situation === 'none';
    const range = none
      ? '이관할 자료 없음'
      : (period ? `${ymLabel(period.startY, period.startM)} ~ ${ymLabel(period.endY, period.endM)}` : '예정월 미정');
    const count = items.length;
    const hint = !state.business
      ? '<b>업무</b>를 선택하면 진행 순서가 확정됩니다.'
      : (none ? '급여제공이력이 없으면 확인서 1건만 준비합니다.' : `휴·폐업 예정월 ${monthTitle()}을 포함한 61개월분입니다.`);

    return `
      <section class="card summary-card" id="summaryCard" aria-label="요약">
        <div class="flow" role="list">
          <span class="flow-step" role="listitem"><b>1</b>공단접수</span>
          <span class="flow-arrow">→</span>
          <span class="flow-step" role="listitem"><b>2</b>접수증</span>
          <span class="flow-arrow">→</span>
          <span class="flow-step" role="listitem"><b>3</b>시·군·구</span>
        </div>
        <div class="sum-range">
          <small>61개월 범위</small>
          <strong>${range}</strong>
          ${none ? '' : '<em>61개월</em>'}
        </div>
        <div class="sum-meta">
          <div class="sum-cell"><small>필요 서류</small><strong>${count}건</strong></div>
          <button type="button" class="copy-btn" data-act="copy">📋 요약 복사</button>
        </div>
        <p class="sum-hint">${hint}</p>
      </section>`;
  }

  function renderDocs(plan, groups, items) {
    const total = items.length;
    const done = items.filter((i) => state.done[i.id]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const body = groups.map((g) => `
      <div class="doc-group">
        <div class="group-title"><h4>${esc(g.title)}</h4><span>${g.items.length}건</span></div>
        ${g.note ? `<p class="hint">${g.note}</p>` : ''}
        ${g.items.map(docItem).join('')}
      </div>`).join('');

    const placeholders = [];
    if (!state.situation) placeholders.push('자료유형(자료이관·전건 분실·이력 없음)을 선택하면 상황별 서류가 표시됩니다.');
    if (!state.visit) placeholders.push('방문자를 선택하면 신분증·위임장 등 확인서류가 표시됩니다.');
    if (!state.services.length) placeholders.push('급여종류를 선택하면 편철 공통서류가 표시됩니다.');

    return `
      <section class="card" id="docsCard" aria-label="준비 서류">
        <div class="card-head">
          <div><span class="eyebrow">맞춤 서류</span><h3>준비 체크리스트</h3></div>
          <span class="tag-inline">${total}건</span>
        </div>
        <div class="progress-box">
          <div class="progress-top"><span>준비 진행률</span><strong id="docPct">${pct}%</strong></div>
          <div class="track"><i id="docBar" style="width:${pct}%"></i></div>
          <small id="docDone">${done} / ${total} 완료</small>
        </div>
        ${body}
        ${placeholders.length ? `<p class="hint">${placeholders.join('<br>')}</p>` : ''}
        <div class="exclude">
          <span>이관 제외</span>
          <strong>${esc(plan.excluded.name)}</strong>
          <small>${esc(plan.excluded.note)}</small>
        </div>
      </section>`;
  }

  function renderCalc(plan) {
    const period = calcPeriod(state.endMonth, 61);
    const none = state.situation === 'none';
    const range = none || !period
      ? '이관할 자료 없음'
      : `${ymLabel(period.startY, period.startM)} ~ ${ymLabel(period.endY, period.endM)}`;

    const bars = none || !period ? '' : period.years.map((b) => `
      <div class="yearbar">
        <b>${b.year}년</b>
        <span class="track"><i style="width:${Math.round((b.count / 12) * 100)}%"></i></span>
        <em>${b.count}개월</em>
      </div>`).join('');

    return `
      <section class="card" id="calcCard" aria-label="편철 계산">
        <div class="card-head">
          <div><span class="eyebrow">편철 계산</span><h3>61개월 기간과 예상 권수</h3></div>
        </div>
        <div class="period-line">
          <strong>${range}</strong>
          ${none ? '' : '<span class="period-badge"><b>61</b><small>개월</small></span>'}
        </div>
        ${bars ? `<div class="yearbars">${bars}</div>` : `<p class="hint">${none ? '급여제공이력이 없으면 이관 매수 계산이 필요하지 않습니다.' : '예정월을 선택하세요.'}</p>`}
        <label class="field" for="sheetsInput">
          <span>이관 매수</span>
          <input type="number" id="sheetsInput" class="num-input" min="1" step="1" inputmode="numeric"
            placeholder="예: 850" value="${esc(state.sheets)}" />
        </label>
        <div id="sheetsOut"></div>
        <ul class="rules">
          <li><b>연도 변경</b><span>해가 바뀌면 새 권으로 시작합니다.</span></li>
          <li><b>약 300매</b><span>한 권은 약 300매를 기준으로 나눕니다.</span></li>
          <li><b>수급자 자료</b><span>한 수급자의 자료를 중간에 끊지 않습니다.</span></li>
          <li><b>매수 기입</b><span>각 자료 우측하단에 연필로 매수를 적습니다.</span></li>
        </ul>
        <div class="annex-links">
          ${ANNEX_FORMS.map((f) => `<button type="button" class="pill" data-act="pdf" data-pdf="${f.pdf}">${esc(PDFS[f.pdf].meta.match(/별지 제([0-9-]+)호/)?.[1] ? '별지 ' + PDFS[f.pdf].meta.match(/별지 제([0-9-]+)호/)[1] : f.title)}</button>`).join('')}
        </div>
      </section>`;
  }

  function renderDashboard() {
    const { plan, groups, items } = dashboardModel();
    window.__hyupeupModel = { plan, groups, items };
    $('#dashView').innerHTML = `
      <div class="dash-head">
        <span class="eyebrow">실시간 대시보드</span>
        <h2>선택하면 바로 정리됩니다</h2>
        <p>업무·자료·방문 조건을 고르면 서류와 기간이 즉시 갱신됩니다.</p>
      </div>
      ${renderControls()}
      ${renderSummary(plan, items)}
      ${renderDocs(plan, groups, items)}
      ${renderCalc(plan)}
    `;
    renderSheets();
  }

  function renderProgress() {
    const model = window.__hyupeupModel;
    if (!model) return;
    const total = model.items.length;
    const done = model.items.filter((i) => state.done[i.id]).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const pctEl = $('#docPct');
    const barEl = $('#docBar');
    const doneEl = $('#docDone');
    if (pctEl) pctEl.textContent = pct + '%';
    if (barEl) barEl.style.width = pct + '%';
    if (doneEl) doneEl.textContent = `${done} / ${total} 완료`;
  }

  function renderSheets() {
    const out = $('#sheetsOut');
    if (!out) return;
    const n = Number(state.sheets);
    if (!state.sheets || !Number.isFinite(n) || n <= 0) {
      out.innerHTML = '<p class="out-note">이관할 전체 매수를 입력하면 약 300매 기준 예상 권수를 계산합니다.</p>';
      return;
    }
    const total = Math.round(n);
    const vols = Math.ceil(total / 300);
    const last = total - (vols - 1) * 300;
    out.innerHTML = `
      <div class="kpi-row">
        <div class="kpi"><span>이관 매수</span><strong>${total.toLocaleString()}매</strong></div>
        <div class="kpi dark"><span>예상 권수 (300매 1권)</span><strong>${vols}권</strong></div>
      </div>
      <p class="out-note">마지막 권은 <b>${last}매</b>입니다. 연도가 바뀌면 새 권으로 시작하므로 실제 권수는 달라질 수 있습니다.</p>`;
  }

  /* ---------------- render: forms ---------------- */
  function fileRow(item) {
    const pdf = PDFS[item.pdf];
    return `
      <div class="file-row">
        <span class="file-num ${item.tone || ''}">${esc(item.num).replace(/\n/g, '<br>')}</span>
        <div class="file-body">
          <strong>${esc(item.title)}</strong>
          <small>${esc(item.sub)}</small>
          <small style="margin-top:2px;color:#9CA3AF">${esc(pdf.meta)}</small>
          <div class="file-actions">
            <button type="button" data-act="pdf" data-pdf="${item.pdf}">
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

  /* ---------------- render: FAQ ---------------- */
  function renderFaq() {
    $('#faqCats').innerHTML = FAQ_CATS.map((c) => `
      <button type="button" class="chip ${state.faqCat === c ? 'on' : ''}" data-act="faq-cat" data-value="${esc(c)}" aria-pressed="${state.faqCat === c}">${esc(c)}</button>`).join('');

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
        <span class="box"></span>
        <span>${esc(c.text)}</span>
      </label>`).join('');
  }

  /* ---------------- tabs / font ---------------- */
  function setTab(name, opts = {}) {
    if (!TABS.includes(name)) return;
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
    // 서식(이미지) 문서를 유지한 채 모달만 닫습니다.
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

  function buildSummaryText(plan, items) {
    const p = plan.period;
    const none = state.situation === 'none';
    const doneCount = items.filter((c) => state.done[c.id]).length;
    const records = (state.situation === 'transfer' || state.situation === 'lost')
      ? plan.records.map((d) => ({ name: d.name, tag: d.tag }))
      : [];

    const head = [
      '📋 장기요양기관 휴·폐업 준비 요약',
      '────────────────',
      `· 업무: ${state.business ? plan.businessLabel : '미선택'}`,
      `· 처리유형: ${state.situation ? plan.situationLabel : '미선택'}${plan.operationLabel ? ` (${plan.operationLabel})` : ''}`,
      `· 방문자: ${state.visit ? VISIT_FULL[state.visit] : '미선택'}`,
      `· 이관자료 기간: ${none ? '해당 없음 (급여제공이력 없음)' : (p ? `${ymLabel(p.startY, p.startM)} ~ ${ymLabel(p.endY, p.endM)} (61개월분)` : '미정')}`,
      `· 급여종류: ${state.services.length ? state.services.join(', ') : '미선택'}`,
      `· 준비 체크: ${doneCount} / ${items.length} 완료`,
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

  function resetAll() {
    state.business = null;
    state.situation = null;
    state.operation = null;
    state.visit = null;
    state.services = [];
    state.done = {};
    save();
    renderDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('선택과 체크를 초기화했습니다.');
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
      case 'set': {
        const key = el.dataset.key;
        const value = el.dataset.value;
        if (key === 'business') state.business = value;
        if (key === 'situation') {
          state.situation = value;
          if (value !== 'transfer') state.operation = null;
        }
        if (key === 'operation') {
          if (state.situation === 'transfer') state.operation = value;
        }
        if (key === 'visit') state.visit = value;
        save();
        renderDashboard();
        break;
      }
      case 'toggle-service': {
        const v = el.dataset.value;
        state.services = state.services.includes(v)
          ? state.services.filter((x) => x !== v)
          : [...state.services, v];
        save();
        renderDashboard();
        break;
      }
      case 'copy': {
        const { plan, items } = window.__hyupeupModel || dashboardModel();
        copyText(buildSummaryText(plan, items)).then((ok) => toast(ok
          ? '준비물 요약을 복사했습니다. 메모·카톡에 붙여넣으세요.'
          : '복사에 실패했습니다. 화면의 서류 목록을 확인해 주세요.'));
        break;
      }
      case 'pdf': openPdf(el.dataset.pdf); break;
      case 'download': downloadPdf(el.dataset.pdf); break;
      case 'modal-close': closeModal(); break;
      case 'example-open': openExample(); break;
      case 'example-zoom': toggleExampleZoom(); break;
      case 'faq-cat': state.faqCat = el.dataset.value; save(); renderFaq(); break;
      case 'final-reset': {
        state.final = {};
        save();
        renderFinal();
        toast('최종 점검 체크를 초기화했습니다.');
        break;
      }
      case 'reset': resetAll(); break;
      default: break;
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'endMonth') {
      state.endMonth = t.value || curYm();
      save();
      renderDashboard();
      return;
    }
    if (t.id === 'endY' || t.id === 'endM') {
      const y = Number(($('#endY') || {}).value) || THIS_YEAR;
      const m = Number(($('#endM') || {}).value) || THIS_MONTH;
      state.endMonth = `${y}-${pad(m)}`;
      save();
      renderDashboard();
      return;
    }
    if (t.dataset && t.dataset.chk === 'done') {
      const id = t.dataset.id;
      if (t.checked) state.done[id] = true; else delete state.done[id];
      save();
      const row = t.closest('.doc-item');
      if (row) row.classList.toggle('on', t.checked);
      renderProgress();
      return;
    }
    if (t.dataset && t.dataset.chk === 'final') {
      const id = t.dataset.id;
      if (t.checked) state.final[id] = true; else delete state.final[id];
      save();
      const label = t.closest('.check-item');
      if (label) label.classList.toggle('on', t.checked);
      const total = FINAL_CHECKS.length;
      const done = FINAL_CHECKS.filter((c) => state.final[c.id]).length;
      const pct = Math.round((done / total) * 100);
      $('#finalPct').textContent = pct + '%';
      $('#finalBar').style.width = pct + '%';
      $('#finalCount').textContent = `${done} / ${total} 항목`;
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
    renderFaq();
    renderFinal();
    renderDashboard();
    setTab(state.tab || 'dashboard', { keepScroll: true });

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  init();
})();
