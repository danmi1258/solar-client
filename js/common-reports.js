'use strict';

angular.module("solar.common-reports", [])
    .factory('CommissionReportResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/report/commission-report', {}, {});
        }])
    .factory('ActivityReportResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/report/activity-report', {}, {});
        }])
    .factory('Mt4AccountReportResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/report/mt4-account-report', {}, {});
        }])
    .controller('Mt4AccountReportController', ['$scope', 'Mt4AccountReportResource', function ($scope, resource) {
        $scope.searchParams = resource.get(function () {
            $scope.workGroups = $scope.searchParams.workGroups;
            $scope.searchParams.workGroups = null;
        });

        $scope.export = function () {
            var file = resource.save($scope.searchParams, function () {
                location.assign(REST_PREFIX + "/client/report/activity-report/download/" + file.id);
            });
        };
    }])
    .controller('ActivityReportController', ['$scope', 'ActivityReportResource', function ($scope, resource) {
        $scope.searchParams = resource.get(function () {
            var date = new Date();
            $scope.searchParams.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            $scope.searchParams.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $scope.workGroups = $scope.searchParams.workGroups;
            $scope.searchParams.workGroups = null;
        });

        $scope.export = function () {
            var file = resource.save($scope.searchParams, function () {
                location.assign(REST_PREFIX + "/client/report/activity-report/download/" + file.id);
            });
        };
    }])
    .controller('CommissionReportController', ['$scope', 'CommissionReportResource', function ($scope, resource) {
        $scope.searchParams = resource.get(function () {
            var date = new Date();
            $scope.searchParams.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            $scope.searchParams.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $scope.workGroups = $scope.searchParams.workGroups;
            $scope.searchParams.workGroups = null;
        });

        $scope.export = function () {
            var file = resource.save($scope.searchParams, function () {
                location.assign(REST_PREFIX + "/client/report/commission-report/download/" + file.id);
            });
        };
    }]);