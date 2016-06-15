var $steps;

mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VzdGF2cHVyc2NoZSIsImEiOiJhVVRUaFV3In0.IdUObuDS1u0tzNNDvNpfKg';

var nextSlide = function() {
  var $currentSlide = $steps.filter('.step--active');
  var currentSlideId = $currentSlide.index();
  var $nextSlide = $steps.eq(currentSlideId + 1);

  $currentSlide.data('step').destroy(function() {
    $nextSlide.data('step').init();
  });
};

var prevSlide = function() {
  var $currentSlide = $steps.filter('.step--active');
  var currentSlideId = $currentSlide.index();
  var $nextSlide = $steps.eq(currentSlideId - 1);

  $currentSlide.data('step').destroy(function() {
    $nextSlide.data('step').init();
  });
};

var gotoSlide = function(slug) {
  var $targetSlide = $steps.filter('[data-url="' + slug + '"]');
  var $currentSlide = $steps.filter('.step--active');

  if($targetSlide.length) {
    $currentSlide.data('step').destroy(function() {
      $targetSlide.data('step').init();
    });
  }
};

$(() => {
  var hammertime = new Hammer($('.app').get(0), {});
  $steps = $('.step');

  $.each($steps, function(index) {
    var $this = $(this);
    var $progressLink = $('<a/>')
      .attr({
        href: $this.data('url'),
      })
      .addClass('header__progress-step')
      .css({
        left: ((index / $steps.length) * 100) + '%',
      });

    $this.data('step', new Step($this, {'$steps': $steps}));

    $this.css('z-index', $steps.length - index);

    $progressLink.on('click', function(e) {
      e.preventDefault();
      gotoSlide($(this).attr('href'));
    })

    $('.header__progress').append($progressLink);
  });

  hammertime.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });

  hammertime.on('swipe', function(e) {
  	if(e.deltaX < 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  });

  $('.js-toggle-fullscreen').on('click', function(e) {
    e.preventDefault();

    if (screenfull.enabled) {
        screenfull.request();
    }
  });

  $('.js-step-goto').on('click', function(e) {
    e.preventDefault();

    var targetId = $(this).data('target');

    gotoSlide($(this).attr('href'));
  });

  if(history) {
    var currentUrl = window.location.href;
    var urlParts = currentUrl.split('/');
    var lastUrlPart = urlParts[urlParts.length - 1];

    $.each($steps, function() {
      var $step = $(this);

      if($step.data('url') === lastUrlPart) {
        gotoSlide($step.data('url'));
      }
    });
  }
});
