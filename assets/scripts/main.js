var $steps;

var nextSlide = function() {
  var $currentSlide = $steps.filter('.step--active');
  var currentSlideId = $currentSlide.index();
  var $nextSlide = $steps.eq(currentSlideId + 1);

  $currentSlide.data('step').destroy();
  $nextSlide.data('step').init();
};

var prevSlide = function() {
  var $currentSlide = $steps.filter('.step--active');
  var currentSlideId = $currentSlide.index();
  var $nextSlide = $steps.eq(currentSlideId - 1);

  $currentSlide.data('step').destroy();
  $nextSlide.data('step').init();
};

$(() => {
  var hammertime = new Hammer($('.app').get(0), {});
  $steps = $('.step');

  $.each($steps, function(index) {
    var $this = $(this);
    $this.data('step', new Step($this));

    $this.css('z-index', $steps.length - index);
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

    if(targetId) {
      $steps.filter('.step--active').data('step').destroy(function() {
        $steps.eq(targetId).data('step').init();
      });
    }
  });

  if(history) {
    var currentUrl = window.location.href;
    var urlParts = currentUrl.split('/');
    var lastUrlPart = urlParts[urlParts.length - 1];

    $.each($steps, function() {
      var $step = $(this);

      if($step.data('url') === lastUrlPart) {
        $steps.filter('.step--active').data('step').destroy();
        $step.data('step').init();
      }
    });

  }
});
