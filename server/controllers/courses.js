var Course = require('mongoose').model('Course');

exports.getCourses = function(reg, res){
    Course.find({}).exec(function(err, collection){
        res.send(collection);
    })
};

exports.getCourseById = function(req, res){
    console.log('okkkkk');
    Course.findOne({_id:req.params.id}).exec(function(err, course){
        res.send(course);
    })
};