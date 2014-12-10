/**
 *  @author Alex Franzelin
 *  @license Mit License
 *  @version 0.5
 *
 *  jQuery slider plugin, written for encaleo
 **/
(function($) {
    var efslider = function() {
        "use strict";
        
        this.settings = {
            arrows: true,
            arrowPrev: '&lt;',
            arrowNext: '&gt;',
            dots: false,
            pageNum: true,
            start: 1,
            autoplay: false,
            loop: false,
            speed: 500,
            keyboard: false,
            interval: 3000,
            fluid: false,
            onSlideComplete: function(num) {}
        };
        
        this.$this = false;
        this.$container = false;
        this.$items = false;
        this.current = false;
        this.total = false;
        this.width = false;
        this.locked = false;
        
        // Reference to this
        var $self = this;
        
        this.dots = function() {
            var dots = '<div class="efSliderDots">';
            
            for(var i=1;i<=this.total;i++) {
                dots += '<a href="#" class="dot dot-'+i+'';
                dots += i == this.current ? ' current' : '';
                dots += '" data-num="'+i+'"></a>';
            }
            
            dots += '</div>';
            return dots;
        };
        
        // Init the slider
        this.init = function(el, options) {
            // Set defaults & options
            this.settings = $.extend(this.settings, options);
            this.$this = el;
            this.$container = this.$this.parent();
            this.$items = this.$this.children();
            this.current = this.settings.start;
            this.total = this.$items.length;
            this.width = this.$container.width();
            this.locked = false;
            
            if(this.settings.fluid == true) {
                $(window).on('resize', function() {
                    $self.width = $self.$container.width();
                    $self.$container.find('.efSlider .slides').css({width: ($self.width * $self.total)+'px', left: -$self.width+'px'});
                    $self.$container.find('.efSlider .slides > div').css({width: $self.width+'px'});
                });
            }
            
            // Append the basic markup..
            this.$container.append('<div class="efSlider"><div class="controls"></div><div class="slides"></div><div class="items" style="display: none;">'+this.$items.html()+'</div>');
            // ..and hide the original content
            this.$this.hide();
            
            if(this.settings.arrows == true) {
                this.$container.children('.efSlider').children('.controls').append('<a href="#" class="arrow prev">'+this.settings.arrowPrev+'</a><a href="#" class="arrow next">'+this.settings.arrowNext+'</a>');
                
                if(this.current == 1 && this.settings.loop == false) {
                    this.$container.find('.controls .arrow.prev').addClass('inactive');
                }
                else if(this.current == this.total && this.settings.loop == false) {
                    this.$container.find('.controls .arrow.next').addClass('inactive');
                }
            }
            
            if(this.settings.dots == true) {
                this.$container.children('.efSlider').children('.controls').append(this.dots());
            }
            
            if(this.settings.pageNum == true) {
                var pageNum = '<div class="pageNum">'+this.current+' of '+this.total+'</div>';  // Todo: i18n
                this.$container.children('.efSlider').children('.controls').append(pageNum);
            }
            
            var item = this.$this.children().eq(this.current-1);
            this.$container.children('.efSlider').children('.slides').html('<div class="prev"></div><div class="current">'+item.html()+'</div><div class="next"></div>');
            
            this.$container.find('.efSlider .slides').css({width: (this.width * 3)+'px', left: -this.width+'px'});
            this.$container.find('.efSlider .slides > div').css({width: this.width+'px'});
            
            if(this.settings.autoplay == true) {
                window.setInterval(this.slideTo, this.settings.interval);
            }
            
            if(this.settings.keyboard == true) {
                $(document).on('keyup', function(e) {
                    if (e.keyCode == 37) {
                        $self.slideTo('prev');
                    }
                    else if (e.keyCode == 39) {
                        $self.slideTo('next');
                    }
                });
            }
            
            // Arrow navigation
            $('body').on('click', '.efSlider .arrow', function(e) {
                e.preventDefault();
                
                if($(this).hasClass('next')) {
                    $self.slideTo();
                }
                else {
                    $self.slideTo('prev');
                }
            });
            
            // Dot navigation
            $('body').on('click', '.efSliderDots .dot', function(e) {
                e.preventDefault();
                
                $self.slideTo($(this).data('num'));
            });
        };
        
        // Update the controls
        this.updateControls = function(num) {
            if(this.settings.arrows == true) {
                if(num == 1) {
                    this.$container.find('.efSlider .arrow.prev').addClass('inactive');
                }
                else {
                    this.$container.find('.efSlider .arrow.prev').removeClass('inactive');
                }
                
                if(num == this.total){
                    this.$container.find('.efSlider .arrow.next').addClass('inactive');
                }
                else {
                    this.$container.find('.efSlider .arrow.next').removeClass('inactive');
                }
            }
            
            if(this.settings.dots == true) {
                this.$container.find('.efSlider .controls .efSliderDots a').removeClass('current');
                this.$container.find('.efSlider .controls .efSliderDots .dot-'+num).addClass('current');
            }
            
            if(this.settings.pageNum == true) {
                this.$container.find('.efSlider .controls .pageNum').html(num+' of '+this.total);
            }
        };
        
        this.slideTo = function(num) {
            if($self.locked == false) {
                $self.locked = true;
            }
            else {
                return;
            }
            
            if(typeof num == 'undefined' || num == 'next') {
                num = $self.current + 1;
            }
            else if(num == 'prev') {
                num = $self.current - 1;
            }
            
            if(num < 1) {
                if($self.settings.loop == false) {
                    $self.locked = false;
                    num = 1;
                    return;
                }
                
                num = $self.total;
            }
            else if(num > $self.total) {
                if($self.settings.loop == false) {
                    $self.locked = false;
                    num = $self.total;
                    return;
                }
                
                num = 1;
            }
            
            var item = $self.$this.children().eq(num-1);
            var items = $self.$container.find('.efSlider .slides');
            
            if(num > $self.current) {
                items.children('.next').html(item.html());
                $self.updateControls(num);
                
                $self.$container.find('.efSlider .slides').stop().animate({left: -($self.width*2)+'px'}, $self.settings.speed, function() {
                    $self.locked = false;
                    $self.current = num;
                    items.children('.prev').remove();
                    $self.$container.find('.efSlider .slides').css({left: -$self.width+'px'});
                    items.children('.current').removeClass('current').addClass('prev');
                    items.children('.next').removeClass('next').addClass('current');
                    items.append('<div class="next" style="width: '+$self.width+'px"></div>');
                    $self.settings.onSlideComplete(num);
                });
            }
            else if(num < $self.current) {
                items.children('.prev').html(item.html());
                $self.updateControls(num);
                
                $self.$container.find('.efSlider .slides').stop().animate({left: '0px'}, $self.settings.speed, function() {
                    $self.locked = false;
                    $self.current = num;
                    items.children('.next').remove();
                    $self.$container.find('.efSlider .slides').css({left: -$self.width+'px'});
                    items.children('.current').removeClass('current').addClass('next');
                    items.children('.prev').removeClass('prev').addClass('current');
                    items.prepend('<div class="prev" style="width: '+$self.width+'px"></div>');
                    $self.settings.onSlideComplete(num);
                });
            }
        };
    };
    
    $.fn.efSlider = function(options) {
        return this.each(function() {
            return new efslider().init($(this), options);
        });
    };
    
    window.efSlider = efslider;
}(jQuery));