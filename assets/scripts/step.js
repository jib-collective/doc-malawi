var Step = function($el) {
  this.$el = $el;
};

Step.prototype = {
  init: function() {
    this.$el.addClass('step--active');

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
        console.log('Next slide');
      });
    });
  },

  destroy: function() {
    this.$el.removeClass('step--active');
  },
};
