var Step = function($el, options) {
  this.$el = $el;
  this.options = options;
};

Step.prototype = {
  init: function() {
    this.$el.addClass('step--active');

    if(history) {
      history.pushState(undefined, undefined, this.$el.data('url'));
    }

    this._addBindings();
    this._initVideos();
    this._initMaps();
    this._updateProgress();
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

  _initMaps: function() {
    var self = this;
    var $maps = this.$el.find('.js-map');

    $.each($maps, function() {
      var $map = $(this);
      self.map = new mapboxgl.Map({
        center: [
          -9.631307,
          24.146892
        ],
        container: $map.get(0),
        style: 'mapbox://styles/mapbox/dark-v9',
        zoom: 2.5,
      });
    });
  },

  _updateProgress: function() {
    var index = this.options.$steps.index();
    var stepsLength = this.options.$steps.length;
    var $progress = $('.header__progress');

    $progress.css('width', (stepsLength / index) + '%');
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
