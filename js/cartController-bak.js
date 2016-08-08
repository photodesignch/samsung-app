/*
1.  Implement a search API /v1/search.  In this assignment, this method always returns [“UN65KS9500FXZA”, “UN32J5205AFXZA”, “UN65KS9000FXZA”].  The returned array is an array of model numbers of the 3 televisions in the visual (Search Results.png).
 
2.  Implement a product API the data that you need to display the search results according to the visual.
 
In the zip file, the product images are included.  Also included is the product details (products.json)
 
3.  Implement the web page such that it would call the search api to get a list of product, call the product api to get the details.  The resulting web page should look as close to the visual attached as possible.
*/

angular.module('samsungCart',[
  'samsungCart.controllers.MainController',
  'samsungCart.services.SearchProductsService',
  'samsungCart.directives.SearchProductsDirective'
]).run(function(){});

angular.module('samsungCart.controllers.MainController',[])
.controller('MainController', function($scope, $http, SearchProductsService){
  window.scope = $scope;
  $scope.inventory = [];  // contains inventory data from products.json
  $scope.tvSizesLookup = {};  // store search criterias

  // loading inventory data from products.json file
  $http.get('products.json', { cache: true })
  .success(function(data,status,headers,config){
    scope.inventory = data;

    // extract tv sizes into checkboxes
    for (var i=0; i<= (scope.inventory.length - 1); i++) {
      scope.inventory[i].index = i;
      var searchTvSizes = scope.inventory[i].size;
      if(!(searchTvSizes in scope.tvSizesLookup)) {
        scope.tvSizesLookup[searchTvSizes] = false; // default false for checkboxes
      }
    }

    // set default search for 65 inches and 32 inches to return only [“UN65KS9500FXZA”, “UN32J5205AFXZA”, “UN65KS9000FXZA”] these 3 models
    scope.tvSizesLookup["65\""] = true;
    scope.tvSizesLookup["32\""] = true;

    console.log(SearchProductsService.getProductsDetails());
    SearchProductsService.getModels(); // trigger the initial search
    console.log(SearchProductsService.getProductsDetails());
  }).error(function(data,status,headers,config){
    console.log('error status=' + status);
  });
});

// Search API
angular.module('samsungCart.services.SearchProductsService',[])
.service('SearchProductsService', function() {
    this.searchResultArr = []; // array contains filtered objects
    this.getModels = function() {
      var modelsArr = []; // array contains model numbers

      function filterByTvSize(obj) {
        return scope.tvSizesLookup[obj.size];
      }

      // filter inventory array by selected TV sizes
      this.searchResultArr = scope.inventory.filter(filterByTvSize);

      this.searchResultArr.forEach(function(ele){
        modelsArr.push(ele.model_number);
      });
      console.log(modelsArr);
      return modelsArr;
    };
    this.getProductsDetails = function() {
      return this.searchResultArr;
    }
});

angular.module('samsungCart.directives.SearchProductsDirective',[])
.directive('searchProductsDirective', function(SearchProductsService){
  // directive triggers the search (click on tv size checkboxes)
  return {
    restrict : 'A',
    scope: true,
    link : function(scope, element, attrs) {
      element.bind('click', function(){
        SearchProductsService.getModels();
      });
    }
  }
});