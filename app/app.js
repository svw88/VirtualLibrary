var app = angular.module('shipIt', ["ngRoute"]);

app.config(function($routeProvider, $locationProvider) {
	$locationProvider.hashPrefix('');
	$routeProvider.when("/", {
		templateUrl : "views/main.html",
		controller : "MainController"
	}).when("/book/:id", {
		templateUrl : "views/book.html",
		controller : "BookController"
	}).otherwise({
		template : "<h1>Error 404</h1><p>Page does not exist</p>"
	});
});

// Variable to keep track of current search paramaters between results and book pages

var currentSearch = {
	type : "Book",
	name : "",
	id : 0,
	index : 1
};

// Service to consume google books api and get and set favorites

app.service("ShipItService", function($http, $window) {

	var shipItService = {};

	// Google books api base address for web calls
	var serverAddr = "https://www.googleapis.com/books/v1/volumes";

	// method to set favorites.json using nodejs server
	shipItService.setFavorites = function(entry) {
		return $http({
			url : 'http://localhost:8080/favorites',
			method : "POST",
			data : entry,
			header : 'Content-Type: application/json'
		});
	};
	
	// method to get favorites.json using nodejs server
	shipItService.getFavorites = function(entry) {

		return $http.get("http://localhost:8080/favorites").then(function(data) {

			return data;

		});
	};

	// method to search by book name and return results from google api
	shipItService.searchByBook = function(entry) {

		return $http.get(serverAddr + "?q=" + entry.name + "&maxResults=4&startIndex=" + entry.id).then(function(data) {

			return data.data;

		});
	};
	
	// method to search by author name and return results from google api
	shipItService.searchByAuthor = function(entry) {

		return $http.get(serverAddr + "?q=" + "+inauthor:" + entry.name + "&maxResults=4&startIndex=" + entry.id).then(function(data) {

			return data.data;

		});

	};
	
	// method to search for a specific books information and return results from google api
	shipItService.bookInfo = function(entry) {

		return $http.get(serverAddr + "/" + entry).then(function(data) {

			return data.data;

		}, function(data) {

			return data;

		});

	};

	return shipItService;

});

