'use strict';

angular.module("solar.fpmarkets-client", [])
    .factory('ClientFundTradingAccountResource', ['$resource',
    function ($resource) {
        return $resource(REST_PREFIX + '/client/fund/fund-trading-account/:id', {}, {});
    }])
    .controller('FundTradingAccountController', ['$scope', '$location', '$routeParams', 'ClientFundTradingAccountResource', function ($scope, $location, $routeParams, resource) {
    var baseUrl = "https://www.fpmarkets.com";

    var loadMethods = function () {
        $scope.methods = [
            {
                name: 'Credit Card',
                url: baseUrl + '/funding/credit-card-payments/?Currency=USD&Platform=MT4&Account=' + $scope.entity.login
                + "&Name=" + $scope.view.name
                + "&Email=" + $scope.view.email
            },
            {
                name: 'China Union Pay',
                url: baseUrl + '/funding/china-union-pay/?Currency=CNY&Platform=MT4&Acc=' + $scope.entity.login
                + "&Name=" + $scope.view.name
                + "&Email=" + $scope.view.email
            },
            {
                name: 'AstroPay',
                url: baseUrl + '/funding/astropay/'
            },
            {
                name: 'Neteller',
                url: baseUrl + '/funding/neteller-pay/'
            },
            {
                name: 'Skrill',
                url: baseUrl + '/funding/skrill/'
            },
            {
                name: 'Bank Wire Transfer',
                url: baseUrl + '/bank-wire/'
            },
            {
                name: 'BPay',
                url: baseUrl + '/bpay/'
            },
            {
                name: 'Transfers from other brokers',
                url: baseUrl + '/transfer-from-other-brokers/'
            }
        ];
    };

    $scope.view = resource.get({
        "id": $routeParams.id
    }, function () {
        $scope.entity = {
            login: parseInt($routeParams.id)
        };
        loadMethods();
    });

    $scope.cancel = function () {
        $location.url('/');
    };

    $scope.save = function () {
        var url = $scope.entity.method.url;
        window.open(url, '_blank');
        $scope.cancel();
    };
}]);