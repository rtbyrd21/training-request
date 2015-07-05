angular.module('app').controller('trCourseDetailCtrl', function($scope, trCachedCourses, $routeParams){
    trCachedCourses.query().$promise.then(function (collection) {
        collection.forEach(function(course){
            if(course._id === $routeParams.id){
                $scope.course = course;
            }
        })

    })
});
