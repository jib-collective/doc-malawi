var Step = function($el, options) {
  this.$el = $el;
  this.options = options;
};

Step.prototype = {
  init: function() {
    this.$el.addClass('step--active');
    this.url = this.$el.data('url');

    if(history) {
      history.pushState(undefined, undefined, this.url);
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
          var $videoContainer = $(self.video.el_);
          var $controls = $videoContainer.find('.vjs-control-bar');
          var title = $videoContainer.data('title');
          var subtitle = $videoContainer.data('subtitle');

          if(title || subtitle) {
            var $title = $('<strong/>').text(title);
            var $subtitle = $('<small/>').text(subtitle);
            var $control = $('<span/>')
                          .append($title)
                          .append($subtitle)
                          .addClass('vjs-video-title');

            $controls.prepend($control);
          }

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

      var geojsonOptions = {
        data: '../dist/data/malawi_border.webjson',
      };
      var border = new mapboxgl.GeoJSONSource(geojsonOptions);

      self.map.on('load', function() {
        setTimeout(function() {
          // add border layer
          self.map.addSource('border', border);

          self.map.addLayer({
            'id': 'border',
            'type': 'fill',
            'source': 'border',
            'paint': {
              'fill-color': 'rgba(255, 255, 255, .2)',
            }
          });

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
    var $progressSteps = $('.navigation__link');
    var $progressStep = $progressSteps.filter('[href="' + this.url + '"]');

    $progressSteps.filter('.navigation__link--active').removeClass('navigation__link--active');
    $progressStep.addClass('navigation__link--active');
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
