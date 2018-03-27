'use strict';

angular.module("solar.core-agent", [])
    .factory('AgentHomeScreenResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/agent/home-screen/summary', {}, {
                search: {isArray: false, method: 'POST'}
            });
        }])
    .factory('AgentAccountResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/agent/account', {}, {});
        }])
    .factory('AgentActivityResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/agent/activity', {}, {
                search: {isArray: true, method: 'POST'}
            });
        }])
    .factory('AgentCashActivityResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/report/agent-cash-activity-report', {}, {
                search: {isArray: true, method: 'POST'}
            });
        }])
    .controller("AgentCashActivityController", ['$scope', '$location', 'AgentCashActivityResource', function ($scope, $location, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        var date = new Date();
        $scope.searchParams = {
            startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1),
            endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate())
        };

        $scope.search = function (reload) {
            if (reload) {
                $scope.pageParams.currentPage = 1;
            }

            $scope.expandAll = false;
            var view = resource.save($scope.searchParams, function () {
                $scope.pageParams.totalItems = view.accounts.length;
                $scope.accounts = view.accounts;
                $scope.summaryList = view.summaryList;

                angular.forEach($scope.accounts, function (account) {
                    account.netDeposit = account.deposit + account.withdrawal;
                });

                sort();
            });
        };

        $scope.search();

        $scope.pageChanged = function () {
            $scope.entities = getPagedEntities($scope.accounts, $scope.pageParams.itemsPerPage, $scope.pageParams.currentPage);
        };

        $scope.$watch('expandAll', function (expand) {
            if ($scope.accounts) {
                angular.forEach($scope.accounts, function (account) {
                    account.expand = expand;
                });
            }
        });

        var sort = function () {
            if (!$scope.accounts) {
                return;
            }

            $scope.accounts.sort(function (a, b) {
                if ($scope.predicate == 'login') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'client.label') {
                    return a['client'].label.localeCompare(b['client'].label);
                } else if ($scope.predicate == 'withdrawal') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'deposit') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'currency') {
                    return a[$scope.predicate].localeCompare(b[$scope.predicate]);
                } else if ($scope.predicate == 'netDeposit') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else {
                    return a['login'] - b['login'];
                }
            });

            if (!$scope.reverse) {
                $scope.accounts.reverse();
            }

            $scope.pageChanged();
        };

        $scope.$watch('predicate', function () {
            sort();
        });

        $scope.$watch('reverse', function () {
            sort();
        });
    }])
    .controller("AgentActivityController", ['$scope', '$location', 'AgentActivityResource', function ($scope, $location, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        $scope.search = function (reload) {
            if (reload) {
                $scope.pageParams.currentPage = 1;
            }

            $scope.expandAll = false;
            var view = resource.save($scope.searchParams, function () {
                $scope.pageParams.totalItems = view.accounts.length;
                $scope.accounts = view.accounts;
                $scope.summaryList = view.summaryList;

                angular.forEach($scope.accounts, function (account) {
                    account.netDeposit = account.deposit + account.withdrawal;
                });

                sort();
            });
        };

        $scope.searchParams = resource.get(function () {
            var date = new Date();
            $scope.searchParams.startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            $scope.searchParams.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $scope.workGroups = $scope.searchParams.workGroups;
            $scope.searchParams.workGroups = null;

            $scope.search();
        });

        $scope.pageChanged = function () {
            $scope.entities = getPagedEntities($scope.accounts, $scope.pageParams.itemsPerPage, $scope.pageParams.currentPage);
        };

        $scope.$watch('expandAll', function (expand) {
            if ($scope.accounts) {
                angular.forEach($scope.accounts, function (account) {
                    account.expand = expand;
                });
            }
        });

        var sort = function () {
            if (!$scope.accounts) {
                return;
            }

            $scope.accounts.sort(function (a, b) {
                if ($scope.predicate == 'login') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'client.label') {
                    return a['client'].label.localeCompare(b['client'].label);
                } else if ($scope.predicate == 'volume') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'commission') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'rebate') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'netDeposit') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else {
                    return a['login'] - b['login'];
                }
            });

            if (!$scope.reverse) {
                $scope.accounts.reverse();
            }

            $scope.pageChanged();
        };

        $scope.$watch('predicate', function () {
            sort();
        });

        $scope.$watch('reverse', function () {
            sort();
        });
    }])
    .controller("AgentHomeScreenSummaryController", ['$scope', '$location', 'AgentHomeScreenResource', function ($scope, $location, resource) {
        $scope.view = resource.search({}, function () {
            $scope.view.startDate = JSONToDate($scope.view.startDate);
            $scope.view.endDate = JSONToDate($scope.view.endDate);
        });

        $scope.refresh = function () {
            var searchParams = {
                startDate: $scope.view.startDate,
                endDate: $scope.view.endDate
            };

            $scope.view = resource.search(searchParams, function () {
                $scope.view.startDate = JSONToDate($scope.view.startDate);
                $scope.view.endDate = JSONToDate($scope.view.endDate);
            });
        };
    }])
    .controller("AgentAccountSummaryController", ['$scope', '$location', 'AgentAccountResource', function ($scope, $location, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        $scope.search = function (reload) {
            if (reload) {
                $scope.pageParams.currentPage = 1;
            }

            var view = resource.save($scope.searchParams, function () {
                $scope.pageParams.totalItems = view.accounts.length;
                $scope.accounts = view.accounts;
                $scope.summaryList = view.summaryList;

                sort();
            });
        };

        $scope.searchParams = resource.get(function () {
            $scope.workGroups = $scope.searchParams.workGroups;
            $scope.searchParams.workGroups = null;
            $scope.search();
        });

        $scope.pageChanged = function () {
            $scope.entities = getPagedEntities($scope.accounts, $scope.pageParams.itemsPerPage, $scope.pageParams.currentPage);
        };

        var sort = function () {
            if (!$scope.accounts) {
                return;
            }

            $scope.accounts.sort(function (a, b) {
                if ($scope.predicate == 'login') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'name') {
                    return a[$scope.predicate].localeCompare(b[$scope.predicate]);
                } else if ($scope.predicate == 'leverage') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'balance') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'equity') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'marginLevel') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'workGroup.name') {
                    return a['workGroup'].name.localeCompare(b['workGroup'].name);
                } else {
                    return a['login'] - b['login'];
                }
            });

            if (!$scope.reverse) {
                $scope.accounts.reverse();
            }

            $scope.pageChanged();
        };

        $scope.$watch('predicate', function () {
            sort();
        });

        $scope.$watch('reverse', function () {
            sort();
        });
    }]);