(function(){
    angular
        .module('VideoChat')
        .controller('chatCtrl', chatCtrl)

    function chatCtrl($scope){
        $scope.users = [{
            name: "foo",
            msg: "bar"
        },{
            name: "foo",
            msg: "bar"
        },{
            name: "foo",
            msg: "bar"
        }]
    }
})();