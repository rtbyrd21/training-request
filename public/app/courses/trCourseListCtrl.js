angular.module('app').controller('trCourseListCtrl', function($scope, trCachedCourses){
    $scope.courses = trCachedCourses.query();

    $scope.sortOptions = [{value:"title", text:"Sort by Title"},
        {value: "published", text:"Sort by Publish Date"}];

    $scope.sortOrder = $scope.sortOptions[0].value;

})