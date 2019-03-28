(function(){
    angular.module('VideoChat', ['ngSanitize'])
                .controller('registerCtrl',registerCtrl)
                .controller('loginCtrl', loginCtrl)
                .service('authentication', authentication)

        function authentication ($http, $window) {

                    var goChat = function(){
                      var token = getToken();
                      if(isLoggedIn){
                        $http.get('/chat',{
                          headers: {
                            Authorization: 'Bearer '+ getToken()
                          }
                        }).then(function(data){
                          jQuery("body").html(data.data);
                        })
                      }
                    }
  
                    var saveToken = function (token) {
                      $window.localStorage['VideoChat'] = token;
                    };
                
                    var getToken = function () {
                  
                      return $window.localStorage['VideoChat'];
                    };
                
                    var isLoggedIn = function() {
                  
                      var token = getToken();
                    
                      if(token){
                        var payload = JSON.parse($window.atob(token.split('.')[1]));
                
                        return payload.exp > Date.now() / 1000;
                      } else {
                        return false;
                      }
                    };
                
                    var currentUser = function() {
                      if(isLoggedIn()){
                        var token = getToken();
                        var payload = JSON.parse($window.atob(token.split('.')[1]));
                        return {
                          email : payload.email,
                          name : payload.name
                        };
                      }
                    };
                
                    register = function(user,success,error) {
                      return $http.post('/register', user).then(success,error);
                    };
                
                    login = function(user,success,error) {
                      return $http.post('/login', user).then(success,error);
                    };
                
                    logout = function() {
                      $window.localStorage.removeItem('VideoChat');
                    };
                
                    return {
                      goChat : goChat,
                      currentUser : currentUser,
                      saveToken : saveToken,
                      getToken : getToken,
                      isLoggedIn : isLoggedIn,
                      register : register,
                      login : login,
                      logout : logout
                    };
                  }

        function registerCtrl($scope, authentication) {
                    
                    $scope.credentials = {
                      name : "",
                      email : "",
                      password : ""
                    };
                    
                    $scope.onSubmit = function () {
                        $scope.formError = "";
                      if (!$scope.credentials.name || !$scope.credentials.email || !$scope.credentials.password || !$scope.repeatPassword ) {
                        $scope.formError = "Заполните все поля, пожалуйста!";
                        return false;
                      }else if($scope.credentials.password != $scope.repeatPassword){
                        $scope.formError = "Введенные пароли не совпадают";
                        return false;
                      }else {
                        $scope.doRegister();
                      }
                    };
                
                    $scope.doRegister = function() {
                        $scope.formError = "";
                      authentication
                        .register($scope.credentials, function(data){
                          authentication.saveToken(data.data.token);
                          authentication.goChat();
                        },function(err){
                            $scope.formError = err.data.errmsg;
                        });
                    };
                
                  }

        function loginCtrl($scope, authentication) {
                    
                    $scope.credentials = {
                      email : "",
                      password : ""
                    };

                    $scope.onSubmit = function () {
                        $scope.formError = "";
                      if (!$scope.credentials.email || !$scope.credentials.password) {
                        $scope.formError = "Заполните все поля, пожалуйста!";
                        return false;
                      } else {
                        $scope.doLogin();
                      }
                    };
                
                    $scope.doLogin = function() {
                        $scope.formError = "";
                      authentication
                        .login($scope.credentials,function(data){
                          authentication.saveToken(data.data.token);
                          //authentication.goChat();
                          location.pathname="/chat";
                        },function(err){
                            $scope.formError = err.data.message;
                        });
                    };
                
                  }
                
})();

