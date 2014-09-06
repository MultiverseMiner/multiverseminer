
angular.module('MultiverseMiner')

.controller('LoginController', ['$scope', '$http', '$timeout', function($scope, $http) {

	$scope.betaSigns = [];

	$scope.submitAction = false;

	$scope.update = function(){

		$scope.betaSigns.push({name:$scope.beta.name, mail:$scope.beta.mail});
		$scope.name = '';
		$scope.mail = '';

		this.data = $scope.betaSigns;

		$http({
			method: 'POST',
			url: url, //don't know it yet
			data: data
		}).success(function(submitAction){
			if(postedData == "OK"){
				$scope.submitAction = true;
				$scope.betaSigns = [];

				$timeout(function(){
					$scope.submitAction = false;
				},3000);
			}
		});

	};

}]);