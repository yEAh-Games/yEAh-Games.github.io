var ATBS = ATBS || {};

(function($){

    // USE STRICT
    "use strict";

    var $window = $(window);
    var $document = $(document);
    var $goToTopEl = $('.js-go-top-el');
    
    ATBS.header = {

        init: function(){
            ATBS.header.ajaxSearch();
            ATBS.header.atbsSearchButton();
            ATBS.header.offCanvasMenu();
            ATBS.header.priorityNavInit();
            ATBS.header.searchToggle();
            ATBS.header.smartAffix.init({
                fixedHeader: '.js-sticky-header',
                headerPlaceHolder: '.js-sticky-header-holder',
            });
        },
        /* ============================================================================
         * AJAX search
         * ==========================================================================*/
        atbsSearchButton: function() {
            var btnSearchOpen = $('.js-btn-search-open');
            var btnSearchClose = $('.js-btn-search-close');
            var formSearch = $('.atbs-search-form');
            btnSearchOpen.each(function () {
               $(this).on('click',function () {
                   $(formSearch).addClass('Open');
                   setTimeout(function () {
                       $(formSearch).addClass('Active-Animation');
                   },600);
               });
            });
            btnSearchClose.each(function () {
               $(this).on('click',function () {
                   $(formSearch).removeClass('Open');
                   $(formSearch).removeClass('Active-Animation');
               });
            });
        },
        ajaxSearch: function() {
            var $results = '';
            var $ajaxSearch = $('.js-ajax-search');
            var ajaxStatus = '';
            var noResultText = '<span class="noresult-text">There is no result.</span>';
            var errorText = '<span class="error-text">There was some error.</span>';

            $ajaxSearch.each(function() {
                var $this = $(this);
                var $searchForm = $this.find('.search-form__input');
                var $resultsContainer = $this.find('.search-results');
                var $resultsInner = $this.find('.search-results__inner');
                var searchTerm = '';
                var lastSearchTerm = '';

                $searchForm.on('input', $.debounce(800, function() {
                    searchTerm = $searchForm.val();

                    if (searchTerm.length > 0) {
                        $resultsContainer.addClass('is-active');

                        if ((searchTerm != lastSearchTerm) || (ajaxStatus === 'failed' )) {
                            $resultsContainer.removeClass('is-error').addClass('is-loading');
                            lastSearchTerm = searchTerm;
                            ajaxLoad(searchTerm, $resultsContainer, $resultsInner);
                        }
                    } else {
                        $resultsContainer.removeClass('is-active');
                    }
                }));
            });

            function ajaxLoad(searchTerm, $resultsContainer, $resultsInner) {
                var	ajaxCall = $.ajax({
                    url: "inc/ajax-search.html",
                    type: 'post',
                    dataType: 'html',
                    data: {
                        searchTerm: searchTerm,
                    },
                });

                ajaxCall.done(function(respond) {
                    $results = $(respond);
                    ajaxStatus = 'success';
                    if (!$results.length) {
                        $results = noResultText;
                    }
                    $resultsInner.html($results).css('opacity', 0).animate({opacity: 1}, 500);
                });

                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                    $resultsContainer.addClass('is-error');
                    $results = errorText;
                    $resultsInner.html($results).css('opacity', 0).animate({opacity: 1}, 500);
                });

                ajaxCall.always(function() {
                    $resultsContainer.removeClass('is-loading');
                });
            }
        },
        /* ============================================================================
         * Offcanvas Menu
         * ==========================================================================*/
        offCanvasMenu: function() {
            var $backdrop = $('<div class="atbs-offcanvas-backdrop"></div>');
            var $offCanvas = $('.js-atbs-offcanvas');
            var $offCanvasToggle = $('.js-atbs-offcanvas-toggle');
            var $offCanvasClose = $('.js-atbs-offcanvas-close');
            var $offCanvasMenuHasChildren = $('.navigation--offcanvas').find('li.menu-item-has-children > a');
            var menuExpander = ('<div class="submenu-toggle"><i class="mdicon mdicon-expand_more"></i></div>');

            $backdrop.on('click', function(){
                $offCanvas.removeClass('is-active');
                $(this).fadeOut(200, function(){
                    $(this).detach();
                });
            });

            $offCanvasToggle.on('click', function(e){
                e.preventDefault();
                var targetID = $(this).attr('href');
                var $target = $(targetID);
                $target.toggleClass('is-active');
                $backdrop.hide().appendTo(document.body).fadeIn(200);
            });

            $offCanvasClose.on('click', function(e){
                e.preventDefault();
                var targetID = $(this).attr('href');
                var $target = $(targetID);
                $target.removeClass('is-active');
                $backdrop.fadeOut(200, function(){
                    $(this).detach();
                });
            });

            $offCanvasMenuHasChildren.append(function() {
                return $(menuExpander).on('click', function(e){
                    e.preventDefault();
                    var $subMenu = $(this).parent().siblings('.sub-menu');

                    $subMenu.slideToggle(200);
                });
            });

            $(window).on('resize',function (e) {
                var checkExist = setInterval(function() {
                    var elementPC = $('#atbs-offcanvas-primary');
                    var elementMB = $('#atbs-offcanvas-mobile');
                    if(elementPC.hasClass('is-active') ){
                        var checkDisplay = elementPC.css('display');
                        if(checkDisplay == 'none' ){
                            $backdrop.css('display','none');
                            clearInterval(checkExist);
                        }
                    }
                    if(elementMB.hasClass('is-active')) {
                        var checkDisplay = elementMB.css('display');
                        if( checkDisplay == 'none'){
                            $backdrop.css('display','none');
                            clearInterval(checkExist);
                        }
                    }
                    if(elementPC.hasClass('is-active')  && elementPC.css('display') != 'none' || elementMB.hasClass('is-active')  && elementMB.css('display') != 'none'){
                        $backdrop.css('display','block');
                        clearInterval(checkExist);
                    }
                    clearInterval(checkExist);
                }, 100); // check every 100ms
            });
        },

        /* ============================================================================
         * Header dropdown search
         * ==========================================================================*/
        searchToggle: function() {
            var $headerSearchDropdown = $('#header-search-dropdown');
            var $searchDropdownToggle = $('.js-search-dropdown-toggle');
            var $mobileHeader = $('#atbs-mobile-header');
            var $stickyHeaderNav = $('#atbs-sticky-header').find('.navigation-bar__inner');
            var $staticHeaderNav = $('.site-header').find('.navigation-bar__inner');
            var $headerSearchDropdownInput = $headerSearchDropdown.find('.search-form__input');

            $headerSearchDropdown.on('click', function(e) {
                e.stopPropagation();
            });

            $searchDropdownToggle.on('click', function(e) {
                e.stopPropagation();
                var $toggleBtn = $(this);
                var position = '';


                if ($toggleBtn.hasClass('mobile-header-btn')) {
                    position = 'mobile';
                } else if ($toggleBtn.parents('.sticky-header').length) {
                    position = 'sticky';
                } else {
                    position = 'navbar';
                }

                if ($headerSearchDropdown.hasClass('is-in-' + position) || !$headerSearchDropdown.hasClass('is-active')) {
                    $headerSearchDropdown.toggleClass('is-active');
                }

                switch(position) {
                    case 'mobile':
                        if (!$headerSearchDropdown.hasClass('is-in-mobile')) {
                            $headerSearchDropdown.addClass('is-in-mobile');
                            $headerSearchDropdown.removeClass('is-in-sticky');
                            $headerSearchDropdown.removeClass('is-in-navbar');
                            $headerSearchDropdown.appendTo($mobileHeader);
                        }
                        break;

                    case 'sticky':
                        if (!$headerSearchDropdown.hasClass('is-in-sticky')) {
                            $headerSearchDropdown.addClass('is-in-sticky');
                            $headerSearchDropdown.removeClass('is-in-mobile');
                            $headerSearchDropdown.removeClass('is-in-navbar');
                            $headerSearchDropdown.insertAfter($stickyHeaderNav);
                        }
                        break;

                    default:
                        if (!$headerSearchDropdown.hasClass('is-in-navbar')) {
                            $headerSearchDropdown.addClass('is-in-navbar');
                            $headerSearchDropdown.removeClass('is-in-sticky');
                            $headerSearchDropdown.removeClass('is-in-mobile');
                            $headerSearchDropdown.insertAfter($staticHeaderNav);
                        }
                }

                if ($headerSearchDropdown.hasClass('is-active')) {
                    setTimeout(function () {
                        $headerSearchDropdownInput.focus();
                    }, 200);
                }
            });

            $document.on('click', function() {
                $headerSearchDropdown.removeClass('is-active');
            });

            $window.on('stickyHeaderHidden', function(){
                if ($headerSearchDropdown.hasClass('is-in-sticky')) {
                    $headerSearchDropdown.removeClass('is-active');
                }
            });
        },
        /* ============================================================================
         * Prority+ menu init
         * ==========================================================================*/
        priorityNavInit: function() {
            var $menus = $('.js-priority-nav');
            $menus.each(function() {
                ATBS.priorityNav($(this));
            })
        },

        /* ============================================================================
         * Smart sticky header
         * ==========================================================================*/
        smartAffix: {
            //settings
            $headerPlaceHolder: '', //the affix menu (this element will get the mdAffixed)
            $fixedHeader: '', //the menu wrapper / placeholder
            isDestroyed: false,
            isDisabled: false,
            isFixed: false, //the current state of the menu, true if the menu is affix
            isShown: false,
            windowScrollTop: 0, 
            lastWindowScrollTop: 0, //last scrollTop position, used to calculate the scroll direction
            offCheckpoint: 0, // distance from top where fixed header will be hidden
            onCheckpoint: 0, // distance from top where fixed header can show up
            breakpoint: 992, // media breakpoint in px that it will be disabled

            init : function init (options) {

                //read the settings
                this.$fixedHeader = $(options.fixedHeader);
                this.$headerPlaceHolder = $(options.headerPlaceHolder);

                // Check if selectors exist.
                if ( !this.$fixedHeader.length || !this.$headerPlaceHolder.length ) {
                    this.isDestroyed = true;
                } else if ( !this.$fixedHeader.length || !this.$headerPlaceHolder.length || ( ATBS.documentOnResize.windowWidth <= ATBS.header.smartAffix.breakpoint ) ) { // Check if device width is smaller than breakpoint.
                    this.isDisabled = true;
                }

            },// end init

            compute: function compute() {
                if (ATBS.header.smartAffix.isDestroyed || ATBS.header.smartAffix.isDisabled) {
                    return;
                }

                // Set where from top fixed header starts showing up
                if (!this.$headerPlaceHolder.length) {
                    this.offCheckpoint = 400;
                } else {
                    this.offCheckpoint = $(this.$headerPlaceHolder).offset().top + 400;
                }

                this.onCheckpoint = this.offCheckpoint + 500;

                // Set menu top offset
                this.windowScrollTop = ATBS.documentOnScroll.windowScrollTop;
                if (this.offCheckpoint < this.windowScrollTop) {
                    this.isFixed = true;
                }
            },

            updateState: function updateState() {
                //update affixed state
                if (this.isFixed) {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.addClass('is-fixed');
                    }
                } else {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.removeClass('is-fixed');
                    }
                    $window.trigger('stickyHeaderHidden');
                }

                if (this.isShown) {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.addClass('is-shown');
                    }
                } else {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.removeClass('is-shown');
                    }
                }
            },

            /**
             * called by events on scroll
             */
            eventScroll: function eventScroll(scrollTop) {

                var scrollDirection = '';
                var scrollDelta = 0;

                // check the direction
                if (scrollTop != this.lastWindowScrollTop) { //compute direction only if we have different last scroll top

                    // compute the direction of the scroll
                    if (scrollTop > this.lastWindowScrollTop) {
                        scrollDirection = 'down';
                    } else {
                        scrollDirection = 'up';
                    }

                    //calculate the scroll delta
                    scrollDelta = Math.abs(scrollTop - this.lastWindowScrollTop);
                    this.lastWindowScrollTop = scrollTop;

                    // update affix state
                    if (this.offCheckpoint < scrollTop) {
                        this.isFixed = true;
                    } else {
                        this.isFixed = false;
                    }
                    
                    // check affix state
                    if (this.isFixed) {
                        // We're in affixed state, let's do some check
                        if ((scrollDirection === 'down') && (scrollDelta > 14)) {
                            if (this.isShown) {
                                this.isShown = false; // hide menu
                            }
                        } else {
                            if ((!this.isShown) && (scrollDelta > 14) && (this.onCheckpoint < scrollTop)) {
                                this.isShown = true; // show menu
                            }
                        }
                    } else {
                        this.isShown = false;
                    }

                    this.updateState(); // update state
                }
            }, // end eventScroll function

            /**
            * called by events on resize
            */
            eventResize: function eventResize(windowWidth) {
                // Check if device width is smaller than breakpoint.
                if ( ATBS.documentOnResize.windowWidth < ATBS.header.smartAffix.breakpoint ) {
                    this.isDisabled = true;
                } else {
                    this.isDisabled = false;
                    ATBS.header.smartAffix.compute();
                }
            }
        },

    };

    ATBS.documentOnScroll = {
        ticking: false,
        windowScrollTop: 0, //used to store the scrollTop

        init: function() {
            window.addEventListener('scroll', function(e) {
                if (!ATBS.documentOnScroll.ticking) {
                    window.requestAnimationFrame(function() {
                        ATBS.documentOnScroll.windowScrollTop = $window.scrollTop();

                        // Functions to call here
                        if (!ATBS.header.smartAffix.isDisabled && !ATBS.header.smartAffix.isDestroyed) {
                            ATBS.header.smartAffix.eventScroll(ATBS.documentOnScroll.windowScrollTop);
                        }

                        ATBS.documentOnScroll.goToTopScroll(ATBS.documentOnScroll.windowScrollTop);

                        ATBS.documentOnScroll.ticking = false;
                    });
                }
                ATBS.documentOnScroll.ticking = true;
            });
        },

        /* ============================================================================
         * Go to top scroll event
         * ==========================================================================*/
        goToTopScroll: function(windowScrollTop){
            if ($goToTopEl.length) {
                if(windowScrollTop > 800) {
                    if (!$goToTopEl.hasClass('is-active')) $goToTopEl.addClass('is-active');
                } else {
                    $goToTopEl.removeClass('is-active');
                }
            }
        },
    };

    ATBS.documentOnResize = {
        ticking: false,
        windowWidth: $window.width(),

        init: function() {
            window.addEventListener('resize', function(e) {
                if (!ATBS.documentOnResize.ticking) {
                    window.requestAnimationFrame(function() {
                        ATBS.documentOnResize.windowWidth = $window.width();

                        // Functions to call here
                        if (!ATBS.header.smartAffix.isDestroyed) {
                            ATBS.header.smartAffix.eventResize(ATBS.documentOnResize.windowWidth);
                        }

                        ATBS.documentOnResize.ticking = false;
                    });
                }
                ATBS.documentOnResize.ticking = true;
            });
        },
    };

    ATBS.documentOnReady = {

        init: function(){
            ATBS.header.init();
            ATBS.header.smartAffix.compute();
            ATBS.documentOnScroll.init();
            ATBS.documentOnReady.goToTop();
            ATBS.documentOnReady.circleMoveRandom();
            ATBS.documentOnReady.carousel_1i();
            ATBS.documentOnReady.carousel_1i_effect();
            ATBS.documentOnReady.carousel_1i30m();
            ATBS.documentOnReady.carousel_1i30m_no_reponsive();
            ATBS.documentOnReady.carousel_1i40m();
            ATBS.documentOnReady.carousel_1i0m();
            ATBS.documentOnReady.carousel_1i_get_src();
            ATBS.documentOnReady.carousel_1i_get_src_multiple_margin();
            ATBS.documentOnReady.carousel_1i_get_src_width_auto();
            ATBS.documentOnReady.carousel_1i_get_src_width_auto_0m();
            ATBS.documentOnReady.carousel_1i_get_src_width_auto_center();
            ATBS.documentOnReady.carousel_hover_cursor_effect();
            ATBS.documentOnReady.carousel_1i_text_fade();
            ATBS.documentOnReady.carousel_1i_dot_number_effect();
            ATBS.documentOnReady.carousel_2i30m();
            ATBS.documentOnReady.carousel_3i0m();
            ATBS.documentOnReady.carousel_4i0m();
            ATBS.documentOnReady.carousel_4i30m();
            ATBS.documentOnReady.carousel_auto_width();
            ATBS.documentOnReady.carousel_auto_width_rtl();
            ATBS.documentOnReady.carousel_auto_width_center();
            ATBS.documentOnReady.carousel_auto_width_delay();
            ATBS.documentOnReady.carousel_background_below();
            ATBS.documentOnReady.carousel_1i_dot_center_number();
            ATBS.documentOnReady.atbs_navigation_nav_dots_horizontal();
            ATBS.documentOnReady.customCarouselNav();
            ATBS.documentOnReady.atbs_scroll_element();
            ATBS.documentOnReady.atbs_theme_switch();
            ATBS.documentOnReady.atbs_bookmark();
            ATBS.documentOnReady.reviewRatingStarIcon();
            ATBS.documentOnReady.reviewScoreList();
            ATBS.documentOnReady.reviewScoreProgress();
            ATBS.documentOnReady.atbs_accordionButton();
            ATBS.documentOnReady.textFadeLimit();
            ATBS.documentOnReady.atbs_scrolltop_default();
        },
        /* ============================================================================
         * Scroll top
         * ==========================================================================*/
        goToTop: function() {
            if ($goToTopEl.length) {
                $goToTopEl.on('click', function() {
                    $('html,body').stop(true).animate({scrollTop:0},400);
                    return false;
                });
            }
        },

        /* ============================================================================
        * Pattern Circle Move Random
        * ==========================================================================*/
        circleMoveRandom : function() {
            var canvasFrame = document.getElementsByClassName('canvas-circle-move-random');
            // // Set Canvas dimensions
            var radius = [21,20,12] ;
            $(canvasFrame).each(function (index, el) {
                var strColors = $(el).data('color');
                var circleColors = strColors.split(",");
                // Get drawing context
                var canvas = el.getContext( '2d' );
                el.width   = 370;
                el.height  = 370;
                // The Circle class
                function ColoredCircle( x, y, dx, dy, radius, color ) {
                    this.x 	= x;
                    this.y 	= y;
                    this.dx = dx;
                    this.dy = dy;
                    this.radius = radius;
                    this.color 	= color;
                    this.draw = function() {
                        canvas.beginPath();
                        canvas.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
                        canvas.shadowBlur = 5;
                        canvas.shadowOffsetX = 0;
                        canvas.shadowOffsetY = 5;
                        canvas.shadowColor = 'rgba(0,0,0,0.1)';
                        canvas.fillStyle = this.color;
                        canvas.fill();
                    };
                    this.update = function() {
                        if( this.x + this.radius > 370 || this.x - this.radius < 0 ) {
                            this.dx = -this.dx;
                        }
                        if( this.y + this.radius > 370 || this.y - this.radius < 0 ) {
                            this.dy = -this.dy;
                        }
                        this.x += this.dx;
                        this.y += this.dy;
                        this.draw();
                    };
                }
                var coloredCircles = [];
                // Radius
                for( var i = 0; i < 3; i++ )  {
                    var  radius_item = radius[i];
                    // Starting Position
                    var x = Math.random() * ( 370 - radius_item * 2 ) + radius_item;
                    var y = Math.random() * ( 370 - radius_item * 2) + radius_item;

                    // Speed in x and y direction
                    var dx = 0.8;
                    var dy = 0.9;

                    // Color
                    var color = circleColors[ i ];
                    coloredCircles.push( new ColoredCircle( x, y, dx, dy, radius_item, color ) );
                }
                function createCanvasPointMove() {
                    requestAnimationFrame( createCanvasPointMove );
                    canvas.clearRect( 0, 0, 370, 370 );
                    for( var r = 0; r < 3; r++ ) {
                        coloredCircles[r].update();
                    }
                }
                createCanvasPointMove();
            });
        },

        /* ============================================================================
        * Carousel
        * ==========================================================================*/
        carousel_1i: function() {
            var $carousels = $('.js-atbs-carousel-1i');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 60,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    loop: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0 : {
                            items: 1,
                            dots: true,
                            // nav: false,
                            margin: 40,
                        },
                        576 : {
                            items: 1,
                            margin: 50,
                        },
                        768: {
                            margin: 60,
                        },
                        992: {
                            margin: 60,
                        }
                    },
                });
                
            })
        },

        carousel_1i_effect: function() {
            var $carousels = $('.js-atbs-carousel-1i-effect');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 60,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    loop: true,
                    navText: ['<svg xmlns="http://www.w3.org/2000/svg" width="80" height="21.818" viewBox="0 0 80 21.818">\n' +
                    '  <path d="M-28.182,87.727H43.792l-5.987,5.987a1.818,1.818,0,1,0,2.571,2.571l9.091-9.091a1.818,1.818,0,0,0,0-2.571l-9.091-9.091A1.818,1.818,0,0,0,37.805,78.1l5.987,5.987H-28.182A1.818,1.818,0,0,0-30,85.909,1.818,1.818,0,0,0-28.182,87.727Z" transform="translate(50 96.818) rotate(180)" fill="#222" opacity="0.5"/>\n' +
                    '</svg>\n', '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="21.818" viewBox="0 0 80 21.818">\n' +
                    '  <path d="M-28.182,87.727H43.792l-5.987,5.987a1.818,1.818,0,1,0,2.571,2.571l9.091-9.091a1.818,1.818,0,0,0,0-2.571l-9.091-9.091A1.818,1.818,0,0,0,37.805,78.1l5.987,5.987H-28.182A1.818,1.818,0,0,0-30,85.909,1.818,1.818,0,0,0-28.182,87.727Z" transform="translate(30 -75)" fill="#222" opacity="0.5"/>\n' +
                    '</svg>\n'],
                    smartSpeed: 500,
                    responsive: {
                        0 : {
                            items: 1,
                            dots: true,
                            nav: false,
                            margin: 40,
                        },
                        576 : {
                            items: 1,
                            margin: 50,
                        },
                        768: {
                            margin: 60,
                        },
                        992: {
                            margin: 60,
                        }
                    },
                });

            })
        },

        carousel_1i30m: function() {
            var $carousels = $('.js-atbs-carousel-1i-30m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    nav: true,
                    dots: true,
                    loop: true,
                    autoHeight: true,
                    navText: ['<svg xmlns="http://www.w3.org/2000/svg" width="50" height="15.584" viewBox="0 0 50 15.584">\n' +
                    '  <path d="M28.7,84.091H-15.566l4.277,4.277a1.3,1.3,0,0,1,0,1.837,1.3,1.3,0,0,1-.918.38,1.294,1.294,0,0,1-.918-.38l-6.494-6.494a1.3,1.3,0,0,1,0-1.837l6.494-6.494a1.3,1.3,0,0,1,1.837,0,1.3,1.3,0,0,1,0,1.837l-4.277,4.277H28.7a1.3,1.3,0,1,1,0,2.6Z" transform="translate(20 -75)" fill="#fff" opacity="0.2"/>\n' +
                    '</svg>\n', '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="15.584" viewBox="0 0 50 15.584">\n' +
                    '  <path d="M-18.7,84.091H25.566l-4.277,4.277A1.3,1.3,0,1,0,23.126,90.2l6.494-6.494a1.3,1.3,0,0,0,0-1.837l-6.494-6.494a1.3,1.3,0,0,0-1.837,1.837l4.277,4.277H-18.7a1.3,1.3,0,0,0-1.3,1.3A1.3,1.3,0,0,0-18.7,84.091Z" transform="translate(20 -75)" fill="#fff" opacity="0.2"/>\n' +
                    '</svg>\n'],
                    smartSpeed: 500,

                });
            })
        },

        carousel_1i30m_no_reponsive: function() {
            var $carousels = $('.js-atbs-carousel-1i-30m-no-responsive');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    nav: true,
                    dots: true,
                    loop: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                });
            })
        },

        carousel_1i0m: function() {
            var $carousels = $('.js-atbs-carousel-1i-0m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    dots: true,
                    loop: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                });
            })
        },

        carousel_1i_get_src: function() {
            var $carousels = $('.js-atbs-carousel-1i-get-src');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 1,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    onInitialized  : owl_onInitialized,
                });
                function owl_onInitialized(event) {
                    var element             = event.target;
                    var current             = event.item.index;
                    var owl_background_img  = $(element).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var src                 = $(event.target).find(".owl-item").eq(current).find("img").attr('src');

                    $(owl_background_img).attr("src", src);
                };


                $(this).on('translate.owl.carousel', function(event) {
                    var current                 = event.item.index;
                    var owl_background_img      = $(this).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var owl_background_img_preparatory      = $(owl_background_img).not('.active');
                    var src                     = $(event.target).find(".owl-item").eq(current).find("img").attr('src');
                    $(this).addClass("owl-disable-button");
                    $(owl_background_img_preparatory).attr('src', src);
                    if ( $(owl_background_img_preparatory).attr('src') == src) {
                        $(owl_background_img).toggleClass('active');
                    }
                    // $(owl_background_img_preparatory).imagesLoaded(function () {
                    //     $(owl_background_img).toggleClass('active');
                    // });

                });
                $(this).on('translated.owl.carousel', function(event) {
                    var owl_this = $(this);

                    setTimeout(function () {
                        $(owl_this).removeClass("owl-disable-button");
                    },400)
                });
            })
        },


        carousel_1i_get_src_multiple_margin: function() {
            var $carousels = $('.js-atbs-carousel-1i-get-src-multiple-margin');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: true,
                    navText: ['<svg id="right-arrow-of-straight-thin-line" xmlns="http://www.w3.org/2000/svg" width="60" height="14.776" viewBox="0 0 60 14.776">\n' +
                    '  <path data-name="Path 1493" d="M.478,172.8l11.14-6.432a.956.956,0,0,1,.956,1.656L4.522,172.67H59.044a.956.956,0,1,1,0,1.912H4.528l8.046,4.646a.956.956,0,1,1-.956,1.656L.478,174.453a.956.956,0,0,1,0-1.656Z" transform="translate(0 -166.237)" fill="#222"/>\n' +
                    '</svg>\n', '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="14.776" viewBox="0 0 60 14.776">\n' +
                    '  <g id="right-arrow-of-straight-thin-line" transform="translate(20 -166.237)">\n' +
                    '    <path data-name="Path 1493" d="M39.522,172.8l-11.14-6.432a.956.956,0,0,0-.956,1.656l8.053,4.649H-19.044a.956.956,0,0,0-.956.956.956.956,0,0,0,.956.956H35.472l-8.046,4.646a.956.956,0,1,0,.956,1.656l11.14-6.432a.956.956,0,0,0,0-1.656Z" transform="translate(0 0)" fill="#222"/>\n' +
                    '  </g>\n' +
                    '</svg>\n'],
                    smartSpeed: 500,
                    onInitialized  : owl_onInitialized,
                    responsive: {
                        1200: {
                            margin: 85,
                        },
                        1680: {
                            margin: carousel_margin,
                        }
                    }
                });
                function owl_onInitialized(event) {
                    var element             = event.target;
                    var current             = event.item.index;
                    var owl_background_img  = $(element).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var src                 = $(event.target).find(".owl-item").eq(current).find("img").attr('src');

                    $(owl_background_img).attr("src", src);
                };


                $(this).on('translate.owl.carousel', function(event) {
                    var current                 = event.item.index;
                    var owl_background_img      = $(this).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var owl_background_img_preparatory      = $(owl_background_img).not('.active');
                    var src                     = $(event.target).find(".owl-item").eq(current).find("img").attr('src');
                    $(this).addClass("owl-disable-button");
                    $(owl_background_img_preparatory).attr('src', src);
                    if ( $(owl_background_img_preparatory).attr('src') == src) {
                        $(owl_background_img).toggleClass('active');
                    }
                    // $(owl_background_img_preparatory).imagesLoaded(function () {
                    //     $(owl_background_img).toggleClass('active');
                    // });

                });
                $(this).on('translated.owl.carousel', function(event) {
                    var owl_this = $(this);

                    setTimeout(function () {
                        $(owl_this).removeClass("owl-disable-button");
                    },400)
                });
            })
        },

        carousel_1i_get_src_width_auto: function() {
            var $carousels = $('.js-atbs-carousel-1i-get-src-width-auto');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 10,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: true,
                    autoWidth: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0: {
                            margin: 30,
                        },
                        768: {
                            margin: 40,
                        },
                        992: {
                            margin: 60,
                        },
                        1200: {
                            margin: carousel_margin,
                        }
                    },
                    onInitialized  : owl_onInitialized,
                });
                function owl_onInitialized(event) {
                    var element             = event.target;
                    var current             = event.item.index;
                    var owl_background_img  = $(element).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var src                 = $(event.target).find(".owl-item").eq(current).find("img").attr('src');

                    $(owl_background_img).attr("src", src);
                };


                $(this).on('translate.owl.carousel', function(event) {
                    var current                 = event.item.index;
                    var owl_background_img      = $(this).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var owl_background_img_preparatory      = $(owl_background_img).not('.active');
                    var src                     = $(event.target).find(".owl-item").eq(current).find("img").attr('src');
                    $(this).addClass("owl-disable-button");
                    $(owl_background_img_preparatory).attr('src', src);
                    if ( $(owl_background_img_preparatory).attr('src') == src) {
                        $(owl_background_img).toggleClass('active');
                    }
                    // $(owl_background_img_preparatory).imagesLoaded(function () {
                    //     $(owl_background_img).toggleClass('active');
                    // });

                });
                $(this).on('translated.owl.carousel', function(event) {
                    var owl_this = $(this);

                    setTimeout(function () {
                        $(owl_this).removeClass("owl-disable-button");
                    },400)
                });
            })
        },

        carousel_1i_get_src_width_auto_0m: function() {
            var $carousels = $('.js-atbs-carousel-1i-get-src-width-auto-0m');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 1,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: true,
                    autoWidth: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    onInitialized  : owl_onInitialized,
                });
                function owl_onInitialized(event) {
                    var element             = event.target;
                    var current             = event.item.index;
                    var owl_background_img  = $(element).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var src                 = $(event.target).find(".owl-item").eq(current).find("img").attr('src');
                    // Animation Class
                    var owl_items                   = $(element).find(".owl-item");
                    var current_center              = $(element).find(".owl-item").eq(current);
                    var current_center_index        = $(element).find(".owl-item").eq(current).index();
                    var current_center_active       = owl_items[current_center_index];

                    // Action
                    $(owl_background_img).attr("src", src);

                    $(current_center).addClass("Animation-Preventive");
                    setTimeout(function () {
                        $(current_center_active).addClass("active_current");
                    },100);
                };

                $(this).on('translate.owl.carousel', function(event) {
                    var element                 = event.target;
                    var current                 = event.item.index;
                    var owl_background_img      = $(this).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var owl_background_img_preparatory      = $(owl_background_img).not('.active');
                    var src                     = $(event.target).find(".owl-item").eq(current).find("img").attr('src');
                    // Animation Class
                    var current_center         = $(element).find(".owl-item").eq(current);
                    var owl_items              = $(element).find(".owl-item");
                    var owl_item_remove_class  = $(element).find(".owl-item.active_current");
                    var current_center_index   = $(element).find(".owl-item").eq(current).index();
                    var current_center_active  = owl_items[current_center_index];

                    // Action
                    $(this).addClass("owl-disable-button");
                    $(owl_background_img_preparatory).attr('src', src);
                    if ( $(owl_background_img_preparatory).attr('src') == src) {
                        $(owl_background_img).toggleClass('active');
                    }
                    // $(owl_background_img_preparatory).imagesLoaded(function () {
                    //     $(owl_background_img).toggleClass('active');
                    // });


                    setTimeout(function () {
                        $(owl_item_remove_class).removeClass("active_current Animation-Preventive");
                        $(current_center).addClass("Animation-Preventive");
                        $(current_center_active).addClass("active_current");
                    },100);


                });

                $(this).on('translated.owl.carousel', function(event) {
                    var owl_this = $(this);

                    setTimeout(function () {
                        $(owl_this).removeClass("owl-disable-button");
                    },400)
                });
            })
        },

        carousel_1i_get_src_width_auto_center: function() {
            var $carousels = $('.js-atbs-carousel-1i-get-src-width-auto-center');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 1,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: true,
                    autoWidth: true,
                    center: true,

                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 800,
                    onInitialized  : owl_onInitialized,
                    responsive: {
                        0: {
                            margin: 30,
                        },
                        576: {
                            margin: 30,
                            mouseDrag: false,
                            touchDrag: false,
                        },
                        768: {
                            margin: 40,
                            mouseDrag: false,
                            touchDrag: false,
                        },
                        992: {
                            margin: 60,
                            mouseDrag: false,
                            touchDrag: false,
                        },
                        1200: {
                            margin: carousel_margin,
                            mouseDrag: false,
                            touchDrag: false,
                        }
                    },

                });
                function owl_onInitialized(event) {
                    var element             = event.target;
                    var current             = event.item.index;
                    var owl_background_img  = $(element).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var src                 = $(event.target).find(".owl-item").eq(current).find("img").attr('src');
                    // Animation Class
                    var owl_items                   = $(element).find(".owl-item");
                    var current_center              = $(element).find(".owl-item").eq(current);
                    var current_center_index        = $(element).find(".owl-item").eq(current).index();
                    var current_center_active       = owl_items[current_center_index];
                    // Action

                    $(owl_background_img).attr("src", src);

                    $(current_center).addClass("Animation-Preventive");
                    setTimeout(function () {
                        $(current_center_active).addClass("active_current");
                    },100);
                };
                $(this).on('translate.owl.carousel', function(event) {
                    var element                 = event.target;
                    var current                 = event.item.index;
                    var owl_background_img      = $(this).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var owl_background_img_preparatory      = $(owl_background_img).not('.active');
                    var src                     = $(event.target).find(".owl-item").eq(current).find("img").attr('src');
                    // Animation Class
                    var current_center         = $(element).find(".owl-item").eq(current);
                    var owl_items              = $(element).find(".owl-item");
                    var owl_item_remove_class  = $(element).find(".owl-item.active_current");
                    var current_center_index   = $(element).find(".owl-item").eq(current).index();
                    var current_center_active  = owl_items[current_center_index];

                    // Action
                    $(this).addClass("owl-disable-button");
                    $(owl_background_img_preparatory).attr('src', src);
                    if ( $(owl_background_img_preparatory).attr('src') == src) {
                        $(owl_background_img).toggleClass('active');
                    }


                    setTimeout(function () {
                        $(owl_item_remove_class).removeClass("active_current Animation-Preventive");
                        $(current_center).addClass("Animation-Preventive");
                        $(current_center_active).addClass("active_current");
                    },100);

                });
                $(this).on('translated.owl.carousel', function(event) {
                    var owl_this = $(this);

                    setTimeout(function () {
                        $(owl_this).removeClass("owl-disable-button");
                    },400)
                });
            })
        },

        carousel_hover_cursor_effect: function() {
            if ( $.isFunction($.fn.owlCarousel) ) {
                var $carousels = $('.js-atbs-carousel-hover-cursor-effect');
                $carousels.each( function() {
                    var element = $(this);
                    element.hover(function () {
                        element.addClass("on-hover");
                        var item = element.find('.owl-item .post');
                        // Append Cursor Element
                        var cursor =    '<div class="owl-cursor">' +
                            '<svg viewBox="0 0 512 512" xml:space="preserve">' +
                            ' <path xmlns="http://www.w3.org/2000/svg" d="M508.875,248.458l-160-160c-4.167-4.167-10.917-4.167-15.083,0c-4.167,4.167-4.167,10.917,0,15.083l141.792,141.792    H10.667C4.771,245.333,0,250.104,0,256s4.771,10.667,10.667,10.667h464.917L333.792,408.458c-4.167,4.167-4.167,10.917,0,15.083    c2.083,2.083,4.813,3.125,7.542,3.125c2.729,0,5.458-1.042,7.542-3.125l160-160C513.042,259.375,513.042,252.625,508.875,248.458z    "/>' +
                            '</svg>' +
                            '<div>';
                        $(element).append(cursor);

                        // Action
                        item.hover(function () {
                            element.removeClass("show-cursor");
                        },function () {
                            element.addClass("show-cursor");
                        });
                        $(this).on('mousemove',function (e) {
                            var offset = $(element).offset();
                            var x = e.pageX - offset.left;
                            var y = e.pageY - offset.top;
                            $('.owl-cursor').css({left: x, top: y});

                            if ((e.pageX - this.offsetLeft) < $(this).width() / 2) {
                                element.addClass("Left");
                                element.removeClass("Right");
                            } else {
                                element.addClass("Right");
                                element.removeClass("Left");
                            }
                        });

                    }, function () {
                        element.removeClass("on-hover");
                        var owl_cursor = element.find('.owl-cursor');
                        owl_cursor.remove();
                    });
                    element.on('click',function () {
                        if ( $(this).hasClass("show-cursor") ) {
                            if( $(this).hasClass("Left")) {
                                element.trigger('prev.owl.carousel');
                            }
                            else {
                                element.trigger('next.owl.carousel');
                            }
                        }

                    });

                });

            }
        },

        carousel_1i40m: function() {
            var $carousels = $('.js-atbs-carousel-1i-40m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    nav: true,
                    dots: true,
                    loop: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                });
            })
        },

        carousel_1i_text_fade: function() {
            var $carousels = $('.js-atbs-carousel-1i-text-fade');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    dots: true,
                    loop: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 600,
                    onTranslate: removeAnimation,
                    onTranslated: showAnimation,
                    onDrag: removeAnimation,
                });
                function removeAnimation(event) {
                    var $this = event.target;
                    var item = $($this).find('.owl-item');
                    $(item).find('.content-fade-in').removeClass("fadeInText");
                    $(item).find('.content-fade-in').addClass("opacity-default");
                }
                function showAnimation(event) {
                    var $this = event.target;
                    var item = $($this).find('.active');
                    $(item).find('.content-fade-in').addClass("fadeInText");
                    $(item).find('.content-fade-in').removeClass("opacity-default");
                }
            })
        },

        carousel_1i_dot_number_effect: function() {
            var $carousels = $('.js-atbs-carousel-1i-dot-number-effect');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 600,
                    onInitialized  : counter,
                    onTranslate : counter,
                });
                function counter(event) {
                    var element			= event.target;
                    var itemCount		= event.item.count;
                    var itenIndex		= event.item.index;
                    var owlstageChildrens = $(element).find('.owl-stage').children().length;

                    var theCloned 		= owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if(itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    }else if(currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }

                    $(element).parent().find('.owl-number').html( currentIndex +' <span class="slide-seperated">/</span> ' + itemCount);
                }
            })
        },

        carousel_2i30m: function() {
            var $carousels = $('.js-atbs-carousel-2i-30m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 2,
                    margin: 30,
                    nav: true,
                    dots: true,
                    loop: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0: {
                            items: 1,
                        },
                        768: {
                            items: 2,
                        },
                    },
                });
            })
        },

        carousel_3i0m: function() {
            var $carousels = $('.js-carousel-3i0m');
            $carousels.each( function() {
                $(this).owlCarousel({
                    items: 3,
                    margin: 0,
                    loop: true,
                    nav: true,
                    dots: false,
                    smartSpeed: 500,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            dots: true,
                            nav: false,
                        },
                        576 : {
                            items: 1,
                        },
                        768 : {
                            items: 2,
                        },
                        1200 : {
                            items: 3,
                        },
                    },
                });
            })
        },

        carousel_4i0m: function() {
            var $carousels = $('.js-atbs-carousel-4i-0m');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 4,
                    margin: 0,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0: {
                            items: 1,
                        },
                        481 : {
                            items: 2,
                        },
                        768 : {
                            items: 3,
                        },
                        992 : {
                            items: 3,
                        },
                        1200 : {
                            items: 4,
                        },
                        1921 : {
                            items: 6,
                        }
                    },
                });
            })
        },
        carousel_4i30m: function() {
            var $carousels = $('.js-atbs-carousel-4i30m');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 4,
                    margin: 30,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0: {
                            items: 1,
                        },
                        576 : {
                            items: 2,
                        },
                        992 : {
                            items: 3,
                        },
                        1200 : {
                            items: 3,
                        },
                        1546 : {
                            items: 4,
                        }
                    },
                });
            })
        },
        carousel_auto_width: function() {
            var $carousels = $('.js-atbs-carousel-auto-width');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 10,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoWidth: true,
                    // autoHeight: true,
                    // autoplay: false,
                    // autoplayTimeout: 2500,
                    // autoplayHoverPause: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 800,
                    responsive: {
                        0: {
                            margin: 15,
                        },
                        481 : {
                            margin: carousel_margin,
                        }
                    },
                });
            })
        },

        carousel_auto_width_rtl: function() {
            var $carousels = $('.js-atbs-carousel-auto-width-rtl');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 10,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoWidth: true,
                    rtl: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 800,
                    responsive: {
                        0: {
                            margin: 15,
                        },
                        481: {
                            margin: 30,
                        },
                        992: {
                            margin: carousel_margin,
                        },
                    },
                });
            })
        },

        carousel_auto_width_delay: function() {
            var $carousels = $('.js-atbs-carousel-auto-width-delay');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 10,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    autoWidth: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 800,
                    onInitialized  : owl_onInitialized,
                    responsive: {
                        0: {
                            margin: 15,
                        },
                        481 : {
                            margin: carousel_margin,
                        }
                    },
                });
                function owl_onInitialized(event) {
                    var element                     = event.target;
                    var current                     = event.item.index;
                    var owl_items                   = $(element).find(".owl-item");
                    var current_center              = $(element).find(".owl-item").eq(current);
                    var current_center_index        = $(element).find(".owl-item").eq(current).index();
                    var current_center_active       = owl_items[current_center_index];

                    /*Action*/
                    $(current_center).addClass("Animation-Preventive");
                    setTimeout(function () {
                        $(current_center_active).addClass("active_current");
                    },100);
                };
                $(this).on('translate.owl.carousel', function(event) {
                    var element                = event.target;
                    var current                = event.item.index;
                    var current_center         = $(element).find(".owl-item").eq(current);
                    var owl_items              = $(element).find(".owl-item");
                    var owl_item_remove_class  = $(element).find(".owl-item.active_current");
                    var current_center_index   = $(element).find(".owl-item").eq(current).index();
                    var current_center_active  = owl_items[current_center_index];
                    /*Action*/
                    setTimeout(function () {
                        $(owl_item_remove_class).removeClass("active_current Animation-Preventive");
                        $(current_center).addClass("Animation-Preventive");
                        $(current_center_active).addClass("active_current");
                    },100);
                });

            })
        },

        carousel_auto_width_center: function() {
            var $carousels = $('.js-atbs-carousel-auto-width-center');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 3,
                    margin: carousel_margin,
                    nav: true,
                    dots: false,
                    loop: true,
                    autoWidth: true,
                    center: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 800,
                    onInitialized  : owl_onInitialized,
                    responsive: {
                        0: {
                            margin: 30,
                            autoWidth: false,
                            items: 1,
                            nav: false,
                            dots: true,
                        },
                        481: {
                            margin: 30,
                        },
                        992: {
                            margin: carousel_margin,
                        },
                    },
                });
                function owl_onInitialized(event) {
                    var element                     = event.target;
                    var current                     = event.item.index;
                    var owl_items                   = $(element).find(".owl-item");
                    var current_center              = $(element).find(".owl-item").eq(current);
                    var current_center_index        = $(element).find(".owl-item").eq(current).index();
                    var current_center_active       = owl_items[current_center_index];

                    /*Action*/
                    $(current_center).addClass("Animation-Preventive");
                    setTimeout(function () {
                        $(current_center_active).addClass("active_current");
                    },100);
                };
                $(this).on('translate.owl.carousel', function(event) {
                    var element                = event.target;
                    var current                = event.item.index;
                    var current_center         = $(element).find(".owl-item").eq(current);
                    var owl_items              = $(element).find(".owl-item");
                    var owl_item_remove_class  = $(element).find(".owl-item.active_current");
                    var current_center_index   = $(element).find(".owl-item").eq(current).index();
                    var current_center_active  = owl_items[current_center_index];
                    /*Action*/
                    setTimeout(function () {
                        $(owl_item_remove_class).removeClass("active_current Animation-Preventive");
                        $(current_center).addClass("Animation-Preventive");
                        $(current_center_active).addClass("active_current");
                    },100);
                });
                // $(this).on('translate.owl.carousel', function(event) {
                //     var current                = event.item.index;
                //     var owl_items              = $(event.target).find(".owl-item");
                //     var current_center_index   = $(event.target).find(".owl-item").eq(current).index();
                //     var current_center_active  = owl_items[current_center_index];
                //
                //     /*Action*/
                //     for (var i = 0; i < owl_items.length ; i++) {
                //         var owl_item_class = owl_items[i];
                //         if (owl_items[i] != current_center_active) {
                //             var Item_Remove_Class = owl_items[i];
                //             $(Item_Remove_Class).addClass("Remove");
                //             console.log($(owl_item_class).hasClass("active_current"));
                //         }
                //     }
                // });
            })
        },

        carousel_background_below: function() {
            var $carousels = $('.js-atbs-carousel-background-below');
            $carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
                var carousel_margin = parseInt($(this).data('carousel-margin'));
                $(this).owlCarousel({
                    items: 1,
                    margin: carousel_margin,
                    nav: true,
                    dots: true,
                    loop: carousel_loop,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 600,
                    onInitialized  : owl_onInitialized,
                    responsive: {
                        0: {
                            margin: 15,
                        },
                        481 : {
                            margin: carousel_margin,
                        }
                    },
                });

                function owl_onInitialized(event) {
                    var element             = event.target;
                    var current             = event.item.index;
                    var owl_background_img  = $(element).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var src                 = $(event.target).find(".owl-item").eq(current).find("img").attr('src');

                    $(owl_background_img).attr("src", src);
                };
                $(this).on('translate.owl.carousel', function(event) {
                    var current                 = event.item.index;
                    var owl_background_img      = $(this).parents('.owl-carousel-wrap').find('.owl-background a img');
                    var src                     = $(event.target).find(".owl-item").eq(current).find("img").attr('src');

                    $(this).addClass("owl-disable-button");
                    $(owl_background_img).fadeOut(600, function() {
                        $(owl_background_img).attr("src", src);
                    }).fadeIn(600);
                });
                $(this).on('translated.owl.carousel', function(event) {
                    var owl_this = $(this);

                    setTimeout(function () {
                        $(owl_this).removeClass("owl-disable-button");
                    },400)
                });

            })
        },

        carousel_1i_dot_center_number: function() {
            var $carousels = $('.js-atbs-carousel-1i-dot-center-number');
            $carousels.each( function() {
                var $this = $(this);
                var carousel_button_space =  $(this).data('carousel-button-space');
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    nav: true,
                    loop: true,
                    dots: true,
                    lazyLoad: true,
                    smartSpeed:450,
                    navText: ['<i class="mdicon mdicon-chevron-thin-left"></i>', '<i class="mdicon mdicon-chevron-thin-right"></i>'],
                    responsive: {
                        0 : {
                            items: 1,
                            margin: 30,
                        },
                        576 : {
                            items: 2,
                        },
                        992 : {
                            items: 1,
                        },
                    },

                });

                SetButtonNavDot($(this));
                $(window).on('resize' , function () {
                    SetButtonNavDot($this);
                });
                function SetButtonNavDot(event) {
                    // set x
                    var width_button = parseFloat(event.find('.owl-nav .owl-next').css('width'));
                    var width_dots = parseFloat(event.find('.owl-dots').css('width'));
                    var spacing_x_owl_dots = width_button + carousel_button_space;
                    // var spacing_owl_next =  width_button + carousel_button_space + width_dots;
                    var spacing_owl_next =  carousel_button_space + width_dots + carousel_button_space ;
                    // set y
                    var height_button = parseFloat(event.find('.owl-nav .owl-next').css('height'));
                    var height_dots = parseFloat(event.find('.owl-dots').css('height'));
                    var spacing_y_owl_dots =parseFloat( height_button / 2 - height_dots / 2 ) ;
                    if(   window.matchMedia("(max-width: 768px)").matches ){
                        width_button = parseFloat(event.find('.owl-nav .owl-next').css('width'));
                        width_dots = parseFloat(event.find('.owl-dots').css('width'));
                        spacing_x_owl_dots = width_button + 15;
                        // spacing_owl_next =  width_button + 15 + width_dots + 15;
                        spacing_owl_next =   15 + width_dots + 15;

                        height_button = parseFloat(event.find('.owl-nav .owl-next').css('height'));
                        height_dots = parseFloat(event.find('.owl-dots').css('height'));
                        spacing_y_owl_dots =parseFloat( height_button / 2 - height_dots / 2 ) ;
                    }
                    if(event.hasClass("dots-position-right")) {
                        event.find('.owl-dots').css({"right": spacing_x_owl_dots});
                    }
                    else {
                        event.find('.owl-dots').css({"left": spacing_x_owl_dots});
                    }
                    event.find('.owl-dots').css({"bottom": spacing_y_owl_dots});
                    event.find('.owl-nav .owl-next').css({"margin-left": spacing_owl_next});
                    console.log(spacing_owl_next);
                }
            });
        },

        customCarouselNav: function() {
            if ( $.isFunction($.fn.owlCarousel) ) {
                var $carouselNexts = $('.js-carousel-next');
                $carouselNexts.each( function() {
                    var carouselNext = $(this);
                    var carouselID = carouselNext.parent('.atbs-carousel-nav-custom-holder').attr('data-carouselID');
                    var $carousel = $('#' + carouselID);

                    carouselNext.on('click', function() {
                        $carousel.trigger('next.owl.carousel');
                    });
                });

                var $carouselPrevs = $('.js-carousel-prev');
                $carouselPrevs.each( function() {
                    var carouselPrev = $(this);
                    var carouselID = carouselPrev.parent('.atbs-carousel-nav-custom-holder').attr('data-carouselID');
                    var $carousel = $('#' + carouselID);

                    carouselPrev.on('click', function() {
                        $carousel.trigger('prev.owl.carousel');
                    });
                });
            }
        },

        atbs_scroll_element: function() {
            $(function () {
                // Define window variables
                var winScrollTop = $(window).scrollTop();
                var winHeight = window.innerHeight;
                var winWidth = window.innerWidth;

                // Define scene classes.
                var sceneClass = 'scene';
                var sceneActiveClass = sceneClass + '--active';
                var sceneEndedClass = sceneClass + '--ended';

                $(window).on('resize', function () {
                    winHeight = window.innerHeight;
                    winWidth = window.innerWidth;
                });

                // Scene classes function.
                function setScene($el) {

                    // Get bounding values from section.
                    var bounding = $el.data('elDom').getBoundingClientRect();

                    if (bounding.top > winHeight) {

                        // Section is below the viewport.
                        // Section has not ended or started, therefore remove classes.
                        $el.find('.scene').removeClass(sceneActiveClass);
                        $el.find('.scene').removeClass(sceneEndedClass);

                    } else if (bounding.bottom < 0) {

                        // Section is above the viewport.
                        // Section has ended, therefore remove classes.
                        $el.find('.scene').addClass(sceneEndedClass);
                        $el.find('.scene').removeClass(sceneActiveClass);

                    } else {

                        // We're now inside the section, not below or above.
                        // If top of section is at top of viewport, add class active.
                        if (bounding.top <= 0) {
                            $el.find('.scene').addClass(sceneActiveClass);
                        }

                        // If top of section is below top of viewport, remove class active.
                        if (bounding.top > 0) {
                            $el.find('.scene').removeClass(sceneActiveClass);
                        }

                        // If bottom of section is at bottom of viewport, add class ended.
                        if (bounding.bottom <= (winHeight)) {
                            $el.find('.scene').addClass(sceneEndedClass);
                        }

                        // If bottom of section is not at bottom of viewport, remove class ended.
                        if (bounding.bottom > (winHeight)) {
                            $el.find('.scene').removeClass(sceneEndedClass);
                        }
                    }
                }

                // This function sets up the horizontal scroll. This applies data attributes to the section for later use.
                function setUpHorizontalScroll($el) {

                    var sectionClass = $el.attr('class');

                    // Set content wrapper variables & data attributes.
                    var $contentWrapper = $el.find('.' + sectionClass + '__content-wrapper');
                    var contentWrapperDom = $contentWrapper.get(0);
                    $el.data('contentWrapper', $contentWrapper);
                    $el.data('contentWrapperDom', contentWrapperDom);


                    // Set content wrapper scroll width variables & data attributes.
                    var contentWrapperScrollWidth = $el.data('contentWrapperDom').scrollWidth;
                    $el.data('contentWrapperScrollWidth', contentWrapperScrollWidth);

                    // Set right max variables & data attributes.
                    var rightMax = $el.data('contentWrapperScrollWidth') - winWidth;
                    var rightMaxMinus = -(rightMax);
                    $el.data('rightMax', Number(rightMaxMinus));

                    // Set initialized data variable to false do incidate scrolling functionality doesn't work yet.
                    $el.data('initalized', false);

                    // Set height of section to the scroll width of content wrapper.
                    $el.css('height', $el.data('contentWrapperScrollWidth'));
                    // Set data attribute for outerHeight.
                    $el.data('outerHeight', $el.outerHeight());

                    // Set data attribute for offset top.
                    $el.data('offsetTop', $el.offset().top);

                    // Set data initialized data variable to true to indicate ready for functionality.
                    $el.data('initalized', true);

                    // Set data variable for transform X (0 by default)
                    $el.data('transformX', '0');

                    // Add class of init
                    $el.addClass($el.attr('class') + '--init');
                }

                function resetHorizontalScroll($el) {


                    // Update data attribute for content wrapper scroll width.

                    var contentWrapperScrollWidth = $el.data('contentWrapperDom').scrollWidth;
                    $el.data('contentWrapperScrollWidth', contentWrapperScrollWidth);


                    // Update rightMax variables & data attributes.
                    var rightMax = $el.data('contentWrapperScrollWidth') - winWidth;
                    var rightMaxMinus = -(rightMax);
                    $el.data('rightMax', Number(rightMaxMinus));

                    // Update height of section to the scroll width of content wrapper.
                    $el.css('height', $el.data('contentWrapperScrollWidth'));


                    // Update data attribute for outerHeight.
                    $el.data('outerHeight', $el.outerHeight());

                    // Update data attribute for offset top.
                    $el.data('offsetTop', $el.offset().top);

                    // If transform is smaller than rightmax, make it rightmax.
                    if ($el.data('transformX') <= $el.data('rightMax')) {
                        $el.data('contentWrapper').css({
                            'transform': 'translate3d(' + $el.data('rightMax') + 'px, 0, 0)',
                        });
                    }
                }

                var $horizontalScrollSections = $('.horizontal-scroll-section');
                var $horizontalScrollSectionsTriggers = $horizontalScrollSections.find('.trigger');

                // Each function - set variables ready for scrolling functionality. Call horizontal scroll functions on load and resize.
                $horizontalScrollSections.each(function (i, el) {

                    var $thisSection = $(this);

                    $(this).data('elDom', $(this).get(0));

                    // Set up horizontal scrolling data attributes and show section all have been computed.
                    setUpHorizontalScroll($(this));

                    // Now we're ready, call setScene on load that adds classes based on scroll position.
                    setScene($(this));

                    // Resize function
                    $(window).on('resize', function () {
                        // Reset horizontal scrolling data attributes and transform content wrapper if transform is bigger than scroll width.
                        resetHorizontalScroll($thisSection);
                        // Reset scene positioning.
                        setScene($thisSection);
                    });

                });

                function setupHorizontalTriggers($el, section) {
                    var parent = $el.parent();
                    var positionLeft = parent.position().left;
                    var positionLeftMinus = -(positionLeft);
                    var triggerOffset = $el.data('triggerOffset');
                    triggerOffset = !triggerOffset ? 0.5 : triggerOffset = triggerOffset;
                    $el.data('triggerOffset', triggerOffset);
                    $el.data('triggerPositionLeft', positionLeftMinus);
                    $el.data('triggerSection', section);
                }

                function useHorizontalTriggers($el) {
                    if ($el.data('triggerSection').data('transformX') <= ($el.data('triggerPositionLeft') * $el.data('triggerOffset'))) {
                        $el.data('triggerSection').addClass($el.data('class'));
                    } else {
                        if ($el.data('remove-class') !== false) {
                            $el.data('triggerSection').removeClass($el.data('class'));
                        }
                    }
                }

                $horizontalScrollSectionsTriggers.each(function (i, el) {
                    setupHorizontalTriggers($(this), $(this).closest('.horizontal-scroll-section'));
                });

                function transformBasedOnScrollHorizontalScroll($el) {

                    // Get amount scrolled variables.
                    var amountScrolledContainer = winScrollTop - $el.data('offsetTop');
                    var amountScrolledThrough = (amountScrolledContainer / ($el.data('outerHeight') - (winHeight - winWidth)));

                    // Add transform value variable based on amount scrolled through multiplied by scroll width of content.
                    var toTransform = (amountScrolledThrough * $el.data('contentWrapperScrollWidth'));

                    // Add transform value for minus (as we're transforming opposite direction).
                    var toTransformMinus = -(toTransform);

                    // If transform value is bigger or equal than 0, set value to 0.
                    toTransformMinus = Math.min(0, toTransformMinus);

                    // If transform value is smaller or equal than rightMax, set value to rightMax.
                    toTransformMinus = Math.max(toTransformMinus, $el.data('rightMax'));

                    // Update transformX data variable for section.
                    $el.data('transformX', Number(toTransformMinus));

                    // If section has been initalized, apply transform.
                    if ($el.data('initalized') == true) {
                        $el.data('contentWrapper').css({
                            'transform': 'translate3d(' + $el.data('transformX') + 'px, 0, 0)'
                        });
                    }
                }

                //
                $(window).on('scroll', function(){

                    // Get window scroll top.
                    winScrollTop = $(window).scrollTop();

                    // Each function in horizontal scroll sections.
                    $horizontalScrollSections.each(function (i, el) {
                        transformBasedOnScrollHorizontalScroll($(this));
                        setScene($(this));
                    });

                    // Each function for horizontal scroll section triggers.
                    $horizontalScrollSectionsTriggers.each(function (i, el) {
                        useHorizontalTriggers($(this));
                    });

                });

            });
        },

        atbs_navigation_nav_dots_horizontal: function () {
            var el = $('.nav-dots-horizontal');
            el.each(function () {
                var el_current = $(this);
                var nav_next = $(el_current).find('.owl-next');
                var nav_prev = $(el_current).find('.owl-prev');
                var dots = $(el_current).find('.owl-dots > .owl-dot:first-child');
                var dots_count = $(el_current).find('.owl-dots > .owl-dot');

                function calcDots_Nav() {
                    var offset_left = $(dots).get(0).getBoundingClientRect().left - $(el_current).get(0).getBoundingClientRect().left;
                    var offset_right = offset_left + $(dots).get(0).getBoundingClientRect().width * $(dots_count).length ;
                    $(nav_prev).css({"left": offset_left + "px"});
                    $(nav_next).css({"left": offset_right + "px", "right": "auto"});
                    console.log(  $(dots_count).length);
                }
                calcDots_Nav();
                $(window).on("resize",function () {
                    calcDots_Nav();
                })
            });
        },

        /* ============================================================================
	     * Sticky sidebar
	     * ==========================================================================*/
        stickySidebar: function() {
            setTimeout(function() {
                var $stickySidebar = $('.js-sticky-sidebar');
                var $stickyHeader = $('.js-sticky-header');

                var marginTop = ($stickyHeader.length) ? ($stickyHeader.outerHeight() + 20) : 0; // check if there's sticky header
                if ( $.isFunction($.fn.theiaStickySidebar) ) {
                    $stickySidebar.theiaStickySidebar({
                        additionalMarginTop: marginTop,
                        additionalMarginBottom: 20,
                    });
                }
            }, 250); // wait a bit for precise height;
        },
        /* ============================================================================
        * Review Rating
        * ==========================================================================*/
        atbs_accordionButton :function() {
            var accordion = $('.atbs-accordion');
            $(accordion).each(function () {
                var item_current = $(this);
                $(this).find('.atbs-accordion-btn').on('click',function () {
                    var accordion_btn =  $(this).toggleClass('active');
                    var accordion_panel = accordion_btn.parents('.atbs-accordion').find('.atbs-accordion-panel');
                    accordion_panel.toggleClass("active");
                    if (parseInt(accordion_panel.css('max-height')) ) {
                        accordion_panel.css('max-height', 0);
                        accordion_panel.removeClass("active");
                        accordion_btn.removeClass("active");
                    } else {
                        accordion_panel.css('max-height', $(accordion_panel).get(0).scrollHeight + 'px');
                    }
                });
                $(window).on('resize', $.debounce(250, function (e) {
                    var accordion_panel = item_current.find('.atbs-accordion-panel');
                    if ($(accordion_panel).hasClass('active')) {
                        accordion_panel.css('max-height', $(accordion_panel).get(0).scrollHeight + 'px');
                    }

                }));
            });
        },

        /* ============================================================================
        * Review Rating
        * ==========================================================================*/
        reviewRatingStarIcon: function() {
            var reviews_rating_star = $('.atbs-reviews-section');
            reviews_rating_star.each(function () {
                var theCurrentReviewForm = $(this);
                var rating_reviews_list = $(this).find('.rating-form');
                $(rating_reviews_list).each(function () {
                    var star_score_icon = $(this).find('.star-item');
                    star_score_icon.on('click',function () {
                        $(star_score_icon).removeClass("active");
                        var star_score_value = $(this).index();
                        $(this).parents('.rating-star').siblings('.user-star-rating').attr('value', 5 - star_score_value);
                        star_score_icon.each(function () {
                            if ($(this).index() >= star_score_value){
                                //console.log($(this).index());
                                $(this).addClass("active");
                            }
                        })
                    });
                });
            });
        },
        reviewScoreList: function(){
            var reviews_rating_score = $('.atbs-reviews-section');
            reviews_rating_score.each(function () {
                var score_list_item = $(this).find(".score-item");
                $(score_list_item).each(function () {
                    var percent = parseFloat( $(this).data('total') );
                    var percent_default = 0;
                    var score_item = setInterval(frame, 0  );
                    var $this = $(this);
                    function frame() {
                        if (percent_default >= percent) {
                            clearInterval(score_item);
                        } else {
                            percent_default++;
                            $this.find(".score-percent").css({"width": percent_default +'%'});
                            $this.find(".score-number").text(percent_default / 10);
                            // console.log(percent_default);
                        }
                    }
                });
            });
        },
        reviewScoreProgress: function(){
            var element = $('.review-count-percent');
            element.each(function () {
                var $this = $(this);
                var progressValue = $(this).find('.progress-score__value');
                var data_score = parseFloat($(this).data('progress-score')) * 10;

                var RADIUS = 48;
                var CIRCUMFERENCE = 2 * Math.PI * RADIUS;
                $(progressValue).css({'stroke-dasharray' : CIRCUMFERENCE });
                progress(data_score);
                function progress(value) {
                    var progress = value / 100;
                    var dashoffset = CIRCUMFERENCE * (1 - progress);
                    // $(progressValue).css({'--data-review-score': 'red' });
                    $(progressValue).css({'stroke-dashoffset': dashoffset });
                    // $(progressValue).style.setProperty('--data-review-score', 'red');
                }
            });
        },
        textFadeLimit: function(){
            var element = $('.text-line-limit-fade');
            element.each(function () {
                var $this = $(this);
                /*limit height and opacity excerpt*/
                var element_context = $(this).find('.line-limit-default');

                var height_context = $(element_context).height();
                var line_height_context  = parseInt($(element_context).css('line-height'));
                var limit_height_context = line_height_context * 2;
                if( height_context > limit_height_context){
                    $this.addClass("show-btn-more");
                    $(element_context).addClass("line-limit-fade");
                }
                /*unlimited height excerpt*/
                var element_btn_toggle = $($this).find('.btn-line-limit-fade');
                element_btn_toggle.on('click',function () {
                    $(element_btn_toggle).find('span').toggleClass('active');
                    if ( !$(element_context).hasClass('line-limit-fade')) {
                        $(element_context).removeClass("line-show-full");
                        $(element_context).css('max-height', limit_height_context + 'px');
                        $(element_context).addClass("line-limit-fade");
                    } else {
                        $(element_context).addClass("line-show-full");
                        $(element_context).css('max-height', $(element_context).get(0).scrollHeight + 'px');
                        $(element_context).removeClass("line-limit-fade");
                    }
                });

                $(window).on('resize', $.debounce(250, function (e) {
                    if ( $(element_context).hasClass('line-show-full')) {
                        $(element_context).css('max-height',  $(element_context).get(0).scrollHeight + 'px');
                    }

                }));
            });
        },
        /* ============================================================================
        * Dark Mode & Light Mode
        * ==========================================================================*/
        atbs_theme_switch: function () {
            var theme_penal_localStorage = [];
            var theme_mode = $('.atbs-theme-switch');
            var theme_penal = $('.site-wrapper');
            $(function () {
                if (localStorage.theme_penal_localStorage) {
                    theme_penal_localStorage = JSON.parse(localStorage.theme_penal_localStorage);
                    load_data();
                }
            });
            theme_mode.each(function () {
                $(this).on('click',function () {
                    $(this).toggleClass("active");
                    var theme_mode_status = {};
                    theme_mode_status.status = 'true';
                    addModeStatus(theme_mode_status);
                });
                function addModeStatus(theme_mode_status) {
                    var status = theme_mode_status.status;
                    var item = {Status : status};
                    theme_penal_localStorage.push(item);
                    saveStatus();
                    if(theme_penal_localStorage.length >= 2) {
                        localStorage.removeItem("theme_penal_localStorage");
                        theme_penal_localStorage = [];
                    }
                }
                function saveStatus() {
                    if (window.localStorage) {
                        localStorage.theme_penal_localStorage = JSON.stringify(theme_penal_localStorage);
                        $(theme_penal).toggleClass('atbs-dark-mode');
                    }
                }
            });
            function load_data() {
                var status = theme_penal_localStorage[0];
                if (status["Status"] == 'true') {
                    $(theme_penal).addClass('atbs-dark-mode');
                    $(theme_mode).addClass("active");
                }

            }
        },

        /* ============================================================================
        * Bookmark
        * ==========================================================================*/
        atbs_bookmark: function () {
            var post_button_bookmark = $('.post-button-bookmark');
            post_button_bookmark.each(function () {
                $(this).on('click',function () {
                    var btn_bookmark_status = $(this).find('.btn-bookmark');
                    $(btn_bookmark_status).toggleClass('active');
                });
            });
        },


        /**/

        atbs_scrolltop_default: function () {
            var el = $(".scroll-default");
            el.each(function () {
                var data_scroll = $(this).data('scroll');
                $(this).scrollTop(data_scroll);
            });
        }
    };

    ATBS.documentOnLoad = {

        init: function() {
            ATBS.header.smartAffix.compute(); //recompute when all the page + logos are loaded
            ATBS.header.smartAffix.updateState(); // update state
            ATBS.documentOnReady.stickySidebar();
        }

    };

    /* ============================================================================
     * Priority+ menu
     * ==========================================================================*/
    ATBS.priorityNav = function($menu) {
        var $btn = $menu.find('button');
        var $menuWrap = $menu.find('.navigation');
        var $menuItem = $menuWrap.children('li');
        var hasMore = false;

        if(!$menuWrap.length) {
            return;
        }

        function calcWidth() {
            if ($menuWrap[0].getBoundingClientRect().width === 0)
                return;

            var navWidth = 0;

            $menuItem = $menuWrap.children('li');
            $menuItem.each(function() {
                navWidth += $(this)[0].getBoundingClientRect().width;
            });

            if (hasMore) {
                var $more = $menu.find('.priority-nav__more');
                var moreWidth = $more[0].getBoundingClientRect().width;
                var availableSpace = $menu[0].getBoundingClientRect().width;

                //Remove the padding width (assumming padding are px values)
                availableSpace -= (parseInt($menu.css("padding-left"), 10) + parseInt($menu.css("padding-right"), 10));
                //Remove the border width
                availableSpace -= ($menu.outerWidth(false) - $menu.innerWidth());

                if (navWidth > availableSpace) {
                    var $menuItems = $menuWrap.children('li:not(.priority-nav__more)');
                    var itemsToHideCount = 1;

                    $($menuItems.get().reverse()).each(function(index){
                        navWidth -= $(this)[0].getBoundingClientRect().width;
                        if (navWidth > availableSpace) {
                            itemsToHideCount++;
                        } else {
                            return false;
                        }
                    });

                    var $itemsToHide = $menuWrap.children('li:not(.priority-nav__more)').slice(-itemsToHideCount);

                    $itemsToHide.each(function(index){
                        $(this).attr('data-width', $(this)[0].getBoundingClientRect().width);
                    });

                    $itemsToHide.prependTo($more.children('ul'));
                } else {
                    var $moreItems = $more.children('ul').children('li');
                    var itemsToShowCount = 0;

                    if ($moreItems.length === 1) { // if there's only 1 item in "More" dropdown
                        if (availableSpace >= (navWidth - moreWidth + $moreItems.first().data('width'))) {
                            itemsToShowCount = 1;
                        }
                    } else {
                        $moreItems.each(function(index){
                            navWidth += $(this).data('width');
                            if (navWidth <= availableSpace) {
                                itemsToShowCount++;
                            } else {
                                return false;
                            }
                        });
                    }

                    if (itemsToShowCount > 0) {
                        var $itemsToShow = $moreItems.slice(0, itemsToShowCount);

                        $itemsToShow.insertBefore($menuWrap.children('.priority-nav__more'));
                        $moreItems = $more.children('ul').children('li');

                        if ($moreItems.length <= 0) {
                            $more.remove();
                            hasMore = false;
                        }
                    }
                }
            } else {
                var $more = $('<li class="priority-nav__more"><a href="#"><span>More</span><i class="mdicon mdicon-more_vert"></i></a><ul class="sub-menu"></ul></li>');
                var availableSpace = $menu[0].getBoundingClientRect().width;

                //Remove the padding width (assumming padding are px values)
                availableSpace -= (parseInt($menu.css("padding-left"), 10) + parseInt($menu.css("padding-right"), 10));
                //Remove the border width
                availableSpace -= ($menu.outerWidth(false) - $menu.innerWidth());

                if (navWidth > availableSpace) {
                    var $menuItems = $menuWrap.children('li');
                    var itemsToHideCount = 1;

                    $($menuItems.get().reverse()).each(function(index){
                        navWidth -= $(this)[0].getBoundingClientRect().width;
                        if (navWidth > availableSpace) {
                            itemsToHideCount++;
                        } else {
                            return false;
                        }
                    });

                    var $itemsToHide = $menuWrap.children('li:not(.priority-nav__more)').slice(-itemsToHideCount);

                    $itemsToHide.each(function(index){
                        $(this).attr('data-width', $(this)[0].getBoundingClientRect().width);
                    });

                    $itemsToHide.prependTo($more.children('ul'));
                    $more.appendTo($menuWrap);
                    hasMore = true;
                }
            }
        }

        $window.on('load webfontLoaded', calcWidth );
        $window.on('resize', $.throttle( 50, calcWidth ));
    }

    $document.ready( ATBS.documentOnReady.init );
    $window.on('load', ATBS.documentOnLoad.init );
    $window.on( 'resize', ATBS.documentOnResize.init );

})(jQuery);
