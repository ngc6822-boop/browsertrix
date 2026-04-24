/**
 * gwangjubiennale.org 웹아카이빙 Custom Behavior
 * 대상: https://gwangjubiennale.org/gb/index.do
 * 
 * 주요 처리 항목:
 * 1. 팝업 자동 닫기
 * 2. GSAP ScrollTrigger 애니메이션 즉시 완료
 * 3. pf_moveMenu SC_QXCFB AJAX 문제 해결 (직접 이동으로 오버라이드)
 * 4. pf_DetailMove POST Form → GET href 변환
 * 5. pf_LinkPage pagination onclick 제거
 * 6. Swiper 슬라이드 전체 visible 처리
 * 7. GNB/SNB 메뉴 클릭 순회
 * 8. 공지사항 탭 클릭
 */

(async () => {

  // ─────────────────────────────────────────────
  // 1. 팝업 강제 닫기
  // ─────────────────────────────────────────────
  document.querySelectorAll('.popUpWrap_01').forEach(pop => {
    pop.style.display = 'none';
  });

  // ─────────────────────────────────────────────
  // 2. GSAP ScrollTrigger 애니메이션 즉시 완료
  //    (autoAlpha:0 상태로 숨겨진 콘텐츠 강제 표시)
  // ─────────────────────────────────────────────
  if (window.gsap) {
    gsap.globalTimeline.progress(1);
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach(st => st.kill());
    }
  }
  // GSAP 숨김 처리된 요소 강제 표시
  document.querySelectorAll('[style*="visibility: hidden"], [style*="opacity: 0"]').forEach(el => {
    el.style.visibility = 'visible';
    el.style.opacity = '1';
  });

  // ─────────────────────────────────────────────
  // 3. pf_moveMenu 오버라이드
  //    SC_QXCFB: AJAX 대신 직접 URL 이동
  //    SC_HFAIU: 외부 window.open 차단 (크롤 범위 외)
  // ─────────────────────────────────────────────
  if (typeof window.pf_moveMenu === 'function') {
    const _originalPfMoveMenu = window.pf_moveMenu;
    window.pf_moveMenu = function(URL, PAGEDIV) {
      if (PAGEDIV === 'SC_QXCFB') {
        // AJAX 응답 대기 없이 직접 이동
        location.href = URL;
      } else if (PAGEDIV === 'SC_HFAIU') {
        // 외부 링크 새창 열기 차단 (크롤러는 href 링크로 수집)
        return;
      } else {
        // SC_TFOVO, SC_EANHU, SC_VUWAQ 등 직접 이동 (기존 동작 유지)
        _originalPfMoveMenu(URL, PAGEDIV);
      }
    };
  }

  // ─────────────────────────────────────────────
  // 4. pf_DetailMove: POST Form → GET href 변환
  //    게시판 링크 a[onclick*='pf_DetailMove'] 처리
  // ─────────────────────────────────────────────
  document.querySelectorAll("a[onclick*='pf_DetailMove']").forEach(a => {
    const match = a.getAttribute('onclick').match(/pf_DetailMove\(['"]?(.+?)['"]?\)/);
    if (match) {
      const keyno = match[1];
      a.href = '/gb/Board/' + keyno + '/detailView.do';
      a.removeAttribute('onclick');
    }
  });

  // ─────────────────────────────────────────────
  // 5. pf_LinkPage: 페이지네이션 onclick 제거
  //    href="?pageIndex=N" GET 방식 이동 활성화
  // ─────────────────────────────────────────────
  document.querySelectorAll(".com-brd-pagination a[href*='pageIndex']").forEach(a => {
    a.removeAttribute('onclick');
  });

  // ─────────────────────────────────────────────
  // 6. Swiper 슬라이드 전체 visible 처리
  // ─────────────────────────────────────────────
  document.querySelectorAll('.swiper-slide').forEach(slide => {
    slide.style.visibility = 'visible';
    slide.style.opacity = '1';
  });

  // ─────────────────────────────────────────────
  // 7. GNB dep2 메뉴 링크 순회 클릭 (URL 수집)
  //    hover 없이 dep2-list를 강제 표시 후 클릭
  // ─────────────────────────────────────────────
  const dep2Links = document.querySelectorAll('#gnb .dep2-list li a.dep2, #popup-menu .dep2');
  for (const link of dep2Links) {
    // dep2-list 부모를 강제 표시
    const dep2List = link.closest('.dep2-list');
    if (dep2List) dep2List.style.display = 'block';
    // href 속성이 있는 경우만 수집 (onclick pf_moveMenu는 오버라이드로 처리됨)
    link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
  }

  // ─────────────────────────────────────────────
  // 8. SNB 서브메뉴 링크 순회
  // ─────────────────────────────────────────────
  document.querySelectorAll('#snb a.dep-01, #snb a.dep-02').forEach(a => {
    a.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  // ─────────────────────────────────────────────
  // 9. 공지사항 탭 전환 클릭
  // ─────────────────────────────────────────────
  const brdTabs = document.querySelectorAll('#main .main-brd-box .brd-tabs li');
  for (const tab of brdTabs) {
    tab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 200));
  }

  // ─────────────────────────────────────────────
  // 10. 재단소개 탭 (tab=1~4) URL 링크 추가
  //     크롤러가 href 링크로 인식할 수 있도록 DOM에 삽입
  // ─────────────────────────────────────────────
  const tabUrls = [
    '/gb/foundation/organization.do?tab=1',
    '/gb/foundation/organization.do?tab=2',
    '/gb/foundation/organization.do?tab=3',
    '/gb/foundation/organization.do?tab=4',
  ];
  tabUrls.forEach(url => {
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
  });

})();
