에서파싱→로크롤큐에직접추가로에응답캡처로크롤큐삽입핵심는따라서든숫자든그대로에사용해야함형식이든숫자든그대로에사용함수와동일한방식을크롤큐에추가숫자로변환한도추가형식이면숫자변환도함께추가로에응답도캡처에서방식접근대응도변환팝업강제닫기함수오버라이드페이지이탈방지애니메이션즉시완료슬라이드전체처리마퀴애니메이션정지인스타그램외부임베드제거팝업메뉴→변환강제표시이전글다음글추가첨부파일링크추가게시물본문내이미지가경로인경우페이지네이션제거모바일서브메뉴의→앵커변환공지사항탭전환서브페이지공통탭로큐삽입시드앵커삽입문의하기모달오픈캡처통합검색오픈캡처전체보기메뉴오픈캡처class GwangjuBiennale {
      static id = "GwangjuBiennale";
      static isMatch() { return location.hostname === "gwangjubiennale.org"; }
      static init() { return { state: {} }; }

  async *run(ctx) {
          // 0. pf_moveMenu onclick에서 URL 파싱 → addLink로 크롤 큐에 직접 추가
        document.querySelectorAll('a[onclick*="pf_moveMenu"]').forEach(el => {
                  const m = el.getAttribute('onclick').match(/pf_moveMenu\(['"](([^'"]+))['"]/);
                  if (m && m[1]) ctx.Lib.addLink(location.origin + m[1]);
        });

        // pf_DetailMove: POST fetch로 WACZ에 POST 응답 캡처 + addLink(GET URL)로 크롤 큐 삽입
        const csrfToken = (document.querySelector('meta[name="_csrf"]') || {}).content
            || (document.querySelector('input[name="_csrf"]') || {}).value || '';
          const btKeyno = (document.querySelector('input[name="BT_KEYNO"]') || {}).value || '';
          const mnKeyno = (document.querySelector('input[name="MN_KEYNO"]') || {}).value || '';
          const bnMnKeyno = (document.querySelector('input[name="BN_MN_KEYNO"]') || {}).value || '';

        const detailEls = document.querySelectorAll("a[onclick*='pf_DetailMove']");
          for (const el of detailEls) {
                    const onclick = el.getAttribute('onclick') || '';
                    const m = onclick.match(/pf_DetailMove\(['"]{0,1}([^'")\s]+)['"]{0,1}\)/);
                    if (m && m[1]) {
                                const keyno = m[1].startsWith('BN_') ? String(parseInt(m[1].replace('BN_', ''), 10)) : m[1];
                                const url = location.origin + '/gb/Board/' + keyno + '/detailView.do';
                                ctx.Lib.addLink(url);
                                try {
                                              const body = [
                                                              'BT_KEYNO=' + encodeURIComponent(btKeyno),
                                                              'ED_BT_KEYNO=' + encodeURIComponent(btKeyno),
                                                              'MN_KEYNO=' + encodeURIComponent(mnKeyno),
                                                              'BN_MN_KEYNO=' + encodeURIComponent(bnMnKeyno),
                                                              'BN_KEYNO=', 'bnkey=', 'PageIndex=1', 'BN_PWD=',
                                                              'searchCondition=title', 'searchKeyword=',
                                                              '_csrf=' + encodeURIComponent(csrfToken)
                                                            ].join('&');
                                              await fetch(url, {
                                                              method: 'POST',
                                                              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                                              body: body,
                                                              credentials: 'same-origin',
                                              });
                                } catch(e) {}
                                el.href = url;
                                el.removeAttribute('onclick');
                    }
          }

        // 1. 팝업 강제 닫기
        document.querySelectorAll('.popUpWrap_01').forEach(pop => { pop.style.display = 'none'; });

        // 2. pf_moveMenu 함수 오버라이드 (페이지 이탈 방지)
        window.pf_moveMenu = function(URL, PAGEDIV) {
                  if (PAGEDIV === 'SC_HFAIU') {
                              const a = document.createElement('a');
                              a.href = URL; a.target = '_blank';
                              document.body.appendChild(a);
                  }
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
                  ).forEach(el => { el.style.visibility = 'visible'; el.style.opacity = '1'; });

        // 4. Swiper 슬라이드 전체 visible 처리
        document.querySelectorAll('.swiper-slide').forEach(slide => {
                  slide.style.visibility = 'visible'; slide.style.opacity = '1'; slide.style.display = '';
        });

        // 5. 마퀴 애니메이션 정지
        document.querySelectorAll('#main .marquee-center, .marquee-wrap').forEach(el => {
                  el.style.animation = 'none'; el.style.transform = 'none';
        });

        // 6. 인스타그램 외부 임베드 제거
        document.querySelectorAll('#main .instagram-box iframe, #main .instagram-box script').forEach(el => el.remove());

        // 7. GNB/SNB/팝업메뉴: onclick → href 변환
        document.querySelectorAll(
                  '#gnb a.dep2, #popup-menu a.dep1, #popup-menu a.dep2, #snb a.dep-01, #snb a.dep-02'
                ).forEach(a => {
                  const onclick = a.getAttribute('onclick') || '';
                  const match = onclick.match(/pf_moveMenu\(['"](.+?)['"],\s*['"](.+?)['"]\)/);
                  if (match) {
                              const [, URL, code] = match;
                              if (code === 'SC_HFAIU') { a.href = URL; a.target = '_blank'; }
                              else { a.href = location.origin + URL; }
                              a.removeAttribute('onclick');
                  }
        });

        // 8. dep2-list / dep-02-list 강제 표시
        document.querySelectorAll(
                  '#gnb .dep2-list, #popup-menu .dep2-list, #snb .dep-02-list'
                ).forEach(el => {
                  el.style.display = 'block'; el.style.visibility = 'visible';
                  el.style.opacity = '1'; el.style.height = 'auto';
        });

        // 9. 이전글/다음글(.article-list a): addLink 추가
        document.querySelectorAll('.article-list a[href]').forEach(a => {
                  if (a.href && !a.href.startsWith('javascript')) { ctx.Lib.addLink(a.href); }
        });

        // 10. 첨부파일 링크 addLink 추가
        document.querySelectorAll(
                  'a[href*="/fileDownload"], a[href*="/download"], a[onclick*="download"], .attach-list a, .file-list a'
                ).forEach(a => {
                  if (a.href && !a.href.startsWith('javascript')) { ctx.Lib.addLink(a.href); }
        });

        // 11. 게시물 본문 내 이미지: src가 upload 경로인 경우 addLink
        document.querySelectorAll(
                  '.brd-view-cont img[src*="upload"], .view-cont img[src*="upload"], .cont-area img[src*="upload"]'
                ).forEach(img => { if (img.src) ctx.Lib.addLink(img.src); });

        // 12. pf_LinkPage: 페이지네이션 onclick 제거
        document.querySelectorAll(".com-brd-pagination a[href*='pageIndex']").forEach(a => {
                  a.removeAttribute('onclick');
        });

        // 13. 모바일 서브메뉴 select의 option URL → 앵커 변환
        document.querySelectorAll('#sp-mobile-menu-box option[value]').forEach(opt => {
                  const val = opt.getAttribute('value');
                  if (val && val.startsWith('/')) {
                              const a = document.createElement('a');
                              a.href = location.origin + val;
                              document.body.appendChild(a);
                  }
        });

        // 14. 공지사항 탭 전환
        const noticeTabs = document.querySelectorAll('.brd-tabs li a[onclick*="setRelatedBoardPath"]');
          for (const tab of noticeTabs) {
                    try { tab.click(); } catch(e) {}
                    yield { state: { tab: tab.textContent.trim() } };
          }

        // 서브페이지 공통 탭 (.com-tab-02) - addLink로 큐 삽입
        document.querySelectorAll('.com-tab-02 li a').forEach(a => {
                  if (a.href && !a.href.startsWith('javascript')) ctx.Lib.addLink(a.href);
        });

        // 15. 시드 앵커 삽입
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
          seedContainer.style.display = 'none';
          seedUrls.forEach(url => {
                    const a = document.createElement('a');
                    a.href = location.origin + url;
                    seedContainer.appendChild(a);
          });
          document.querySelectorAll('#snb a.dep-02[href*="/gb/exhibition/past/"]').forEach(a => {
                    const anchor = document.createElement('a');
                    anchor.href = a.href;
                    seedContainer.appendChild(anchor);
          });
          document.body.appendChild(seedContainer);

        // 16. 문의하기 모달 오픈 캡처
        try {
                  const questionLink = document.querySelector('a[onclick*="openQuestion"], a[href*="question"]');
                  if (questionLink) {
                              questionLink.click();
                              yield { state: { action: 'question-modal-open' } };
                              const modalClose = document.querySelector('.modal .close, .layer-popup .btn-close');
                              if (modalClose) modalClose.click();
                  }
        } catch(e) {}

        // 17. 통합검색 오픈 캡처
        try {
                  const srchBtn = document.querySelector('#hd .btn-search, .btn-srch');
                  if (srchBtn) {
                              srchBtn.click();
                              yield { state: { action: 'search-open' } };
                              const srchClose = document.querySelector('#hd .search-close, .srch-close');
                              if (srchClose) srchClose.click();
                  }
        } catch(e) {}

        // 18. 전체보기 메뉴(#popup-menu) 오픈 캡처
        try {
                  const popMenuBtn = document.querySelector('#hd .btn-allmenu, .btn-all-menu');
                  if (popMenuBtn) {
                              popMenuBtn.click();
                              yield { state: { action: 'popup-menu-open' } };
                              const popMenuClose = document.querySelector('#popup-menu .btn-close');
                              if (popMenuClose) popMenuClose.click();
                  }
        } catch(e) {}

        yield { state: {} };
  }
}
