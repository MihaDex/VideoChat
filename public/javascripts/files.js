(function(){
    angular
        .module('VideoChat')
        .controller('filesCtrl', filesCtrl)
        .filter('roomname', function(){
            return function(param){
                var chanels = [
                    {
                        'name':'Общий',
                        'room':'all'
                    },
                    {
                        'name':'Первый',
                        'room':'one'
                    }, 
                    {
                        'name':'Второй',
                        'room':'two'
                    },
                ];
                for(i in chanels){
                    if (chanels[i].room == param){
                        return chanels[i].name;
                    }
                }
               
           }
       })
       
    function filesCtrl($scope, authentication){
        if(authentication.isLoggedIn()){
            $scope.auth=true;
        }else{
            $scope.auth=false;
        }

        $.post('/files', function(data) {
            //   console.log(data);
              $scope.$apply(function(){
                  $scope.videos = data;
              })
            });
            
    }

})();