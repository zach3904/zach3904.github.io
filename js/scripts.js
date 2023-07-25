var zr = {
    
    init: function() {
        zr.onLoadResize();
        zr.listeners();
        zr.smoothScrollTo();
        zr.webItems();
        zr.photoItems();
        zr.isVisible();
        zr.webDetail();
    },
    
    options: {
        fadeInSpeed: 500,
        scrollSpeed: 900,
        delay: 150
    },
    
    //Adds margin to bottom of the content column allowing
    //info to scroll enough and line up with top edge of logo
    //on load and resize
    onLoadResize: function() {
        var $body = $('body');

        $(window).on('load resize', function() {
            var addedMargin = window.innerHeight - $('.contact').height();
            $('.contact').css('margin-bottom', addedMargin);

            zr.isVisible();
        });
    },

    listeners: function () {
        // Toggle fullscreen
        var fullscreen = false;

        $('#toggleFullscreen').on('click', function (e) {
            fullscreen = !fullscreen;
            
            $(this).toggleClass('icon-expand', !fullscreen);
            $(this).toggleClass('icon-contract', fullscreen);

            if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        });
    },
    
    //Smooth scrolling between sections
    smoothScrollTo: function() {
        $('.scroll').click(function(event){
            //prevent the default action for the click event
            event.preventDefault();
             
            //get the full url - like mysitecom/index.htm#home
            var full_url = this.href;
             
            //split the url by # and get the anchor target name - home in mysitecom/index.htm#home
            var parts = full_url.split('#');
            var trgt = parts[1];
             
            //get the top offset of the target anchor
            var target_top = $('.' + trgt).offset().top;
            
            //goto anchor by setting the body scroll top to anchor top
            $('html, body').animate({scrollTop: target_top}, zr.options.scrollSpeed, 'easeInOutQuad');
                
            zr.updateNav(trgt);
            
            //Adds anchor name to url with delay based on easing time
            function setUrlDelay(hashFrag, setDelay) {
                function setUrl() {
                    location.hash = hashFrag;
                };
                setDelay = zr.options.scrollSpeed + zr.options.delay;
                setTimeout(setUrl, setDelay);
            };
            setUrlDelay(trgt, zr.options.scrollSpeed);
        });
    },
    
    isVisible: function() {
        var elements = [];
        
        $('.content > div').each(function(i) {
            var element = {
                name: this.className,
                top: this.offsetTop - 70,
                bottom: this.offsetTop + this.offsetHeight
            };

            elements.push(element);
        });
        
        $(window).scroll($.throttle(zr.options.delay, scrollUpdate));
        
        function scrollUpdate() {
            var scrollLocation = window.scrollY;

            $.each(elements, function(i, dimension) {
                if (scrollLocation > dimension.top && scrollLocation < dimension.bottom) {
                    zr.updateNav(this.name);
                }
            });
        }
        
        //Call scroll update on initial load
        scrollUpdate();
    },
    
    //Updates nav and url
    updateNav: function(target) {
        //Switches active states of buttons in main nav when clicked
        $('nav .active').removeClass('active');
        $('.' + target + 'Nav > a').addClass('active');
    },

    // Format JSON content with EJS templates for web thumbnails
    photoItems: function () {
        var template = new EJS({ url: 'js/templates/photo-items.ejs' }).render(content);
        $('.photo .thumbnails').html(template);

        $('.photo .thumbnails li a').fancybox({
            nextEffect: 'fade',
            prevEffect: 'fade',
            nextSpeed: 'slow',
            prevSpeed: 'slow'
        });
    },

    // Format JSON content with EJS templates for web thumbnails
    webItems: function () {
        var template = new EJS({ url: 'js/templates/web-items.ejs' }).render(content);
        $('.web .thumbnails').html(template);
    },

    webDetail: function () {
        // Cache template for smooth loading
        var template = new EJS({ url: 'js/templates/web-detail.ejs' });

        $('.web').on('click', '.thumbnails li', function (e) {
            e.preventDefault();

            var projectID = $(this).attr('data-projectID');
            var $body = $('body');
            var html = template.render(content.webProjects[projectID]);

            if (e.target.className === 'view-details') {
                $body.addClass('web-detail-open');

                // Show modal
                $.fancybox(html, {
                    autoSize: false,
                    height: 420,
                    width: 940,
                    wrapCSS: 'web-modal',

                    afterClose: function () {
                        $body.removeClass('web-detail-open');
                    }
                });
            } else if (window.innerWidth < 1024) {
                $body.addClass('web-detail-open');

                var $overlay = $('.web-detail-overlay'),
                    $overlayContent = $('.web-detail-overlay .web-detail-content');

                $overlay.removeClass('hidden').addClass('visible');
                $overlayContent.html(html);

                $('.web-detail-overlay .close-overlay').on('click', function (e) {
                    $overlay.removeClass('visible').addClass('hidden');
                });
                
                $overlay.on('transitionend', function (e) {
                    if ($overlay.hasClass('hidden')) {
                        $body.removeClass('web-detail-open');
                        $overlayContent.html('');
                    }
                });

            }

            // Init slider if needed, else hide carousel controls
            if (content.webProjects[projectID].imgCount > 1) {
                $('#slider').slidesjs({
                    height: 456,
                    width: 800,
                    navigation: {
                        active: true
                    },
                    pagination: {
                        active: true
                    },
                    play: {
                        auto: true,
                        pauseOnHover: true
                    }
                });
            }
        });
    }

};

$(function () {
    zr.init();
});