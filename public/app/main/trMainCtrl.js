
angular.module('app').controller('trMainCtrl', function($scope){

    $scope.courses = [
        {name: 'Rocoup', featured:true, published:new Date("July 02, 2015 11:13:00")},
        {name: 'JQuery', featured:false, published:new Date("August 21, 2015 11:13:00")}
    ]

});