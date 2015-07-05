angular.module('app').factory('trCachedCourses', function(trCourse){
    var courseList;

    return{
        query: function(){
            if(!courseList){
                courseList = trCourse.query();
            }

            return courseList;

        }
    }
})