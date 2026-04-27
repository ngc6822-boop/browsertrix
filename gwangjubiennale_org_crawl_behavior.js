class GwangjuBiennale {

  static id = "GwangjuBiennale";

  static isMatch() {
    return location.hostname === "gwangjubiennale.org";
  }

  static init() {
    return { state: {} };
  }

  async *run(ctx) {

    // 1. 팝업 강제 닫기
    document.querySelectorAll('.popUpWrap_01').forEach(pop => {
      pop.style.display = 'none';
    });

    // 2. pf_moveMenu 함수 오버라이드
    //    SC_QXCFB: POST AJAX → 직접 이동으로 우회
    //    SC_HFAIU: window.open() → 앵커 삽입으로 변경
    window.pf_moveMenu = function(URL, PAGEDIV) {
      if (PAGEDIV === 'SC_HFAIU') {
        const a = document.createElement('a');
        a.href = URL;
        a.target = '_blank';
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
      }
      // 그 외: 아무것도 안 함 (페이지 이탈 방지)
    };

    // 3. GSAP ScrollTrigger 애니메이션 즉시 완료
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

    // 4. Swiper 슬라이드 전체 visible 처리
    document.querySelectorAll('.swiper-slide').forEach(slide => {
      slide.style.visibility = 'visible';
      slide.style.opacity = '1';
      slide.style.pointerEvents = 'auto';
    });

    // 5. 마퀴 애니메이션 정지 (콘텐츠 잘림 방지)
    document.querySelectorAll('#main .marquee-center, .marquee-wrap').forEach(el => {
      el.style.animationPlayState = 'paused';
      el.style.transform = 'none';
    });

    // 6. 인스타그램 외부 임베드 제거 (크롤 속도 향상)
    document.querySelectorAll('#main .instagram-box iframe, #main .instagram-box script').forEach(el => {
      el.remove();
    });

    // 7. GNB/SNB/팝업메뉴: onclick → href 변환
    //    ※ GNB dep1은 hover 전용이므로 제외
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

    // 8. dep2-list / dep-02-list 강제 표시
    document.querySelectorAll(
      '#gnb .dep2-list, #popup-menu .dep2-list, #snb .dep-02-list'
    ).forEach(el => {
      el.style.display = 'block';
      el.style.visibility = 'visible';
      el.style.height = 'auto';
      el.style.overflow = 'visible';
    });

    // 9. pf_DetailMove: onclick → href 변환
    //    숫자형(12071) + BN_KEYNO 형식(BN_0000012071) 모두 처리
    document.querySelectorAll("a[onclick*='pf_DetailMove']").forEach(a => {
      const match = a.getAttribute('onclick').match(/pf_DetailMove\(['"]?([^'")\s]+)['"]?\)/);
      if (match) {
        a.href = '/gb/Board/' + match[1] + '/detailView.do';
        a.removeAttribute('onclick');
      }
    });

    // 10. pf_LinkPage: 페이지네이션 onclick 제거 → GET 방식 동작
    document.querySelectorAll(".com-brd-pagination a[href*='pageIndex']").forEach(a => {
      a.removeAttribute('onclick');
    });

    // 11. 모바일 서브메뉴 select의 option URL → 앵커 변환
    document.querySelectorAll('#sp-mobile-menu-box option[value]').forEach(opt => {
      if (opt.value && opt.value !== '#') {
        const a = document.createElement('a');
        a.href = opt.value;
        a.style.display = 'none';
        document.body.appendChild(a);
      }
    });

    // 12. 공지사항 탭 전환 (탭별 yield로 숨겨진 목록 수집)
    const noticeTabs = document.querySelectorAll('#main .main-brd-box .brd-tabs li');
    for (const tab of noticeTabs) {
      tab.click();
      yield ctx.Lib.getState(this, { tab: tab.textContent.trim() });
    }

    // 서브페이지 공통 탭 (.com-tab-02)
    document.querySelectorAll('.com-tab-02 li a').forEach(a => a.click());

    // 13. SC_QXCFB 실제 하위 URL + 영문 페이지 시드 앵커 삽입
    const seedUrls = [
      '/gb/exhibition/biennale/mainexhibition.do',
      '/gb/exhibition/biennale/visitorinfo.do',
      '/gb/exhibition/biennale/programs.do',
      '/gb/exhibition/past/15.do',
      '/gb/foundation/organization.do?tab=1',
      '/gb/foundation/organization.do?tab=2',
      '/gb/foundation/organization.do?tab=3',
      '/gb/foundation/organization.do?tab=4',
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

    // 지난전시 SNB에서 실제 회차 URL 동적 추출
    document.querySelectorAll('#snb a.dep-02[href*="/gb/exhibition/past/"]').forEach(a => {
      const anchor = document.createElement('a');
      anchor.href = a.href;
      anchor.style.display = 'none';
      seedContainer.appendChild(anchor);
    });

    document.body.appendChild(seedContainer);

    // 14. 문의하기 모달 오픈 캡처
    const questionLink = document.querySelector("a[onclick*='questionModal']");
    if (questionLink) {
      questionLink.click();
      yield ctx.Lib.getState(this, { action: 'question-modal-open' });
      const modalClose = document.querySelector('.question-modal .btn-cls, .modal .btn-close, [class*="modal"] .btn-close');
      if (modalClose) modalClose.click();
    }

    // 15. 통합검색 오픈 캡처
    const srchBtn = document.querySelector('#hd-bar .btn-open-glob-srch-box');
    if (srchBtn) {
      srchBtn.click();
      yield ctx.Lib.getState(this, { action: 'search-open' });
      const srchClose = document.querySelector('#global-srch .btn-cls, #global-srch .btn-close');
      if (srchClose) srchClose.click();
    }

    // 16. 전체보기 메뉴(#popup-menu) 오픈 캡처
    const popMenuBtn = document.querySelector('#hd-bar .btn-open-popup-menu');
    if (popMenuBtn) {
      popMenuBtn.click();
      yield ctx.Lib.getState(this, { action: 'popup-menu-open' });
      const popMenuClose = document.querySelector('#popup-menu .btn-cls');
      if (popMenuClose) popMenuClose.click();
    }

    // 최종 상태 yield
    yield ctx.Lib.getState(this, {});
  }
}

if (typeof self.__bx_behaviors !== 'undefined') {
  self.__bx_behaviors.load(GwangjuBiennale);
}