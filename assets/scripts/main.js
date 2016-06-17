var $steps;

mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VzdGF2cHVyc2NoZSIsImEiOiJhVVRUaFV3In0.IdUObuDS1u0tzNNDvNpfKg';

var nextSlide = function() {
  var $currentSlide = $steps.filter('.step--active');
  var $nextSlide = $currentSlide.next('.step');

  if($nextSlide.length) {
    gotoSlide($nextSlide.data('url'));
  }
};

var prevSlide = function() {
  var $currentSlide = $steps.filter('.step--active');
  var $nextSlide = $currentSlide.prev('.step');

  if($nextSlide.length) {
    gotoSlide($nextSlide.data('url'));
  }
};

var gotoSlide = function(slug) {
  var $targetSlide;
  var $currentSlide = $steps.filter('.step--active');

  if(!slug) {
    $targetSlide = $steps.eq(0);
    return $targetSlide.data('step').init();
  } else {
    $targetSlide = $steps.filter('[data-url="' + slug + '"]');

    if($targetSlide.length) {
      $currentSlide.data('step').destroy(function() {
        $targetSlide.data('step').init();
      });
    }
  }
};

var enableFullscreenButton = function() {
  /* Fullscreen API not available */
  if(!screenfull.enabled) {
    $('.header__button').addClass('header__button--is-hidden');
  } else {
    $('.js-toggle-fullscreen').on('click', function(e) {
      e.preventDefault();

      if (screenfull.enabled) {
        screenfull.request();
      }
    });
  }
};

$(function() {
  $steps = $('.step');

  $.each($steps, function(index) {
    var $this = $(this);

    $this.data('step', new Step($this, {'$steps': $steps}));
    $this.css('z-index', $steps.length - index);
  });

  $('.js-navigation')
    .on('click.navigation', '.navigation__link', function(e) {
      e.preventDefault();
      var target = $(this).attr('href');
      gotoSlide(target);
    });

  enableFullscreenButton();

  $('.js-step-goto').on('click', function(e) {
    e.preventDefault();

    var targetId = $(this).data('target');

    gotoSlide($(this).attr('href'));
  });

  if(history) {
    var currentUrl = window.location.href;
    var urlParts = currentUrl.split('/');
    var lastUrlPart = urlParts[urlParts.length - 1];

    if(!lastUrlPart) {
      return gotoSlide();
    }

    $.each($steps, function() {
      var $step = $(this);

      if($step.data('url') === lastUrlPart) {
        gotoSlide($step.data('url'));
        return false;
      }
    });
  }

  $(window).on('keydown', function(e) {
    switch(e.which) {
      case 39:
        nextSlide();
        break;
      case 37:
        prevSlide();
        break;
    }
  });
});
