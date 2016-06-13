window.HELP_IMPROVE_VIDEOJS = false;
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

    if(history) {
      //history.pushState(undefined, undefined, $(this).attr('href'));
    }

    if(targetId) {
      var timeline = new TimelineLite({
        onComplete: function() {
          $steps.filter('.step--active').data('step').destroy();
          $steps.eq(targetId).data('step').init();
        },
      });

      timeline.add(
        TweenLite.to($steps.filter('.step--active').get(0), 1, {
          ease: Power1.easeIn,
          delay: 0.1,
          opacity: 0,
        })
      );

      timeline.play();
    }
  });
});
