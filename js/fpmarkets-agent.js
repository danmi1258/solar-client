'use strict';

angular.module("solar.fpmarkets-agent", [])
    .factory('AgentIBAccountResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/agent/ib-account', {}, {});
        }])
    .controller("AgentIBAccountSummaryController", ['$scope', '$location', 'AgentIBAccountResource', 'toaster', function ($scope, $location, resource, toaster) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        var baseUrl = "https://portal.fpmarkets.com/cn/register?fpm-affiliate-utm-source=IB";
        var getUrl = function (entity) {
            return baseUrl + "&fpm-affiliate-pcode=" + entity.account.login + "&fpm-affiliate-agt=" + entity.account.login;
        };
        $scope.openLink = function (entity) {
            var url = getUrl(entity);
            window.open(url, '_blank');
        };

        $scope.copyLink = function (entity) {
            var url = getUrl(entity);
            var copyElement = document.createElement("span");
            copyElement.appendChild(document.createTextNode(url));
            copyElement.id = 'tempCopyToClipboard';
            angular.element(document.body.append(copyElement));

            // select the text
            var range = document.createRange();
            range.selectNode(copyElement);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);

            // copy & cleanup
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            copyElement.remove();

            popMessage(toaster, 'success', "Link copied", 1000);
        };

        $scope.search = function (reload) {
            if (reload) {
                $scope.pageParams.currentPage = 1;
            }

            $scope.expandAll = false;
            var view = resource.save($scope.searchParams, function () {
                var map = {};
                $scope.extendedView = view.extendedView;
                $scope.accounts = [];
                angular.forEach(view.accounts, function (account) {
                    map[account.workGroup.id] = account;

                    if (account.topWorkGroup) {
                        $scope.accounts.push(account);
                    }
                });

                angular.forEach(view.accounts, function (account) {
                    if (!account.topWorkGroup && account.workGroup.parentWorkGroup) {
                        var parent = map[account.workGroup.parentWorkGroup.id];
                        if (parent) {
                            if (!parent.accounts) {
                                parent.accounts = [];
                            }
                            parent.accounts.push(account);
                        }
                    }
                });

                $scope.pageParams.totalItems = $scope.accounts.length;
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
                    return a['account'][$scope.predicate] - b['account'][$scope.predicate];
                } else if ($scope.predicate == 'name') {
                    return a[$scope.predicate].localeCompare(b[$scope.predicate]);
                } else {
                    return a['account']['login'] - b['account']['login'];
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