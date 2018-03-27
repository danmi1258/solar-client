'use strict';

angular.module("solar.core-client", [])
    .factory('ClientAccountSummaryResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/account/summary/:id', {}, {});
        }])
    .factory('ClientLeverageUpdateResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/account/leverage-update', {}, {});
        }])
    .factory('ClientAccountResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/account/new', {}, {});
        }])
    .factory('ClientFundTransferResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/fund/fund-transfer', {}, {});
        }])
    .factory('ClientSupportResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/support', {}, {});
        }])
    .factory('ClientFundResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/fund/deposit', {}, {});
        }])
    .factory('ClientWithdrawalResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/fund/fund-withdrawal', {}, {});
        }])
    .factory('BankAccountResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/fund/bank-account/:id', {}, {});
        }])
    .factory('PartnerApplicationResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/partner-application', {}, {});
        }])
    .factory('FundHistoryResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/fund/fund-history/:id', {}, {
                search: {params: {id: 'search'}, isArray: false, method: 'POST'}
            });
        }])
    .controller('FundHistoryController', ['$scope', 'FundHistoryResource', function ($scope, resource) {
        var date = new Date();

        $scope.entity = new resource();
        $scope.entity.startDate = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate() + 1);
        $scope.entity.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        $scope.view = resource.get();
        $scope.search = function () {
            $scope.result = resource.search($scope.entity);
        };

        $scope.search();
    }])
    .controller('PartnerApplicationController', ['$scope', 'PartnerApplicationResource', 'toaster', function ($scope, resource, toaster) {
        $scope.entity = new resource();

        $scope.save = function () {
            $scope.entity.$save(function () {
                popMessage(toaster, 'success', 'Your request has been submitted.');

                $scope.entity = new resource();
                $scope.editForm.$setPristine();
            });
        };
    }])
    .controller('ClientWithdrawalController', ['$scope', 'ClientWithdrawalResource', 'BankAccountResource', '$location', '$routeParams', 'toaster', function ($scope, resource, BankAccountResource, $location, $routeParams, toaster) {
        var load = function () {
            $scope.entity = new resource();
            $scope.entity.login = parseInt($routeParams.id);
            $scope.newBankAccount = true;
            $scope.view = resource.get(function () {
                if ($scope.view.bankAccountViewList && $scope.view.bankAccountViewList.length) {
                    $scope.entity.bankAccountView = $scope.view.bankAccountViewList[0];
                }
            });
        };

        load();

        $scope.$watch('entity.bankAccountView', function (newVal) {
            $scope.newBankAccount = true;
            if ($scope.entity.bankAccountView) {
                $scope.entity.bankAccountType = $scope.entity.bankAccountView.bankAccountType;
                if (!$scope.entity.bankAccountView.bankAccounts.length) {
                    $scope.createBankAccount();
                } else {
                    $scope.newBankAccount = false;
                    $scope.entity.bankAccount = $scope.entity.bankAccountView.bankAccounts[0];
                }
            } else {
                $scope.entity.bankAccountType = null;
            }
        });

        $scope.createBankAccount = function () {
            $scope.entity.bankAccount = {};
        };

        $scope.saveBankAccount = function (entities) {
            $scope.entity.bankAccount.bankAccountType = $scope.entity.bankAccountType;
            var bankAccount = BankAccountResource.save($scope.entity.bankAccount, function () {
                $scope.entity.bankAccount = bankAccount;
                $scope.newBankAccount = false;
                entities.push($scope.entity.bankAccount);
            });
        };

        $scope.cancel = function () {
            $location.url('/');
        };

        $scope.save = function () {
            $scope.entity.$save(function () {
                popMessage(toaster, 'success', 'Your request has been submitted.');
                $location.url('/');
            });
        };
    }])
    .controller('FundDemoAccountController', ['$scope', 'ClientFundResource', '$location', '$routeParams', 'toaster', function ($scope, resource, $location, $routeParams, toaster) {
        $scope.entity = new resource();
        $scope.entity.login = parseInt($routeParams.id);

        $scope.cancel = function () {
            $location.url('/');
        };

        $scope.save = function () {
            $scope.entity.$save(function () {
                popMessage(toaster, 'success', 'Your request has been submitted.');
                $scope.cancel();
            });
        };
    }])
    .controller('ClientSupportController', ['$scope', 'ClientSupportResource', 'toaster', function ($scope, resource, toaster) {
        $scope.caseTypes = resource.query();
        $scope.entity = new resource();

        $scope.save = function () {
            $scope.entity.$save(function () {
                $scope.entity = new resource();
                $scope.editForm.$setPristine();
                popMessage(toaster, 'success', 'Your request has been submitted.');
            });
        };
    }])
    .controller('ClientFundTransferController', ['$scope', 'ClientFundTransferResource', 'toaster', function ($scope, resource, toaster) {
        var load = function () {
            $scope.view = resource.get(function () {
                angular.forEach($scope.view.accounts, function (account) {
                    account.label = account.account + " (";
                    if (account.currency) {
                        account.label += account.currency + ":";
                    }
                    account.label += account.balance + ")";
                });
            });

            $scope.entity = new resource();
        };

        load();

        $scope.save = function () {
            $scope.entity.$save(function () {
                popMessage(toaster, 'success', 'Your application has been submitted.');
                $scope.editForm.$setPristine();
                load();
            });
        };
    }])
    .controller('ClientNewAccountController', ['$scope', 'ClientAccountResource', 'toaster', '$routeParams', '$location',
        function ($scope, resource, toaster, $routeParams, $location) {
            var load = function () {
                $scope.entity = new resource();
                $scope.entity.demoAccount = $routeParams.accountType !== 'trading';
                if ($scope.view.tradingPlatforms && $scope.view.tradingPlatforms.length) {
                    $scope.entity.tradingPlatform = $scope.view.tradingPlatforms[0].label;
                }
            };

            $scope.view = resource.get(function () {
                load();
            });

            $scope.cancel = function () {
                $location.url('/');
            };

            $scope.create = function () {
                $scope.entity.$save(function () {
                    popMessage(toaster, 'success', 'Your application has been submitted.');
                    $scope.cancel();
                });
            };
        }])
    .controller('ClientLeverageUpdateController', ['$scope', 'ClientLeverageUpdateResource', 'toaster', '$routeParams', '$location',
        function ($scope, resource, toaster, $routeParams, $location) {
            $scope.entity = new resource();
            $scope.entity.tradingAccount = $routeParams.accountType == 'trading' ? true : false;
            $scope.accountType = $scope.entity.tradingAccount ? 'Trading Account' : 'Demo Account';
            $scope.entity.login = parseInt($routeParams.accountNumber);

            var load = function () {
                $scope.view = resource.get({
                    'tradingAccount': $scope.entity.tradingAccount,
                    'login': $scope.entity.login
                }, function () {
                    angular.forEach($scope.view.leverages, function (leverage) {
                        if ($scope.view.leverage && $scope.view.leverage == leverage.value) {
                            $scope.entity.leverage = leverage.label;
                        }
                    });
                });
            };

            load();

            $scope.cancel = function () {
                $location.url('/');
            };

            $scope.save = function () {
                $scope.entity.$save(function () {
                    popMessage(toaster, 'success', 'Your request has been submitted.');
                    $scope.cancel();
                });
            };
        }])
    .controller('ClientAccountSummaryController', ['$rootScope', '$scope', 'ClientAccountSummaryResource', '$location', 'toaster',
        function ($rootScope, $scope, resource, $location, toaster) {
            var view = resource.get(function () {
                $scope.demoAccounts = view.demoAccounts;
                $scope.tradingAccounts = view.tradingAccounts;
            });

            $scope.updateLeverage = function (account, tradingAccount) {
                var url = '/client/account/update-leverage/';
                if (tradingAccount) {
                    url += 'trading/'
                } else {
                    url += 'demo/'
                }

                $location.url(url + account.login);
            };

            $scope.fundTradingAccount = function (account) {
                $location.url('/client/fund/deposit/trading/' + account.login);
            };

            $scope.fundDemoAccount = function (account) {
                $location.url('/client/fund/deposit/demo/' + account.login);
            };

            $scope.withdrawTradingAccount = function (account) {
                $location.url('/client/fund/withdraw/' + account.login);
            };

            $scope.newAccount = function (tradingAccount) {
                var url = '/client/account/';
                if (tradingAccount) {
                    url += 'trading/'
                } else {
                    url += 'demo/'
                }

                $location.url(url + 'new');
            };
        }]);