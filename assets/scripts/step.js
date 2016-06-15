var Step = function($el, options) {
  this.$el = $el;
  this.options = options;
};

Step.prototype = {
  init: function() {
    this.$el.addClass('step--active');

    if(history) {
      var url = this.$el.data('url');

      if(url === 'intro') {
        url = '';
      }

      history.pushState(undefined, undefined, url);
    }

    this._initVideos();
    this._initMaps();
    this._updateProgress();
  },

  _initVideos: function() {
    var self = this;
    var $videos = this.$el.find('.js-video');

    $.each($videos, function() {
      var $video = $(this);

      if($video.hasClass('js-video-play')) {
        self.video = videojs($video.get(0), {controls: true}, function() {
          this.play();
        });
      }

      self.video.on('ended', function() {
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
          22.708734,
          7.099980,
        ],
        container: $map.get(0),
        interactive: false,
        style: 'mapbox://styles/mapbox/dark-v9',
        zoom: 2,
      });

      self.map.on('load', function() {
        setTimeout(function() {
          self.map.easeTo({
            center: [
              33.901221,
              -13.363024,
            ],
            zoom: 5.5,
          });
        }, 3000);
      });
    });
  },

  _updateProgress: function() {
    var index = this.$el.index();
    var stepsLength = this.options.$steps.length;
    var $progress = $('.header__progress-bar');

    if(index === 0) {
      index = 1;
    } else {
      index = index - 1;
    }

    $progress.css('width', 'calc(' + ((index / stepsLength) * 100) + '% + .5rem)');
  },

  destroy: function(cb) {
    var self = this;
    var timeline = new TimelineLite({
      onComplete: function() {
        self.$el.removeClass('step--active');

        if(self.video) {
          self.video.pause();
        }

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
