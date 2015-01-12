'use strict';

app.controller('MenuCtrl', ['$scope', '$rootScope', '$document', '$timeout', '$window', 'fs', 'zspin', 'ini', 'xml',
  function($scope, $rootScope, $document, $timeout, $window, fs, zspin, ini, xml) {

    /************* This... is crack. ************/

    //  -  Defining path/current menu
    if ($rootScope.menuPath == null)
      $rootScope.menuPath = window.location.href.split('#')[1];
    $scope.menu = decodeURIComponent($rootScope.menuPath.split('/').pop());

    //  -  Defining wheel parameters  -
    $scope.wheelItems = [];
    $scope.wheelOptions = {
      // animation time in ms
      transitionTime: 70,
      // index of item which serves as cursor
      selectPosition: 9,
      points: [
        // X, Y, Angle, Scale, z-index
        // first item offscreen but required for animation
        [1500, 344, 0, 1, 1],
        [930, -76, 23, 1, 2],
        [890, -26, 21, 1, 3],
        [860, 24, 18, 1, 4],
        [830, 74, 15, 1, 5],
        [810, 124, 12, 1, 6],
        [795, 174, 9, 1, 7],
        [780, 224, 6, 1, 8],
        [773, 274, 3, 1, 9],
        // next item is the selection cursor
        [770, 344, 0, 2, 10],
        [773, 414, -3, 1, 9],
        [780, 464, -6, 1, 8],
        [795, 514, -9, 1, 7],
        [810, 564, -12, 1, 6],
        [830, 614, -15, 1, 5],
        [860, 664, -18, 1, 4],
        [890, 714, -21, 1, 3],
        [930, 764, -23, 1, 2],
      ]
    };

    var updatePromise;

    //  -  Binding controls  -
    $document.bind('keydown', function(e) {
      if (!$scope.wheelControl)
        return;

      // left/up keys
      if (e.which == 37 || e.which == 38)
        $scope.wheelControl.prev();

      // right/down keys
      if (e.which == 39 || e.which == 40) {
        $scope.wheelControl.next();
        console.log('========5', $rootScope.menuPath)
      }

      // enter key
      if (e.which == 13) {
        console.log('========1', $rootScope.menuPath)
        $rootScope.menuPath += '/' + encodeURIComponent($scope.wheelControl.select()['name']);
        console.log('========2', $rootScope.menuPath)
        window.location = '#' + $rootScope.menuPath;
      }

      // escape key
      if (e.which == 27) { // WHY THIS SHIT GETS CALLED 2 TIMES IN SUBWHEEL
        // if we are not in main menu
        if ($rootScope.menuPath != '/menus/Main%20Menu') {
          var cut = $rootScope.menuPath.lastIndexOf('/');
          console.log('========3', $rootScope.menuPath)
          $rootScope.menuPath = $rootScope.menuPath.substr(0, cut);
          console.log('========4', $rootScope.menuPath)
          window.location = '#' + $rootScope.menuPath;
        } else {
          console.log('QUIT');
        }
      }

      $timeout.cancel(updatePromise);

      // wait a little before loading new theme, to avoid cpu intensive loading
      updatePromise = $timeout(function() {
        var name = $scope.curItem.name;
        $scope.theme = name;
      }, 200);

      $scope.curItem = $scope.wheelControl.select();

      e.preventDefault();
    });

    $scope.openRoot = function() {
      zspin.gui.Shell.openItem(zspin.dataPath());
    };

    //  -  Get current menu's settings  -
    var settingsFile = zspin.dataPath('Settings', $scope.menu+'.ini');
    ini.parse(settingsFile).then(function(data) {
      $scope.settings = data;
    });

    //  -  Get current menu's entries  -
    var databaseFile = zspin.dataPath('Databases', $scope.menu, $scope.menu+'.xml');
    var wheelImagesRoot = zspin.dataPath('Media', $scope.menu, 'Images', 'Wheel');

    xml.parse(databaseFile).then(function(database) {
      $scope.database = database;
      $scope.entries = database.menu.game.map(function(item) {
        var name = item.name;
        var path = fs.join(wheelImagesRoot, name+'.png');
        return {name: name, file: path};
      });
    });

  }
]);