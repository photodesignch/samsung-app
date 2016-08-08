/*
1.  Implement a search API /v1/search.  In this assignment, this method always returns [“UN65KS9500FXZA”, “UN32J5205AFXZA”, “UN65KS9000FXZA”].  The returned array is an array of model numbers of the 3 televisions in the visual (Search Results.png).
 
2.  Implement a product API the data that you need to display the search results according to the visual.
 
In the zip file, the product images are included.  Also included is the product details (products.json)
 
3.  Implement the web page such that it would call the search api to get a list of product, call the product api to get the details.  The resulting web page should look as close to the visual attached as possible.
*/

angular.module('samsungCart',[
  'samsungCart.controllers.MainController',
  'samsungCart.services.SearchProductsService',
  'samsungCart.directives.SearchProductsDirective',
  'samsungCart.directives.newText',
  'samsungCart.directives.starRating',
  'samsungCart.directives.originalPrice',
  'samsungCart.directives.availableSize'
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

    SearchProductsService.init(); // trigger the initial search

    // scope.modelNumbers = SearchProductsService.modelsResultArr;
    scope.productDetails = SearchProductsService.detailsResultArr;
    // console.log(scope.modelNumbers);
    // console.log(scope.productDetails);
  }).error(function(data,status,headers,config){
    console.log('error status=' + status);
  });
});

// Search API
angular.module('samsungCart.services.SearchProductsService',[])
.service('SearchProductsService', function() {
    var self = this;
    self.detailsResultArr = []; // array contains filtered objects
    self.modelsResultArr = []; // array contains model numbers

    self.init = function() { 
      var modelsArr = [];

      function filterByTvSize(obj) {
        return scope.tvSizesLookup[obj.size];
      }

      // filter inventory array by selected TV sizes
      self.detailsResultArr = scope.inventory.filter(filterByTvSize);

      self.detailsResultArr.forEach(function(ele){
        modelsArr.push(ele.model_number);
      });

      self.modelsResultArr = modelsArr;
      return modelsArr;
    };

    self.getModels = function() {
      self.init();
      console.log(self.modelsResultArr);
      return self.modelsResultArr;
    }
    self.getProductsDetails = function() {
      self.init();
      console.log(self.detailsResultArr);
      return self.detailsResultArr;
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
        SearchProductsService.getProductsDetails();
      });
    }
  }
});

angular.module('samsungCart.directives.newText',[])
.directive('newText', function(){
  return {
    restrict : 'EA',
    scope: {
      value: '='
    }, link: function(scope,ele,attr) {
      if (attr.title.indexOf('NEW - ') >= 0 ) {
        scope.new = 'NEW ';
        scope.title = attr.title.replace('NEW ', '');
      } else {
        scope.new = '';
        scope.title = attr.title;
      }
    },
    template : '<span class="new">{{new}}</span><span>{{title}}</span>'
  }
});

angular.module('samsungCart.directives.starRating',[])
.directive('starRating', function(){
  return {
    restrict : 'EA',
    scope: {
      value: '='
    }, link: function(scope,ele,attr) {
      scope.stars = [];

      scope.currentRating = attr.scores;
      scope.fullStar = Math.floor(scope.currentRating);
      scope.halfStar = scope.currentRating % 1;

      for(var i=0;i < 5; i++) {
        if(i < scope.fullStar) {
          scope.stars.push({
            imgurl : 'imgs/star.jpg'
          });
        }
      }
      if(scope.half != 0) {
        scope.stars.push({
          imgurl : 'imgs/halfstar.jpg'
        });
      }
    },
    template : '<img ng-repeat="star in stars" src="{{star.imgurl}}" />'
  }
});

angular.module('samsungCart.directives.originalPrice',[])
.directive('originalPrice', function(){
  return {
    restrict : 'EA',
    scope: {
      value: '='
    }, link: function(scope,ele,attr) {
      var tempStr = attr.highlight;
      var pricePos = tempStr.indexOf('$');
      var priceEndPos = tempStr.indexOf('/');
      var postTextPos = priceEndPos + 1;

      scope.price = tempStr.substring(pricePos, priceEndPos);
      scope.postText = tempStr.substring(postTextPos, tempStr.length);
    },
    template : 'Original: <span class="priceRed">{{price}}</span> / {{postText}}'
  }
});

angular.module('samsungCart.directives.availableSize',[])
.directive('availableSize', function(){
  return {
    restrict : 'EA',
    scope: {
      value: '='
    }, link: function(scope,ele,attr) {
      scope.selectedSize = attr.selecteds;
      scope.sizes = JSON.parse(attr.sizes);
      scope.showSize = (scope.sizes.length > 1);
      scope.selectedBox = [];
      
      for(var i=0; i< scope.sizes.length; i++) {
        if (scope.sizes[i] == scope.selectedSize) {
          scope.selectedBox.push({
            box : 'showBox',
            size: scope.sizes[i]
          });
        } else {
          scope.selectedBox.push({
            box : 'notShow',
            size: scope.sizes[i]
          });
        }
      }

    },
    template : 
    '<div class="sizeSelection">' + 
      '<span ng-if="showSize">Size '+
        '<span ng-repeat="item in selectedBox">' +
          '<span class="{{item.box}}">{{item.size}}</span> ' +
        '</span>' +
      '</span>' +
    '</div>'
  }
});