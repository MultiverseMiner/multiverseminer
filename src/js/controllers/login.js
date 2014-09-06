
angular.module('MultiverseMiner')

.controller('LoginController', ['$scope', '$http', function($scope, $http) {

	$scope.betaSign = {};
	var submitAction;

	$scope.update = function(beta){

		$scope.betaSign = angular.copy(beta);
		this.data = $scope.betaSign;

		$http({
			method: 'POST',
			url: localhost, //don't know it yet :(
			data: data
		}).success(function(submitAction){
			if(postedData == "OK"){
				submitAction = true;
			}
		});

	};

}]);