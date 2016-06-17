var Application = function($steps) {
  this.$steps = $steps;

  this.initBindings();
  this.initSteps($steps);
  this.enableFullscreenButton();
  this.enableHistorySupport();
};

Application.prototype = {
  nextSlide: function() {
    var $currentSlide = this.$steps.filter('.step--active');
    var $nextSlide = $currentSlide.next('.step');

    if($nextSlide.length) {
      this.gotoSlide($nextSlide.data('url'));
    }
  },

  prevSlide: function() {
    var $currentSlide = this.$steps.filter('.step--active');
    var $nextSlide = $currentSlide.prev('.step');

    if($nextSlide.length) {
      this.gotoSlide($nextSlide.data('url'));
    }
  },

  gotoSlide: function(slug) {
    var $targetSlide;
    var $currentSlide = this.$steps.filter('.step--active');

    if(!slug) {
      $targetSlide = this.$steps.eq(0);
      return $targetSlide.data('step').init();
    } else {
      $targetSlide = this.$steps.filter('[data-url="' + slug + '"]');

      if($targetSlide.length) {
        $currentSlide.data('step').destroy(function() {
          $targetSlide.data('step').init();
        });
      }
    }
  },

  enableFullscreenButton: function() {
    /* Fullscreen API not available */
    if(!screenfull.enabled) {
      $('.header__button')
        .addClass('header__button--is-hidden');
    } else {
      $('.js-toggle-fullscreen')
        .on('click', function(e) {
          e.preventDefault();

          if (screenfull.enabled) {
            screenfull.request();
          }
        });
    }
  },

  enableHistorySupport: function() {
    if(!history) {
      return;
    }

    var self = this;
    var currentUrl = window.location.href;
    var urlParts = currentUrl.split('/');
    var lastUrlPart = urlParts[urlParts.length - 1];

    if(!lastUrlPart) {
      this.gotoSlide();
    } else {
      $.each(this.$steps, function() {
        var $step = $(this);

        if($step.data('url') === lastUrlPart) {
          self.gotoSlide($step.data('url'));
          return false;
        }
      });
    }
  },

  initSteps: function() {
    var self = this;

    $.each(this.$steps, function(index) {
      var $this = $(this);

      $this.data('step', new Step($this, {'$steps': $steps}));
      $this.css('z-index', self.$steps.length - index);
    });
  },

  initBindings: function() {
    var self = this;

    $(window)
      .on('keydown.main', function(e) {
        switch(e.which) {
          case 39:
            self.nextSlide();
            break;
          case 37:
            self.prevSlide();
            break;
        }
      })
      .on('swiperight.main swipedown.main', function() {
        self.prevSlide();
      })
      .on('swipeleft.main swipeup.main', function() {
        self.nextSlide();
      });

    $('.js-step-goto')
      .on('click', function(e) {
        e.preventDefault();
        self.gotoSlide($(this).attr('href'));
      });
  }
};
