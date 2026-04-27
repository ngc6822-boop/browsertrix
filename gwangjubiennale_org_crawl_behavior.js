class GwangjuBiennale {

  static id = "GwangjuBiennale";

  static isMatch() {
    return location.hostname === "gwangjubiennale.org";
  }

  static init() {
    return { state: {} };
  }

  async *run(ctx) {

    // ─────────────────────────────────────────────
    // 1. 팝업 강제 닫기
    // ─────────────────────────────────────────────
    document.querySelectorAll('.popUpWrap_01').forEach(pop => {
      pop.style.display = 'none';
    });

    // ─────────────────────────────────────────────
    // 2. pf_moveMenu 함수 오버라이드
    //    SC_QXCFB: POST AJAX → WARC 재연 시 실패하므로 직접 이동으로 우회
    //    SC_HFAIU: window.open() → 앵커 삽입으로 크롤러가 수집하도록 변경
    // ─────────────────────────────────────────────
    window.pf_moveMenu = function(URL, PAGEDIV) {
      if (PAGEDIV === 'SC_HFAIU') {
        const a = document.createElement('a');
        a.href = URL;
        a.target = '_blank';
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
      } else {
        location.href = URL;
      }
    };

    // ─────────────────────────────────────────────
    // 3. GSAP ScrollTrigger 애니메이션 즉시 완료
    //    (스크롤 없이도 모든 콘텐츠 표시)
    // ─────────────────────────────────────────────
    if (window.gsap) {
      gsap.globalTimeline.progress(1);
      if (window.ScrollTrigger) {
        ScrollTrigger.getAll().forEach(st => st.kill());
      }
    }
    document.querySelectorAll(
      '[style*="visibility: hidden"], [style*="opacity: 0"], [style*="visibility:hidden"], [style*="opacity:0"]'
    ).forEach(el => {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    });

    // ─────────────────────────────────────────────
    // 4. Swiper 슬라이드 전체 visible 처리
    // ─────────────────────────────────────────────
    document.querySelectorAll('.swiper-slide').forEach(slide => {
      slide.style.visibility = 'visible';
      slide.style.opacity = '1';
      slide.style.pointerEvents = 'auto';
    });

    // ─────────────────────────────────────────────
    // 5. GNB/SNB/팝업메뉴: onclick → href 변환
    //    ※ dep1(GNB)은 onclick 없이 hover 전용이므로 제외
    //    SC_HFAIU는 target="_blank" 설정
    // ─────────────────────────────────────────────
    document.querySelectorAll(
      '#gnb a.dep2, #popup-menu a.dep1, #popup-menu a.dep2, #snb a.dep-01, #snb a.dep-02'
    ).forEach(a => {
      const onclick = a.getAttribute('onclick') || '';
      const match = onclick.match(/pf_moveMenu\(['"](.+?)['"],\s*['"](.+?)['"]\)/);
      if (match) {
        const url = match[1];
        const code = match[2];
        a.href = url;
        if (code === 'SC_HFAIU') {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        a.removeAttribute('onclick');
      }
    });

    // ─────────────────────────────────────────────
    // 6. dep2-list / dep-02-list 강제 표시
    //    (hover 없이도 크롤러가 하위 링크 인식)
    // ─────────────────────────────────────────────
    document.querySelectorAll(
      '#gnb .dep2-list, #popup-menu .dep2-list, #snb .dep-02-list'
    ).forEach(el => {
      el.style.display = 'block';
      el.style.visibility = 'visible';
      el.style.height = 'auto';
      el.style.overflow = 'visible';
    });

    // ─────────────────────────────────────────────
    // 7. pf_DetailMove: onclick → href 변환
    //    숫자형(12071)과 BN_KEYNO 형식(BN_0000012071) 모두 처리
    // ─────────────────────────────────────────────
    document.querySelectorAll("a[onclick*='pf_DetailMove']").forEach(a => {
      const match = a.getAttribute('onclick').match(/pf_DetailMove\(['"]?([^'")\s]+)['"]?\)/);
      if (match) {
        a.href = '/gb/Board/' + match[1] + '/detailView.do';
        a.removeAttribute('onclick');
      }
    });

    // ─────────────────────────────────────────────
    // 8. pf_LinkPage: 페이지네이션 onclick 제거
    //    href="?pageIndex=N" 이 이미 있으므로 onclick만 제거하면 GET 동작
    // ─────────────────────────────────────────────
    document.querySelectorAll(".com-brd-pagination a[href*='pageIndex']").forEach(a => {
      a.removeAttribute('onclick');
    });

    // ─────────────────────────────────────────────
    // 9. 공지사항 탭 전환 (AJAX 없음, show/hide 방식)
    //    각 탭 클릭 후 yield → 크롤러가 숨겨진 목록 링크 수집
    // ─────────────────────────────────────────────
    const noticeTabs = document.querySelectorAll('#main .main-brd-box .brd-tabs li');
    for (const tab of noticeTabs) {
      tab.click();
      yield ctx.Lib.getState(this, { tab: tab.textContent.trim() });
    }

    // 서브페이지 공통 탭 (.com-tab-02)
    document.querySelectorAll('.com-tab-02 li a').forEach(a => a.click());

    // ─────────────────────────────────────────────
    // 10. SC_QXCFB 실제 하위 URL 시드 앵커 삽입
    //     AJAX 없이 크롤러가 실제 페이지로 직접 진입하도록
    // ─────────────────────────────────────────────
    const seedUrls = [
      // 전시 - 2025 광주디자인비엔날레 하위 페이지 (SC_QXCFB 실제 도달 URL)
      '/gb/exhibition/biennale/mainexhibition.do',
      '/gb/exhibition/biennale/visitorinfo.do',
      '/gb/exhibition/biennale/programs.do',
      // 전시 - 지난전시
      '/gb/exhibition/past/15.do',
      // 재단소개 탭 (서버사이드 탭 파라미터)
      '/gb/foundation/organization.do?tab=1',
      '/gb/foundation/organization.do?tab=2',
      '/gb/foundation/organization.do?tab=3',
      '/gb/foundation/organization.do?tab=4',
      // 영문 메인
      '/en/index.do?sellan=en',
    ];

    const seedContainer = document.createElement('div');
    seedContainer.id = '__bx_seed_urls';
    seedContainer.style.display = 'none';
    seedUrls.forEach(url => {
      const a = document.createElement('a');
      a.href = url;
      seedContainer.appendChild(a);
    });
    document.body.appendChild(seedContainer);

    // ─────────────────────────────────────────────
    // 11. 통합검색 오픈 캡처
    // ─────────────────────────────────────────────
    const srchBtn = document.querySelector('#hd-bar .btn-open-glob-srch-box');
    if (srchBtn) {
      srchBtn.click();
      yield ctx.Lib.getState(this, { action: 'search-open' });
      const srchClose = document.querySelector('#global-srch .btn-cls, #global-srch .btn-close');
      if (srchClose) srchClose.click();
    }

    // ─────────────────────────────────────────────
    // 12. 전체보기 메뉴(#popup-menu) 오픈 캡처
    // ─────────────────────────────────────────────
    const popMenuBtn = document.querySelector('#hd-bar .btn-open-popup-menu');
    if (popMenuBtn) {
      popMenuBtn.click();
      yield ctx.Lib.getState(this, { action: 'popup-menu-open' });
      const popMenuClose = document.querySelector('#popup-menu .btn-cls');
      if (popMenuClose) popMenuClose.click();
    }

    // ─────────────────────────────────────────────
    // 최종 상태 yield
    // ─────────────────────────────────────────────
    yield ctx.Lib.getState(this, {});
  }
}

if (typeof self.__bx_behaviors !== 'undefined') {
  self.__bx_behaviors.load(GwangjuBiennale);
}