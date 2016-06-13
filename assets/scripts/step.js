var Step = function($el) {
  this.$el = $el;
};

Step.prototype = {
  init: function() {
    this.$el.addClass('step--active');

    if(history) {
      history.pushState(undefined, undefined, this.$el.data('url'));
    }

    this._addBindings();
    this._initVideos();
  },

  _addBindings: function() {

  },

  _initVideos: function() {
    var self = this;
    var $videos = this.$el.find('.js-video');

    $.each($videos, function() {
      var $video = $(this);

      if($video.hasClass('js-video-play')) {
        $video.get(0).play();
      }

      $video.get(0).addEventListener('ended', function() {
        nextSlide();
      });
    });
  },

  destroy: function(cb) {
    var self = this;
    var timeline = new TimelineLite({
      onComplete: function() {
        self.$el.removeClass('step--active');

        if(typeof(cb) === 'function') {
          cb();
        }
      },
    });

    timeline.add(
      TweenLite.to(self.$el.get(0), 1.5, {
        ease: Power1.easeOut,
        delay: 0.1,
        opacity: 0,
      })
    );

    timeline.play();
  },
};
