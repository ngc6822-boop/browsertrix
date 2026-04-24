(async () => {

  // 1. 팝업 강제 닫기
  document.querySelectorAll('.popUpWrap_01').forEach(pop => {
    pop.style.display = 'none';
  });

  // 2. GSAP 애니메이션 즉시 완료 (숨겨진 콘텐츠 표시)
  if (window.gsap) {
    gsap.globalTimeline.progress(1);
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(st => st.kill());
  }
  document.querySelectorAll('[style*="visibility: hidden"], [style*="opacity: 0"]').forEach(el => {
    el.style.visibility = 'visible';
    el.style.opacity = '1';
  });

  // 3. Swiper 슬라이드 전체 visible 처리
  document.querySelectorAll('.swiper-slide').forEach(slide => {
    slide.style.visibility = 'visible';
    slide.style.opacity = '1';
  });

  // 4. pf_DetailMove: onclick에서 URL 추출 → href로 변환
  //    크롤러가 a[href] 링크로 인식해서 수집
  document.querySelectorAll("a[onclick*='pf_DetailMove']").forEach(a => {
    const match = a.getAttribute('onclick').match(/pf_DetailMove\(['"]?(.+?)['"]?\)/);
    if (match) {
      a.href = '/gb/Board/' + match[1] + '/detailView.do';
      a.removeAttribute('onclick');
    }
  });

  // 5. pf_LinkPage: pagination onclick 제거 → href GET 방식 활성화
  document.querySelectorAll(".com-brd-pagination a[href*='pageIndex']").forEach(a => {
    a.removeAttribute('onclick');
  });

  // 6. GNB/SNB/팝업메뉴: pf_moveMenu onclick에서 URL 추출 → href로 변환
  //    클릭 이벤트 발생 없이 크롤러가 링크로 인식하도록 처리
  document.querySelectorAll(
    '#gnb a.dep2, #gnb a.dep1, #popup-menu a.dep1, #popup-menu a.dep2, #snb a.dep-01, #snb a.dep-02'
  ).forEach(a => {
    const onclick = a.getAttribute('onclick') || '';
    const match = onclick.match(/pf_moveMenu\(['"](.+?)['"],\s*['"].+?['"]\)/);
    if (match) {
      a.href = match[1];
      a.removeAttribute('onclick');
    }
  });

  // 7. dep2-list 강제 표시 (hover 없이 크롤러가 링크 인식)
  document.querySelectorAll('#gnb .dep2-list, #popup-menu .dep2-list').forEach(el => {
    el.style.display = 'block';
    el.style.visibility = 'visible';
  });

  // 8. 재단소개 탭 URL DOM에 추가 (크롤러가 링크로 수집)
  [
    '/gb/foundation/organization.do?tab=1',
    '/gb/foundation/organization.do?tab=2',
    '/gb/foundation/organization.do?tab=3',
    '/gb/foundation/organization.do?tab=4',
  ].forEach(url => {
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
  });

  // 9. 공지사항 탭 전환 (JS show/hide, 페이지 이동 없음)
  document.querySelectorAll('#main .main-brd-box .brd-tabs li').forEach(tab => {
    tab.click();
  });

})();