// main page controller
app.controller("MainController", ["$scope", "$routeParams", "$location", "ShipItService", "$window", "$route", "$filter","$sce",
function($scope, $routeParams, $location, ShipItService, $window, $route, $filter,$sce) {
	$scope.searchType = currentSearch.type;
	$scope.title =  currentSearch.name;
	$scope.id = currentSearch.id;
	$scope.index = currentSearch.index;

	// Get favorites when landing page loads using service
	ShipItService.getFavorites().then(function(response) {
		if (response != undefined) {
			$scope.favorites = response.data;
		};
	});
	
	/*	Method to find search keyword in results when searching by book name
	 	 and return keywords as highlighted text in dom element */
	$scope.highlightBook = function(text, search) {
		if (!search) {
			return $sce.trustAsHtml(text);
		}
		return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<h2 class="highlightedText">$&</h2>'));
	};
	
	/*	Method to find search keyword in results when searching by author name
	    and return keywords as highlighted text in dom element */
	$scope.highlightAuthor = function(text, search) {
		if (!search) {
			return $sce.trustAsHtml(text);
		}
		return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<label class="highlightedText">$&</label>'));
	};

	// Check to see if any book in returned results is in favorites list
	$scope.isFavorites = function(item) {
		var filter = $filter('filter')($scope.favorites, {
			id : item.id,
			name : item.volumeInfo.title
		}, true);

		if (filter != undefined && filter.length > 0) {
			return true;
		} else {
			return false;
		};

	};

	/* Check to see if there is current search parameters
	 if there is returns results for those search parameters */
	if (currentSearch.name != "") {
		if (currentSearch.type == "Book") {
			ShipItService.searchByBook({
				name : currentSearch.name,
				id : currentSearch.id
			}).then(function(results) {
				$scope.results = results;
			});
		} else {
			ShipItService.searchByAuthor({
				name : currentSearch.name,
				id : currentSearch.id
			}).then(function(results) {
				$scope.results = results;
			});
		};
	};
	
	// method to keep track of pages and which results to retrieve for next or prev page
	$scope.paginate = function(index) {

		$scope.index = index;
		$scope.id = (index * 4) - 4;
		if ($scope.searchType == "Book") {
			ShipItService.searchByBook({
				name : $scope.title,
				id : $scope.id
			}).then(function(results) {
				$scope.results = results;
			});
		} else {
			ShipItService.searchByAuthor({
				name : $scope.title,
				id : $scope.id
			}).then(function(results) {
				$scope.results = results;
			});
		};
	};
	
	// search method using params to retrieve desired results
	$scope.goToSearch = function() {
		currentSearch.name = $scope.name;
		currentSearch.type = $scope.searchType;
		$scope.id = 0;
		$scope.index = 1;
		$scope.title = $scope.name;
		if ($scope.searchType == "Book") {
			ShipItService.searchByBook({
				name : $scope.name,
				id : $scope.id
			}).then(function(results) {
				$scope.results = results;
			});
		} else {
			ShipItService.searchByAuthor({
				name : $scope.name,
				id : $scope.id
			}).then(function(results) {
				$scope.results = results;
			});
		};
		$scope.nameHolder = $scope.name;
		$scope.name = "";
	};
	
	// method to reload page for home button and clear search params
	$scope.reload = function() {
		currentSearch = {
			type : "Book",
			name : "",
			id : 0,
			index : 1
		};
		$route.reload();
	};

	/* method to add favorite to favorites array
	  and save it to favorites.json */
	$scope.addFavorite = function(item) {
		if ($scope.favorites == undefined) {
			$scope.favorites = [{
				name : item.volumeInfo.title,
				id : item.id
			}];
		} else {
			$scope.favorites.push({
				name : item.volumeInfo.title,
				id : item.id
			});
		};
		ShipItService.setFavorites($scope.favorites);
	};

	/* method to remove favorite from favorites array
	  and save it to favorites.json */
	$scope.removeFavorite = function(item) {
		if ($scope.favorites != undefined) {
			var filter = $filter('filter')($scope.favorites, {
				id : item.id,
				name : item.volumeInfo.title
			}, true);

			$scope.favorites.splice($scope.favorites.indexOf(filter[0]), 1);
			ShipItService.setFavorites($scope.favorites);
		};
	};
	
	/* method to remove favorite from favorites array in the 
	  favorites dropdown menu and save it to favorites.json */
	$scope.removeFavoriteMenu = function(item) {
		if ($scope.favorites != undefined) {
			var filter = $filter('filter')($scope.favorites, item, true);

			$scope.favorites.splice($scope.favorites.indexOf(filter[0]), 1);
			ShipItService.setFavorites($scope.favorites);
		};
	};
	
	// method to search for specific books info
	$scope.bookInfo = function(id) {
		currentSearch.index = $scope.index;
		currentSearch.id = $scope.id;
		$location.path("/book/" + id);
	};
}]);

// Specific book info page controller
app.controller("BookController", ["$scope", "$routeParams", "$location", "ShipItService", "$window", "$route", "$filter",
function($scope, $routeParams, $location, ShipItService, $window, $route, $filter) {
	$scope.searchType = "Book";

	// method to retrieve info for specific book by volumeid
	ShipItService.bookInfo($routeParams.id).then(function(results) {
		if (results.volumeInfo != undefined) {
			$scope.results = results;
		} else {
			$scope.results = {
				volumeInfo : {
					title : "Book Not Found"
				}
			};
		};

	});
	
	// method to retrieve favorites for specific book page
	ShipItService.getFavorites().then(function(response) {
		if (response != undefined) {
			$scope.favorites = response.data;
		};
	});
	
	/* method to remove favorite from favorites array in the 
	  favorites dropdown menu and save it to favorites.json */
	$scope.removeFavoriteMenu = function(item) {
		if ($scope.favorites != undefined) {
			var filter = $filter('filter')($scope.favorites, item, true);

			$scope.favorites.splice($scope.favorites.indexOf(filter[0]), 1);
			ShipItService.setFavorites($scope.favorites);
		};
	};

	// method to go to home apge and clear search params
	$scope.reload = function() {
		currentSearch = {
			type : "Book",
			name : "",
			id : 0,
			index : 1
		};
		$location.path("/");
	};
	
	// method to go back to home page with search params
	$scope.back = function() {
		$window.history.back();
	};
	
	// method to open specific book page for favorites menu
	$scope.bookInfo = function(id) {
		currentSearch.index = $scope.index;
		currentSearch.id = $scope.id;
		$location.path("/book/" + id);
	};

}]);

// directive to stop dropdown menu from closing when a favorite is removed
app.directive('disableAutoClose', function() {
	return {
		link : function($scope, $element) {
			$element.on('click', function($event) {
				$event.stopPropagation();
			});
		}
	};
});
