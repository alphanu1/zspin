'use strict';

app.factory('inputs', ['$rootScope', 'NWKeyboard', 'DOMKeyboard', 'gamepads', 'zspin', 'settings',
  function ($rootScope, NWKeyboard, DOMKeyboard, gamepads, zspin, settings) {
    console.log('inputs - init');

    var $scope = $rootScope.$new();
    var service = {};

    var nwBinder = NWKeyboard.bindTo($scope);
    var kbBinder = DOMKeyboard.bindTo($scope);
    var gpBinder = gamepads.bindTo($scope);
    var BINDS = [];

    var isWindowFocused = true;
    zspin.gui.removeAllListeners('browser-window-focus');
    zspin.gui.on('browser-window-focus', function() {
      isWindowFocused = true;
    });
    zspin.gui.removeAllListeners('browser-window-blur');
    zspin.gui.on('browser-window-blur', function() {
      isWindowFocused = false;
    });

    function _fireInput(input, bind) {
      if (!isWindowFocused && !bind.global)
        return;
      $rootScope.$broadcast('input:'+input, bind);
      // console.log('!%s!', input, bind);
    }

    service.unloadSettings = function() {

      for (var i in BINDS) {
        var bind = BINDS[i];
        if (bind.source == 'keyboard' && bind.global)
          nwBinder.del(BINDS[i].combo);
        else if (bind.source == 'keyboard')
          kbBinder.del(BINDS[i].combo);
        else if (bind.source == 'gamepad')
          gpBinder.del(BINDS[i].combo);
      }
    };

    service.loadSettings = function() {
      var binds = settings.$obj.binds;
      service.unloadSettings();


      BINDS = [];
      for (var input in binds) {
        for (var idx in binds[input]) {
          var bind = binds[input][idx];
          var callback = _fireInput.bind(null, input, bind);
          var args = {combo: bind.combo, callback: callback};

          if (bind.source == 'keyboard' && bind.global)
            nwBinder.add(args);
          else if (bind.source == 'keyboard')
            kbBinder.add(args);
          else if (bind.source == 'gamepad')
            gpBinder.add(args);
          BINDS.push(bind);
        }
      }
    };

    service.loadSettings();

    console.log('inputs - ready');
    return service;
  }
]);
