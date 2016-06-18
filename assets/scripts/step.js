var Step = function($el, options) {
  this.$el = $el;
  this.options = options;
};

Step.prototype = {
  init: function() {
    this.$el.addClass('step--active');
    this.url = this.$el.data('url');

    if(history) {
      var url = this.url;

      if(!this.url || this.url === '') {
        url = './';
      }

      history.pushState(undefined, undefined, url);
    }

    this._initVideos();
    this._initMaps();
    this._updateNavigation();
  },

  hasCaptureApplicationNav: function() {
    return false;
  },

  captureApplicationNav: function(direction) {},

  _initVideos: function() {
    var self = this;
    var $videos = this.$el.find('.js-video');

    if(this.video) {
      return this.video.play();
    }

    $.each($videos, function() {
      var $video = $(this);
      var $track = $video.children('track');
      var addVideoBindings = function(video, $playControl) {
        if(!video) {
          return;
        }

        video.on('play', function() {
          changePlayIcon($playControl, 'pause');
        });

        video.on('pause', function() {
          changePlayIcon($playControl, 'play');
        });

        video.on('ended', function() {
          application.nextSlide();
        });
      };
      var changePlayIcon = function($playControl, state) {
        $playControl
          .children('svg')
            .children('use')
              .attr({
                'xlink:href': '../dist/images/sprite.svg#' + state,
              });
      };
      var initPlayer = function() {
        var $videoContainer = $(self.video.el_);
        var $controls = $videoContainer.find('.vjs-control-bar');
        var $playControl = $videoContainer.find('.vjs-play-control');
        var title = $videoContainer.data('title');
        var subtitle = $videoContainer.data('subtitle');
        var $playIcon = $('<div/>')
                          .append(
                            $('<svg/>')
                            .addClass('vjs-play-control-icon')
                            .append(
                              $('<use/>')
                                .attr('xlink:href', '../dist/images/sprite.svg#pause')
                            )
                          );

        $playControl.html($playIcon.html());

        if(title || subtitle) {
          var $title = $('<strong/>').text(title);
          var $subtitle = $('<small/>').text(subtitle);
          var $control = $('<span/>')
                        .append($title)
                        .append($subtitle)
                        .addClass('vjs-video-title');

          $controls.prepend($control);
        }

        addVideoBindings(self.video, $playControl);

        this.play();
      };

      // Add subtitles
      $track.attr('src', $track.data('src'));

      if($video.hasClass('js-video-play')) {
        self.video = videojs($video.get(0), {controls: true}, initPlayer);
      }
    });
  },

  _initMaps: function() {
    var self = this;
    var $maps = this.$el.find('.js-map');

    $.each($maps, function() {
      var $map = $(this);

      self.map = new mapboxgl.Map({
        attributionControl: false,
        center: [
          22.708734,
          7.099980,
        ],
        container: $map.get(0),
        interactive: false,
        style: 'mapbox://styles/mapbox/dark-v9',
        zoom: 2,
      });

      self._initMapSlides($map);
    });
  },

  _initMapSlides: function($map) {
    var self = this;
    var $facts = $map.next('.map-slide');
    var $active = $facts.find('.map-slide__fact').first();
    var activeClass = 'map-slide__fact--is-active';
    var captureNav = function(direction) {
      if((direction === 'prev' && $facts.find('.map-slide__fact--is-active').index() === 0) ||
         (direction === 'next' && $facts.find('.map-slide__fact').length === 1)) {
        return false;
      } else {
        return true;
      }
    };
    var nocCaptureNav = function() {
      return false;
    }

    if(!$facts.length) {
      return;
    }

    $active
      .addClass(activeClass)
      .siblings()
        .removeClass(activeClass);

    this.hasCaptureApplicationNav = captureNav;
    this.captureApplicationNav = function(direction) {
      if(direction === 'next') {
        nextFact();
      } else {
        prevFact();
      }
    };

    var mapCalls = function($slide) {
      var zoomIntoMalawi = function() {
        self.map.easeTo({
          center: [
            33.901221,
            -13.363024,
          ],
          zoom: 5.7,
        });
      };
      var drawMalawiBorder = function() {
        var geojsonOptions = {
          data: '../dist/data/malawi_border.webjson',
        };
        var border = new mapboxgl.GeoJSONSource(geojsonOptions);
        self.map.addSource('border', border);
        self.map.addLayer({
          id: 'border',
          type: 'fill',
          source: 'border',
          paint: {
            'fill-color': 'rgba(146, 107, 67, .4)',
          }
        });
      };

      if($slide.data('zoomintomalawi')) {
        if(self.map.loaded()) {
          drawMalawiBorder();
          zoomIntoMalawi();
        } else {
          self.map.on('load', function() {
            drawMalawiBorder();
            zoomIntoMalawi();
          });
        }
      }
    };

    var prevFact = function() {
      var $active = $facts.find('.' + activeClass);
      var $next = $active.prev();

      if(!$next.prev().length) {
        self.hasCaptureApplicationNav = nocCaptureNav;
      }

      mapCalls($next);

      $active.removeClass(activeClass);
      $next.addClass(activeClass);
    };

    var nextFact = function() {
      var $active = $facts.find('.' + activeClass);
      var $next = $active.next();

      if(!$next.next().length) {
        self.hasCaptureApplicationNav = nocCaptureNav;
      }

      mapCalls($next);

      $active.removeClass(activeClass);
      $next.addClass(activeClass);
    };

    mapCalls($active);
  },

  _destroyMaps: function() {
    if(this.map) {
      this.map.remove();
      this.map = undefined;
    }
  },

  _destroyVideos: function() {
    if(this.video) {
      this.video.pause();
    }
  },

  _updateNavigation: function() {
    var index = this.$el.index();
    var hiddenClass = 'app-navigation--is-hidden';
    var prevHiddenClass = 'app-navigation--prev-is-hidden';
    var nextHiddenClass = 'app-navigation--next-is-hidden';
    var $navigation = $('.app-navigation');

    var isFirstSlide = index === 0;
    var isLastSlide = (index + 1) === this.options.$steps.length;

    $navigation.toggleClass(hiddenClass, isFirstSlide);
    $navigation.toggleClass(nextHiddenClass, isLastSlide);
  },

  destroy: function(cb) {
    this.$el.removeClass('step--active');
    this._destroyMaps();
    this._destroyVideos();

    if(typeof(cb) === 'function') {
      cb();
    }
  },
};
