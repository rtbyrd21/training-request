angular.module('app').value('trToastr', toastr);

angular.module('app').factory('trNotifier', function(trToastr){
   return{
       notify: function(msg){
           trToastr.success(msg);
           console.log(msg);
       }
   }
});