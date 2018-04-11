'use strict';

angular.module("solar.core-broker", [])
    .factory('WorkGroupAdminResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/work-group/:id', {}, {});
        }])
    .factory('JobDefinitionResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/user/job-definition/:id', {}, {});
        }])
    .factory('ClientSummaryAdminResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/summary/:id', {}, {});
        }])
    .factory('TradingActivityResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/account/trading-activity', {}, {});
        }])
    .factory('CashActivityResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/account/cash-activity', {}, {
                search: {isArray: true, method: 'POST'}
            });
        }])
    .factory('ClientListResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/list', {}, {});
        }])
    .factory('NewClientResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/new', {}, {});
        }])
    .factory('ClientSummaryListResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/summary-list', {}, {});
        }])
    .factory('RewardEventResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/reward-event/:id', {}, {
                search: {params: {id: 'search'}, isArray: true, method: 'POST'}
            });
        }])
    .factory('RewardEventClientsResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/reward-event/:id/clients', {}, {});
        }])
    .factory('StaffPerformanceReportResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/report/staff-performance-report', {}, {});
        }])
    .factory('WorkGroupImportResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/work-group-import/:id', {}, {
                process: {params: {id: 'process'}, isArray: false, method: 'GET'}
            });
        }])
    .factory('FundTransferReportResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/report/fund-transfer-report/:id', {}, {
                process: {params: {id: 'process'}, isArray: false, method: 'GET'}
            });
        }])
    .factory('PositionResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/account/position', {}, {});
        }])
    .factory('ClientLoginProducerResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/login-producer/client', {}, {});
        }])
    .factory('AgentLoginProducerResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/login-producer/agent', {}, {});
        }])
    .factory('SystemMessageAdminResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/admin/system-message/:id', {}, {});
        }])
    .factory('CommissionAdminResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/commission/:id', {}, {});
        }])
    .factory('ScheduledEventResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/scheduled-event/:id', {}, {});
        }])
    .factory('RebateReportResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/report/rebate-report/:id', {}, {});
        }])
    .factory('ClientImportResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/import/:id', {}, {
                process: {params: {id: 'process'}, isArray: false, method: 'GET'}
            });
        }])
    .controller("ClientImportController", ['$scope', '$location', 'ClientImportResource', 'FileUploader', 'toaster', function ($scope, $location, resource, FileUploader, toaster) {
        $scope.entity = new resource();

        $scope.doImport = function () {
            $scope.result = resource.process({
                "file-record-id": $scope.entity.fileRecord.id
            }, function () {
                if ($scope.result.success) {
                    popMessage(toaster, 'success', "Clients have been imported.");
                }
                $scope.entity = new resource();
                $scope.editForm.$setPristine();
            });
        };

        $scope.download = function () {
            location.assign(REST_PREFIX + "/client/import/download");
        };

        $scope.fileUploader = createFileUploader(FileUploader, toaster, function (response) {
            $scope.entity.fileRecord = {
                id: response.id,
                filename: response.filename
            };
        });
    }])
    .controller('RebateReportController', ['$scope', 'RebateReportResource', function ($scope, resource) {
        $scope.searchParams = resource.get(function () {
            var date = new Date();
            $scope.searchParams.startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            $scope.searchParams.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $scope.workGroups = $scope.searchParams.workGroups;
            $scope.searchParams.workGroups = null;
        });

        $scope.export = function () {
            var file = resource.save($scope.searchParams, function () {
                location.assign(REST_PREFIX + "/client/report/rebate-report/download/" + file.id);
            });
        };
    }])
    .controller('ScheduledEventsController', ['$scope', 'ScheduledEventResource', '$location', function ($scope, resource, $location) {
        $scope.entities = resource.query();

        $scope.create = function () {
            $location.url($location.url() + "/new");
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };
    }])
    .controller('ScheduledEventController', ['$scope', 'ScheduledEventResource', '$routeParams', '$location', function ($scope, resource, $routeParams, $location) {
        if ($routeParams.id == 'new') {
            $scope.entity = new resource();
        } else {
            $scope.entity = resource.get({'id': $routeParams.id}, function () {
                $scope.removable = true;
                $scope.entity.startDate = JSONToDate($scope.entity.startDate);
                $scope.entity.endDate = JSONToDate($scope.entity.endDate);
            });
        }

        $scope.save = function () {
            if ($scope.entity.id) {
                $scope.entity.$save({id: $scope.entity.id}, function () {
                    $scope.cancel();
                });
            } else {
                $scope.entity.$save(function () {
                    $scope.cancel();
                });
            }
        };

        $scope['delete'] = function () {
            resource.delete({id: $scope.user.id}, function () {
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };
    }])
    .controller("CommissionAdminListController", ['$scope', 'CommissionAdminResource', '$location', function ($scope, resource, $location) {
        $scope.entities = resource.query();

        $scope.$watch('expandAll', function (expand) {
            if ($scope.entities) {
                angular.forEach($scope.entities, function (entity) {
                    entity.expand = expand;
                });
            }
        });

        $scope.calculateTotalPortalWeight = function (entity) {
            var sum = 0;
            angular.forEach(entity.commissionLevelDefinitions, function (item) {
                sum += item.portalWeight;
            });
            return sum;
        };

        $scope.calculateTotalCommissionWeight = function (entity) {
            var sum = 0;
            angular.forEach(entity.commissionLevelDefinitions, function (item) {
                sum += item.commissionWeight;
            });
            return sum;
        };

        $scope.create = function () {
            $location.url($location.url() + "/new");
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };
    }])
    .controller("CommissionAdminController", ['$scope', 'CommissionAdminResource', '$location', '$routeParams', function ($scope, resource, $location, $routeParams) {
        var groupSize = 5;

        $scope.levels = [];
        for (var i = 1; i < 51; i++) {
            $scope.levels.push(i);
        }

        $scope.params = {
            levels: 1
        };


        $scope.calculateWeight = function () {
            $scope.sumWeight = {
                portalWeight: 0,
                commissionWeight: 0
            };

            if (!$scope.entityGroups) {
                return;
            }

            angular.forEach($scope.entityGroups, function (commissionLevelDefinitions) {
                angular.forEach(commissionLevelDefinitions, function (definition) {
                    if (definition.portalWeight) {
                        $scope.sumWeight.portalWeight += definition.portalWeight;
                    }

                    if (definition.commissionWeight) {
                        $scope.sumWeight.commissionWeight += definition.commissionWeight;
                    }
                });
            });
        };

        $scope.view = resource.get({
            "id": $routeParams.id
        }, function () {
            $scope.view.mt4Groups.sort();
            if ($routeParams.id == 'new') {
                $scope.entity = new resource();
                $scope.entity.commissionLevelDefinitions = [];

            } else {
                $scope.removable = true;
                $scope.entity = $scope.view.entity;
                $scope.params.levels = $scope.entity.commissionLevelDefinitions.length - 1;

                angular.forEach($scope.view.workGroups, function (workGroup) {
                    if ($scope.entity.workGroup && $scope.entity.workGroup.id == workGroup.id) {
                        $scope.entity.workGroup = workGroup;
                    }
                });
            }

            $scope.$watch('params.levels', function (levels) {
                var existing = $scope.entity.commissionLevelDefinitions;
                var commissionLevelDefinitions = [];
                for (var i = 0; i <= levels; i++) {
                    if (existing[i]) {
                        commissionLevelDefinitions.push(existing[i]);
                    } else {
                        commissionLevelDefinitions.push({});
                    }

                    commissionLevelDefinitions[i].level = i;
                    if (!commissionLevelDefinitions[i].workGroupCategory) {
                        commissionLevelDefinitions[i].workGroupCategory = $scope.view.workGroupCategories[0].label;
                        commissionLevelDefinitions[i].portalWeight = 0;
                        commissionLevelDefinitions[i].commissionWeight = 0;
                    }
                }

                $scope.entity.commissionLevelDefinitions = commissionLevelDefinitions;

                $scope.entityGroups = [];
                var curr = [];
                for (var i = 0; i <= levels; i++) {
                    curr.push($scope.entity.commissionLevelDefinitions[i]);

                    if (curr.length == groupSize) {
                        $scope.entityGroups.push(curr);
                        curr = [];
                    }
                }

                if (curr.length) {
                    $scope.entityGroups.push(curr);
                }

                $scope.calculateWeight();
            });
        });

        $scope.save = function () {
            if ($scope.editForm.$invalid) {
                return;
            }

            if ($scope.entity.id) {
                resource.save({id: $scope.entity.id}, $scope.entity, function () {
                    $scope.cancel();
                });
            } else {
                $scope.entity.$save(function () {
                    $scope.cancel();
                });
            }
        };

        $scope['delete'] = function () {
            resource.delete({id: $scope.entity.id}, function () {
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };
    }])
    .controller("SystemMessageAdminCtrl", ['$scope', 'SystemMessageAdminResource', 'toaster', function ($scope, resource, toaster) {
        $scope.entity = {};

        $scope.view = resource.get();

        $scope.save = function () {
            resource.save($scope.entity, function () {
                $scope.entity = {};
                $scope.editForm.$setPristine();
                popMessage(toaster, 'success', "Message has been sent.");
            });
        };
    }])
    .controller('ClientLoginProducerController', ['$scope', 'ClientLoginProducerResource', function ($scope, resource) {
        $scope.process = function () {
            $scope.loginView = resource.save(function () {
                if ($scope.loginView && $scope.loginView.fileRecord) {
                    location.assign(REST_PREFIX + "/client/admin/login-producer/client/download/" + $scope.loginView.fileRecord.id);
                }
            });
        };
    }])
    .controller('AgentLoginProducerController', ['$scope', 'AgentLoginProducerResource', function ($scope, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        $scope.workGroups = resource.query(function () {
            $scope.pageParams.totalItems = $scope.workGroups.length;
            sort();
        });

        $scope.pageChanged = function () {
            $scope.entities = getPagedEntities($scope.workGroups, $scope.pageParams.itemsPerPage, $scope.pageParams.currentPage);
        };

        var sort = function () {
            if (!$scope.workGroups) {
                return;
            }

            $scope.workGroups.sort(function (a, b) {
                if ($scope.predicate == 'mt4Account') {
                    return a[$scope.predicate] - b[$scope.predicate];
                } else if ($scope.predicate == 'name') {
                    return a['name'].localeCompare(b['name']);
                }
            });

            if ($scope.reverse) {
                $scope.workGroups.reverse();
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
    .controller('LoginAdminController', ['$scope', function ($scope) {
        $scope.initializedTabs = {0: true};

        $scope.activateTab = function (index) {
            $scope.initializedTabs[index] = true;
        };
    }])
    .controller("PositionsController", ['$scope', '$location', 'PositionResource', function ($scope, $location, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        var loaded = false;

        $scope.searchParams = resource.get(function () {
            $scope.predicate = 'deal';
            $scope.reverse = true;
            var date = new Date();
            $scope.searchParams.startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            $scope.searchParams.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $scope.workGroups = $scope.searchParams.workGroups;
            $scope.searchParams.workGroups = null;
            $scope.search();
        });

        $scope.search = function (reload) {
            if (reload) {
                $scope.pageParams.currentPage = 1;
            }

            $scope.searchParams.itemsPerPage = $scope.pageParams.itemsPerPage;
            $scope.searchParams.currentPage = $scope.pageParams.currentPage;
            $scope.searchParams.sortBy = $scope.predicate;
            $scope.searchParams.reverse = $scope.reverse;

            $scope.expandAll = false;
            var view = resource.save($scope.searchParams, function () {
                $scope.pageParams.totalItems = view.totalItems;
                $scope.tradings = view.tradings;
                loaded = true;
            });
        };

        $scope.pageChanged = function () {
            $scope.search();
        };

        $scope.reload = function () {
            loaded && $scope.search();
        };

        $scope.$watch('expandAll', function (expand) {
            if ($scope.tradings) {
                angular.forEach($scope.tradings, function (trading) {
                    trading.expand = expand;
                });
            }
        });
    }])
    .controller('FundTransferReportController', ['$scope', 'FundTransferReportResource', function ($scope, resource) {
        var date = new Date();
        $scope.searchParams = {};
        $scope.searchParams.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        $scope.searchParams.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        $scope.export = function () {
            var file = resource.save($scope.searchParams, function () {
                location.assign(REST_PREFIX + "/client/report/fund-transfer-report/download/" + file.id);
            });
        };
    }])
    .controller("WorkGroupImportController", ['$scope', '$location', 'WorkGroupImportResource', 'FileUploader', 'toaster', function ($scope, $location, resource, FileUploader, toaster) {
        $scope.entity = new resource();

        $scope.doExport = function () {
            location.assign(REST_PREFIX + "/client/admin/work-group-import/export");
        };

        $scope.doImport = function () {
            $scope.result = resource.process({
                "file-record-id": $scope.entity.fileRecord.id
            }, function () {
                if ($scope.result.success) {
                    popMessage(toaster, 'success', "Work groups have been imported.");

                    if ($scope.result.fileRecord) {
                        location.assign(REST_PREFIX + "/client/admin/work-group-import/download/" + $scope.result.fileRecord.id);
                    }
                }
                $scope.entity = new resource();
                $scope.editForm.$setPristine();
            });
        };

        $scope.download = function () {
            location.assign(REST_PREFIX + "/client/admin/work-group-import/download");
        };

        $scope.fileUploader = createFileUploader(FileUploader, toaster, function (response) {
            $scope.entity.fileRecord = {
                id: response.id,
                filename: response.filename
            };
        });
    }])
    .controller('StaffPerformanceReportController', ['$scope', 'StaffPerformanceReportResource', function ($scope, resource) {
        $scope.searchParams = resource.get(function () {
            var date = new Date();
            $scope.searchParams.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            $scope.searchParams.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $scope.users = $scope.searchParams.users;
            $scope.searchParams.users = null;
        });

        $scope.export = function () {
            var file = resource.save($scope.searchParams, function () {
                location.assign(REST_PREFIX + "/client/report/staff-performance-report/download/" + file.id);
            });
        };
    }])
    .controller('RewardEventClientsController', ['$scope', 'RewardEventClientsResource', '$routeParams', '$location', function ($scope, resource, $routeParams, $location) {
        $scope.entity = resource.get({
            "id": $routeParams.id
        });

        $scope.back = function () {
            $location.url('/client/admin/reward-event');
        };
    }])
    .controller('RewardEventsController', ['$scope', 'RewardEventResource', '$routeParams', '$location', function ($scope, resource, $routeParams, $location) {
        var date = new Date();
        $scope.searchParams = {
            startDate: new Date(date.getFullYear(), date.getMonth() - 6, 1),
            endDate: new Date(date.getFullYear(), date.getMonth() + 6, 1)
        };

        $scope.search = function () {
            $scope.entities = resource.search($scope.searchParams, function () {
                angular.forEach($scope.entities, function (entity) {
                    entity.param = "event=" + entity.id;
                });
            });
        };

        $scope.search();

        $scope.view = function (entity) {
            $location.url($location.url() + "/" + entity.id + "/client");
        };

        $scope.create = function () {
            $location.url($location.url() + "/new");
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };
    }])
    .controller('RewardEventController', ['$scope', 'RewardEventResource', '$routeParams', '$location', function ($scope, resource, $routeParams, $location) {
        $scope.dateOptions = {
            formatYear: 'yy',
            minDate: new Date(),
            startingDay: 1
        };

        if ($routeParams.id == 'new') {
            $scope.entity = new resource();
        } else {
            $scope.entity = resource.get({'id': $routeParams.id}, function () {
                $scope.removable = true;
                $scope.entity.startDate = JSONToDate($scope.entity.startDate);
                $scope.entity.endDate = JSONToDate($scope.entity.endDate);
            });
        }

        $scope.save = function () {
            if ($scope.entity.id) {
                $scope.entity.$save({id: $scope.entity.id}, function () {
                    $scope.cancel();
                });
            } else {
                $scope.entity.$save(function () {
                    $scope.cancel();
                });
            }
        };

        $scope['delete'] = function () {
            resource.delete({id: $scope.user.id}, function () {
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };
    }])
    .controller("ClientSummaryListController", ['$scope', '$location', 'ClientSummaryListResource', function ($scope, $location, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        $scope.search = function () {
            $scope.expandAll = false;

            var view = resource.save($scope.searchParams, function () {
                $scope.pageParams.totalItems = view.clients.length;
                $scope.clients = view.clients;

                sort();
            });
        };

        $scope.searchParams = resource.get(function () {
            $scope.searchParams.demoLoginOnly = false;
            $scope.search();
        });

        $scope.pageChanged = function () {
            $scope.entities = getPagedEntities($scope.clients, $scope.pageParams.itemsPerPage, $scope.pageParams.currentPage);
        };

        $scope.$watch('expandAll', function (expand) {
            if ($scope.entities) {
                angular.forEach($scope.entities, function (entity) {
                    entity.expand = expand;
                });
            }
        });

        var sort = function () {
            if (!$scope.clients) {
                return;
            }

            $scope.clients.sort(function (a, b) {
                if ($scope.predicate == 'client.label') {
                    return a['client'].label.localeCompare(b['client'].label);
                } else if ($scope.predicate == 'client.clientType') {
                    return a['client'].clientType.localeCompare(b['client'].clientType);
                } else if ($scope.predicate == 'client.clientStatus') {
                    return a['client'].clientStatus.localeCompare(b['client'].clientStatus);
                } else if ($scope.predicate == 'client.email') {
                    return a['client'].email.localeCompare(b['client'].email);
                } else if ($scope.predicate == 'client.created') {
                    return a['client'].created.localeCompare(b['client'].created);
                } else if ($scope.predicate == 'updated') {
                    return a['updated'].localeCompare(b['updated']);
                }
            });

            if (!$scope.reverse) {
                $scope.clients.reverse();
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
    .controller("NewClientController", ['$scope', 'NewClientResource', '$location', function ($scope, resource, $location) {
        $scope.view = resource.get(function () {
            $scope.entity = new resource();
            $scope.entity.client = {
                contact: {}
            };
            $scope.entity.client.clientType = $scope.view.clientTypes[0].label;
        });

        $scope.save = function () {
            var client = resource.save($scope.entity, function () {
                $location.url('/user/client/' + client.id + '/home');
            });
        };
    }])
    .controller("ClientListController", ['$scope', '$location', 'ClientListResource', function ($scope, $location, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        $scope.search = function (reload) {
            window.scrollTo(0, 0);

            if (reload) {
                $scope.pageParams.currentPage = 1;
            }

            $scope.searchParams.itemsPerPage = $scope.pageParams.itemsPerPage;
            $scope.searchParams.currentPage = $scope.pageParams.currentPage;

            $scope.expandAll = false;
            var view = resource.save($scope.searchParams, function () {
                $scope.pageParams.totalItems = view.totalItems;
                $scope.entities = view.clients;
            });
        };

        $scope.searchParams = resource.get(function () {
            $scope.workGroups = $scope.searchParams.workGroups;
            $scope.searchParams.workGroups = null;
            $scope.search();
        });

        $scope.pageChanged = function () {
            $scope.search();
        };

        $scope.$watch('expandAll', function (expand) {
            if ($scope.entities) {
                angular.forEach($scope.entities, function (entity) {
                    entity.expand = expand;
                });
            }
        });
    }])
    .controller("CashActivityController", ['$scope', '$location', 'CashActivityResource', function ($scope, $location, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        var loaded = false;
        $scope.searchParams = resource.get(function () {
            $scope.predicate = 'date';
            $scope.reverse = true;
            var date = new Date();
            $scope.searchParams.startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            $scope.searchParams.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $scope.workGroups = $scope.searchParams.workGroups;
            $scope.searchParams.workGroups = null;
            $scope.search();
        });

        $scope.search = function (reload) {
            if (reload) {
                $scope.pageParams.currentPage = 1;
            }

            $scope.searchParams.itemsPerPage = $scope.pageParams.itemsPerPage;
            $scope.searchParams.currentPage = $scope.pageParams.currentPage;
            $scope.searchParams.sortBy = $scope.predicate;
            $scope.searchParams.reverse = $scope.reverse;

            $scope.expandAll = false;
            var view = resource.save($scope.searchParams, function () {
                $scope.pageParams.totalItems = view.totalItems;
                $scope.tradings = view.tradings;
                loaded = true;
            });
        };

        $scope.pageChanged = function () {
            $scope.search();
        };

        $scope.reload = function () {
            loaded && $scope.search();
        };

        $scope.$watch('expandAll', function (expand) {
            if ($scope.tradings) {
                angular.forEach($scope.tradings, function (trading) {
                    trading.expand = expand;
                });
            }
        });
    }])
    .controller("TradingActivityController", ['$scope', '$location', 'TradingActivityResource', function ($scope, $location, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        var loaded = false;

        $scope.searchParams = resource.get(function () {
            $scope.predicate = 'deal';
            $scope.reverse = true;
            var date = new Date();
            $scope.searchParams.startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            $scope.searchParams.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $scope.workGroups = $scope.searchParams.workGroups;
            $scope.searchParams.workGroups = null;
            $scope.search();
        });

        $scope.search = function (reload) {
            if (reload) {
                $scope.pageParams.currentPage = 1;
            }

            $scope.searchParams.itemsPerPage = $scope.pageParams.itemsPerPage;
            $scope.searchParams.currentPage = $scope.pageParams.currentPage;
            $scope.searchParams.sortBy = $scope.predicate;
            $scope.searchParams.reverse = $scope.reverse;

            $scope.expandAll = false;
            var view = resource.save($scope.searchParams, function () {
                $scope.pageParams.totalItems = view.totalItems;
                $scope.tradings = view.tradings;
                loaded = true;
            });
        };

        $scope.pageChanged = function () {
            $scope.search();
        };

        $scope.reload = function () {
            loaded && $scope.search();
        };

        $scope.$watch('expandAll', function (expand) {
            if ($scope.tradings) {
                angular.forEach($scope.tradings, function (trading) {
                    trading.expand = expand;
                });
            }
        });
    }])
    .controller("ClientSummaryAdminController", ['$scope', 'ClientSummaryAdminResource', '$location', '$routeParams', '$rootScope', 'toaster',
        function ($scope, resource, $location, $routeParams, $rootScope, toaster) {
            var load = function () {
                $scope.view = resource.get({
                    "id": $routeParams.id
                }, function () {
                    $scope.entity = $scope.view.client;
                });
            };

            load();

            $scope.save = function () {
                resource.save({
                    "id": $routeParams.id
                }, $scope.entity, function () {
                    popMessage(toaster, 'info', "Client has been updated.");
                    load();
                });
            };
        }])
    .controller("JobDefinitionsController", ['$scope', '$location', 'JobDefinitionResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        $scope.view = resource.get({
            "team-id": $routeParams.id
        }, function () {
            $scope.team = $scope.view.team;
            $scope.entities = $scope.view.jobDefinitionVersions;
        });

        $scope.back = function () {
            $location.url('/user/team/' + $scope.team.id + '/home');
        };

        $scope.create = function () {
            $location.url($location.url() + '/new');
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.jobDefinition.id);
        };
    }])
    .controller("JobDefinitionController", ['$scope', '$location', 'JobDefinitionResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        $scope.cancelable = true;

        var view = resource.get({
            'id': $routeParams.id,
            'team-id': $routeParams.team_id
        }, function () {
            $scope.jobDefinition = view.jobDefinition;
            $scope.jobDefinitionVersion = view.jobDefinitionVersion;
            $scope.taskDescriptions = view.taskDescriptions;
            $scope.taskDescriptions.sort(function (a, b) {
                return a.priority - b.priority;
            });

            $scope.jobTypes = view.jobTypes;
            $scope.users = view.users;

            angular.forEach($scope.users, function (user) {
                if ($scope.jobDefinitionVersion.supervisor && $scope.jobDefinitionVersion.supervisor.id == user.id) {
                    $scope.jobDefinitionVersion.supervisor = user;
                }

                angular.forEach($scope.taskDescriptions, function (task) {
                    if (task.assignee && task.assignee.id == user.id) {
                        task.assignee = user;
                    }
                });
            });

            if ($scope.jobDefinition.id) {
                $scope.removable = true;
            }
        });

        $scope.remove = function (entity, entities) {
            removeFromList(entity, entities);
        };

        $scope.moveUp = function (entity, entities) {
            var index = entities.indexOf(entity);
            if (index == 0) {
                return;
            }
            entities.splice(index, 1);
            entities.splice(index - 1, 0, entity);

            angular.forEach(entities, function (item, index) {
                item.priority = index;
            });
        };

        $scope.moveDown = function (entity, entities) {
            var index = entities.indexOf(entity);
            if (index == entities.length - 1) {
                return;
            }

            entities.splice(index, 1);
            entities.splice(index + 1, 0, entity);

            angular.forEach(entities, function (item, index) {
                item.priority = index;
            });
        };

        $scope.save = function () {
            var entity = {
                jobDefinition: $scope.jobDefinition,
                jobDefinitionVersion: $scope.jobDefinitionVersion,
                taskDescriptions: $scope.taskDescriptions
            };

            angular.forEach(entity.taskDescriptions, function (task, index) {
                task.priority = index;
            });

            if ($scope.jobDefinition.id) {
                resource.save({id: $scope.jobDefinition.id}, entity, function () {
                    $scope.cancel();
                });
            } else {
                resource.save(entity, function () {
                    $scope.cancel();
                });
            }
        };

        $scope['delete'] = function () {
            resource['delete']({id: $scope.jobDefinition.id}, function () {
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            $location.url('/user/team/' + $routeParams.team_id + '/job-definition');
        };
    }])
    .controller("TeamAdminCtrl", ['$scope', '$location', '$routeParams', 'TeamResource', function ($scope, $location, $routeParams, resource) {
        $scope.cancelable = true;

        if (!$routeParams.id) {
            $scope.entity = resource.get({'id': $routeParams.id});
        } else {
            $scope.removable = true;
            $scope.entity = resource.get({'id': $routeParams.id}, function () {
                angular.forEach($scope.entity.$users, function (u) {
                    angular.forEach($scope.entity.users, function (user) {
                        if (user.id == u.id) {
                            angular.copy(u, user);
                        }
                    });

                    if ($scope.entity.head && $scope.entity.head.id == u.id) {
                        $scope.entity.head = u;
                    }
                });
            });
        }

        $scope.remove = function (entity, entities) {
            removeFromList(entity, entities);
        };

        $scope.addUser = function (user) {
            var added = false;
            if (!$scope.entity.users) {
                $scope.entity.users = [];
            }

            angular.forEach($scope.entity.users, function (u) {
                if (user.id == u.id) {
                    added = true;
                }
            });

            if (!added) {
                $scope.entity.users.push(user);
            }
        };

        $scope.save = function () {
            var entity = {};
            for (var prop in $scope.entity) {
                if (prop.indexOf('$') == -1) {
                    entity[prop] = $scope.entity[prop];
                }
            }

            if ($scope.entity.id) {
                resource.save({id: $scope.entity.id}, entity, function () {
                    $scope.cancel();
                });
            } else {
                resource.save(entity, function () {
                    $scope.cancel();
                });
            }
        };

        $scope['delete'] = function () {
            resource['delete']({id: $scope.entity.id}, function () {
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            $location.url('/user/team/');
        };
    }])
    .controller("WorkGroupsAdminController", ['$scope', '$location', 'WorkGroupAdminResource', '$timeout', function ($scope, $location, resource, $timeout) {
        var maxResults = 50;

        $scope.entities = resource.query(function () {
            var map = {};
            angular.forEach($scope.entities, function (entity) {
                map[entity.id] = entity;
            });

            angular.forEach($scope.entities, function (entity) {
                if (entity.parentWorkGroup) {
                    var parentId = entity.parentWorkGroup.id;
                    var parent = map[parentId];
                    entity.parentWorkGroup = parent;
                    parent.hasChildren = true;

                    if (!parent.workGroups) {
                        parent.workGroups = [];
                    }
                    parent.workGroups.push(entity);
                }
            });

            $scope.topWorkGroups = [];
            angular.forEach($scope.entities, function (entity) {
                if (!entity.parentWorkGroup) {
                    $scope.topWorkGroups.push(entity);
                }
            });
        });

        $scope.search = function () {
            $scope.result = [];
            angular.forEach($scope.entities, function (entity) {
                if ($scope.result.length < maxResults) {
                    var match = false;
                    if (entity.mt4Account != null) {
                        var str = "" + entity.mt4Account;
                        if (str.toLowerCase().indexOf($scope.searchTerm.toLowerCase()) !== -1) {
                            $scope.result.push(entity);
                            match = true;
                        }
                    }

                    if (!match && entity.name.toLowerCase().indexOf($scope.searchTerm.toLowerCase()) !== -1) {
                        $scope.result.push(entity);
                    }
                }
            });
        };

        var doExpand = function (expand) {
            angular.forEach($scope.entities, function (entity) {
                if (entity.hasChildren) {
                    entity.expand = expand;
                }
            });
            $scope.expand = expand;
            $scope.loadingTree = false;
        };

        $scope.expandAll = function (expand) {
            $scope.loadingTree = true;
            $timeout(function () {
                doExpand(expand);
            });
        };

        $scope.create = function () {
            $location.url($location.url() + "/new")
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };
    }])
    .controller("WorkGroupAdminController", ['$scope', 'WorkGroupAdminResource', '$location', '$routeParams', function ($scope, resource, $location, $routeParams) {
        var view = resource.get({'id': $routeParams.id}, function () {
            $scope.entity = view.workGroup;
            $scope.workGroups = view.workGroups;
            $scope.workGroupCategories = view.workGroupCategories;

            if ($scope.entity.id) {
                $scope.removable = true;
                angular.forEach($scope.workGroups, function (workGroup) {
                    if ($scope.entity.parentWorkGroup
                        && $scope.entity.parentWorkGroup.id
                        && $scope.entity.parentWorkGroup.id == workGroup.id) {
                        $scope.entity.parentWorkGroup = workGroup;
                    }
                });
            }
        });

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };

        $scope.save = function () {
            if ($scope.editForm.$invalid) {
                return;
            }

            var view = new resource();
            view.workGroup = $scope.entity;

            if ($scope.entity.id || $scope.entity.id == 0) {
                view.$save({id: $scope.entity.id}, function () {
                    $scope.cancel();
                });
            } else {
                view.$save(function () {
                    $scope.cancel();
                });
            }
        };

        $scope['delete'] = function () {
            resource.delete({id: $scope.entity.id}, function () {
                $scope.cancel();
            });
        };
    }]);