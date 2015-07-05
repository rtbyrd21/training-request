var mongoose = require('mongoose');

var courseSchema = mongoose.Schema({
    title: {type:String, required:'{PATH} is required.'},
    featured: {type:Boolean, required:'{PATH} is required.'},
    published: {type:Date, required:'{PATH} is required.'},
    tags: [String]
});

var Course = mongoose.model("Course", courseSchema);

function createDefaultCourses(){
    Course.find({}).exec(function(err, collection){
        if(collection.length === 0 ){
            Course.create({title: 'angular convention', featured: true, published: new Date('6/21/2015'), tags:['Angular, Javascript']});
            Course.create({title: 'Jquery', featured: false, published: new Date('7/28/2015'), tags:['Node, Javascript']});
            Course.create({title: 'Task Runners', featured: false, published: new Date('7/11/2015'), tags:['Gulp, Javascript']});
        }
    })
}

exports.createDefaultCourses = createDefaultCourses;