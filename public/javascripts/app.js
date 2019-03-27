(function(){
    angular.module('VideoChat', ['ngSanitize'])
                .controller('registerCtrl',registerCtrl)
                .controller('loginCtrl', loginCtrl)
                .service('authentication', authentication)


        function authentication ($http, $window) {
  
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
                
                    register = function(user) {
                      return $http.post('/register', user).success(function(data){
                        saveToken(data.token);
                      });
                    };
                
                    login = function(user) {
                      return $http.post('/login', user).success(function(data) {
                        saveToken(data.token);
                      });
                    };
                
                    logout = function() {
                      $window.localStorage.removeItem('VideoChat');
                    };
                
                    return {
                      currentUser : currentUser,
                      saveToken : saveToken,
                      getToken : getToken,
                      isLoggedIn : isLoggedIn,
                      register : register,
                      login : login,
                      logout : logout
                    };
                  }

        function registerCtrl($scope, $location, authentication) {
                    
                    $scope.credentials = {
                      name : "",
                      email : "",
                      password : ""
                    };
                    
                    $scope.onSubmit = function () {
                        $scope.formError = "";
                      if (!$scope.credentials.name || !$scope.credentials.email || !$scope.credentials.password || !$scope.credentials.repeatPassword ) {
                        $scope.formError = "Заполните все поля, пожалуйста!";
                        return false;
                      }else if($scope.credentials.password != $scope.credentials.repeatPassword){
                        $scope.formError = "Введенные пароли не совпадают";
                        return false;
                      }else {
                        $scope.doRegister();
                      }
                    };
                
                    $scope.doRegister = function() {
                        $scope.formError = "";
                      authentication
                        .register($scope.credentials)
                        .error(function(err){
                            $scope.formError = err;
                        })
                        .then(function(){
                          $location.path("/chat");
                        });
                    };
                
                  }

        function loginCtrl($scope, $location, authentication) {
                    
                    $scope.credentials = {
                      email : "",
                      password : ""
                    };
                
                    $scope.returnPage = $location.search().page || '/';
                
                    $scope.onSubmit = function () {
                        $scope.formError = "";
                      if (!$scope.credentials.email || !$scope.credentials.password) {
                        $scope.formError = "All fields required, please try again";
                        return false;
                      } else {
                        $scope.doLogin();
                      }
                    };
                
                    $scope.doLogin = function() {
                        $scope.formError = "";
                      authentication
                        .login($scope.credentials)
                        .error(function(err){
                            $scope.formError = err;
                        })
                        .then(function(){
                          $location.search('page', null); 
                          $location.path($scope.returnPage);
                        });
                    };
                
                  }
                
})();

