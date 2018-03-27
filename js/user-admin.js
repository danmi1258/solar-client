'use strict';

angular.module("solar.user-admin", [])
    .factory('UserResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/user/:id', {}, {});
        }])
    .factory('AgentResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/agent/:id', {}, {
                search: {params: {id: 'search'}, method: 'POST'}
            });
        }])
    .factory('WorkTypeResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/work-type/:id', {}, {
                updatePriority: {params: {id: 'priority'}, headers: {'Async-Request': 'true'}, method: 'POST'}
            });
        }])
    .factory('ClientLoginResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/client-login/:id', {}, {
                search: {params: {id: 'search'}, method: 'POST'}
            });
        }])
    .factory('SymbolVolumeMapResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/symbol-volume-map/:id', {}, {});
        }])
    .factory('Mt4GroupResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/mt4-group/:id', {}, {});
        }])
    .factory('ExchangeRateResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/exchange-rate/:id', {}, {});
        }])
    .factory('BulkPaymentResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/bulk-payment/:id', {}, {
                process: {params: {id: 'process'}, isArray: false, method: 'GET'}
            });
        }])
    .factory('CommissionDefinitionImportResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/admin/commission-definition-import/:id', {}, {
                process: {params: {id: 'process'}, isArray: false, method: 'GET'}
            });
        }])
    .factory('ClientValidationResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/validation', {}, {});
        }])
    .controller('ClientValidationController', ['$scope', 'ClientValidationResource', function ($scope, resource) {
        $scope.entity = {};

        $scope.validate = function () {
            $scope.result = resource.get({
                "id": $scope.entity.id,
                "name": $scope.entity.name
            });
        };
    }])
    .controller("CommissionDefinitionImportController", ['$scope', '$location', 'CommissionDefinitionImportResource', 'FileUploader', 'toaster', function ($scope, $location, resource, FileUploader, toaster) {
        $scope.entity = new resource();

        $scope.doImport = function () {
            resource.process({
                "file-record-id": $scope.entity.fileRecord.id
            }, function () {
                popMessage(toaster, 'success', "Commission definitions have been imported.");
                $scope.entity = new resource();
                $scope.editForm.$setPristine();
            });
        };

        $scope.download = function () {
            location.assign(REST_PREFIX + "/client/admin/commission-definition-import/download");
        };

        $scope.fileUploader = createFileUploader(FileUploader, toaster, function (response) {
            $scope.entity.fileRecord = {
                id: response.id,
                filename: response.filename
            };
        });
    }])
    .controller("BulkPaymentController", ['$scope', '$location', 'BulkPaymentResource', 'FileUploader', 'toaster', function ($scope, $location, resource, FileUploader, toaster) {
        $scope.entity = new resource();

        $scope.doImport = function () {
            resource.process({
                "file-record-id": $scope.entity.fileRecord.id
            }, function () {
                popMessage(toaster, 'success', "Your request has been submitted.");
                $scope.entity = new resource();
                $scope.editForm.$setPristine();
            });
        };

        $scope.download = function () {
            location.assign(REST_PREFIX + "/client/admin/bulk-payment/download");
        };

        $scope.fileUploader = createFileUploader(FileUploader, toaster, function (response) {
            $scope.entity.fileRecord = {
                id: response.id,
                filename: response.filename
            };
        });
    }])
    .controller("ExchangeRatesController", ['$scope', '$location', 'ExchangeRateResource', function ($scope, $location, resource) {
        $scope.view = resource.get(function () {
            if ($scope.view.exchangeRates && $scope.view.exchangeRates.length) {
                $scope.selectedDateView = $scope.view.exchangeRates[0];
            }
        });

        $scope.create = function () {
            $location.url($location.url() + "/new");
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };
    }])
    .controller("ExchangeRateController", ['$scope', '$location', 'ExchangeRateResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        $scope.cancelable = true;
        if ($routeParams.id == 'new') {
            var date = new Date();

            $scope.entity = new resource();
            $scope.entity.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
            $scope.removable = true;
            $scope.entity = resource.get({'id': $routeParams.id});
        }

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };

        $scope.save = function () {
            if ($scope.editForm.$invalid) {
                return;
            }

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
            resource.delete({id: $scope.entity.id}, function () {
                $scope.cancel();
            });
        };
    }])
    .controller("Mt4GroupsController", ['$scope', '$location', 'Mt4GroupResource', function ($scope, $location, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        $scope.groups = resource.query(function () {
            $scope.pageParams.totalItems = $scope.groups.length;
            sort();
        });

        $scope.pageChanged = function () {
            $scope.entities = getPagedEntities($scope.groups, $scope.pageParams.itemsPerPage, $scope.pageParams.currentPage);
        };

        var sort = function () {
            if (!$scope.groups) {
                return;
            }

            $scope.groups.sort(function (a, b) {
                if ($scope.predicate == 'currency') {
                    return a['currency'].localeCompare(b['currency']);
                } else if ($scope.predicate == 'mt4Server.mt4ServerType') {
                    return a['mt4Server'].mt4ServerType.localeCompare(b['mt4Server'].mt4ServerType);
                } else {
                    return a['name'].localeCompare(b['name']);
                }
            });

            if ($scope.reverse) {
                $scope.groups.reverse();
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
    .controller("SymbolVolumeMapsController", ['$scope', '$location', 'SymbolVolumeMapResource', function ($scope, $location, resource) {
        $scope.entities = resource.query();

        $scope.create = function () {
            $location.url($location.url() + "/new");
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };
    }])
    .controller("SymbolVolumeMapController", ['$scope', '$location', 'SymbolVolumeMapResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        $scope.cancelable = true;
        if ($routeParams.id == 'new') {
            $scope.entity = new resource();
        } else {
            $scope.removable = true;
            $scope.entity = resource.get({'id': $routeParams.id});
        }

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };

        $scope.save = function () {
            if ($scope.editForm.$invalid) {
                return;
            }

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
            resource.delete({id: $scope.entity.id}, function () {
                $scope.cancel();
            });
        };
    }])
    .controller("AgentsAdminController", ['$scope', 'AgentResource', '$location', function ($scope, resource, $location) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        $scope.searchParams = {
            includeArchived: false,
            itemsPerPage: $scope.pageParams.itemsPerPage
        };

        $scope.search = function () {
            $scope.searchParams.currentPage = $scope.pageParams.currentPage;
            $scope.searchParams.itemsPerPage = $scope.pageParams.itemsPerPage;

            $scope.expandAll = false;
            var view = resource.search($scope.searchParams, function () {
                $scope.pageParams.totalItems = view.totalItems;
                $scope.entities = view.users;

                angular.forEach($scope.entities, function (entity) {
                    if (entity.userLogs && entity.userLogs.length) {
                        entity.log = entity.userLogs[0];
                    }
                });
            });
        };

        $scope.$watch('expandAll', function (expand) {
            if ($scope.entities) {
                angular.forEach($scope.entities, function (entity) {
                    entity.expand = expand;
                });
            }
        });

        $scope.pageChanged = function () {
            $scope.search();
        };

        $scope.pageChanged();

        $scope.create = function () {
            $location.url($location.url() + "/new")
        };

        $scope.edit = function (user) {
            $location.url($location.url() + '/' + user.id);
        };
    }])
    .controller("AgentAdminController", ['$scope', 'AgentResource', '$location', '$routeParams', function ($scope, resource, $location, $routeParams) {
        var view = resource.get({
            "id": $routeParams.id
        }, function () {
            $scope.userLogs = view.userLogs;
            $scope.user = view.user;
            $scope.workGroups = view.workGroups;
            if ($scope.user.id) {
                $scope.workGroup = view.workGroup;
            }

            $scope.roles = [];

            angular.forEach(view.roleTypes, function (role) {
                var selected = false;

                if ($scope.user.roles) {
                    angular.forEach($scope.user.roles, function (userRole) {
                        if (userRole == role.name) {
                            selected = true;
                        }
                    });
                }

                $scope.roles.push({
                    role: role,
                    selected: selected
                });
            });

            if (view.user.id) {
                $scope.removable = true;
            }
        });

        $scope.remove = function (entity, entities) {
            removeFromList(entity, entities);
        };

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };

        $scope.save = function () {
            var view = new resource();
            view.user = $scope.user;
            if ($scope.user.workGroup) {
                view.workGroup = {
                    "id": $scope.user.workGroup.id
                };
            }

            view.user.roles = [];
            angular.forEach($scope.roles, function (role) {
                if (role.selected) {
                    view.user.roles.push(role.role.name);
                }
            });

            if ($scope.user.id) {
                view.$save({id: $scope.user.id}, function () {
                    $scope.cancel();
                });
            } else {
                view.$save(function () {
                    $scope.cancel();
                });
            }
        };

        $scope['delete'] = function () {
            resource.delete({id: $scope.user.id}, function () {
                $scope.cancel();
            });
        };
    }])
    .controller("ClientLoginsAdminController", ['$scope', 'ClientLoginResource', '$location', function ($scope, resource, $location) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 25,
            currentPage: 1,
            maxSize: 10
        };

        $scope.searchParams = {
            includeArchived: false,
            itemsPerPage: $scope.pageParams.itemsPerPage
        };

        $scope.search = function () {
            $scope.searchParams.currentPage = $scope.pageParams.currentPage;
            $scope.searchParams.itemsPerPage = $scope.pageParams.itemsPerPage;

            $scope.expandAll = false;
            var view = resource.search($scope.searchParams, function () {
                $scope.pageParams.totalItems = view.totalItems;
                $scope.entities = view.users;

                angular.forEach($scope.entities, function (entity) {
                    if (entity.userLogs && entity.userLogs.length) {
                        entity.log = entity.userLogs[0];
                    }
                });
            });
        };

        $scope.$watch('expandAll', function (expand) {
            if ($scope.entities) {
                angular.forEach($scope.entities, function (entity) {
                    entity.expand = expand;
                });
            }
        });

        $scope.pageChanged = function () {
            $scope.search();
        };

        $scope.pageChanged();

        $scope.create = function () {
            $location.url($location.url() + "/new")
        };

        $scope.edit = function (user) {
            $location.url($location.url() + '/' + user.id);
        };
    }])
    .controller("ClientLoginAdminController", ['$scope', 'ClientLoginResource', '$location', '$routeParams', '$http', function ($scope, resource, $location, $routeParams, $http) {
        var view = resource.get({
            "id": $routeParams.id
        }, function () {
            $scope.userLogs = view.userLogs;
            $scope.user = view.user;
            $scope.clients = view.clients;
            $scope.user.$client = view.client;

            if (view.user.id) {
                $scope.removable = true;
            }
        });

        $scope.doSearchClient = function (searchTerm) {
            return $http.get(REST_PREFIX + '/client/search/' + searchTerm, {
                headers: {
                    'Async-Request': 'true'
                }
            }).then(function (res) {
                var search = [];
                angular.forEach(res.data, function (item) {
                    search.push(item);
                });
                return search;
            });
        };

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };

        $scope.save = function () {
            var view = new resource();
            if ($scope.user.$client) {
                view.client = $scope.user.$client;
            }

            view.user = $scope.user;

            if ($scope.user.id) {
                view.$save({id: $scope.user.id}, function () {
                    $scope.cancel();
                });
            } else {
                view.$save(function () {
                    $scope.cancel();
                });
            }
        };

        $scope['delete'] = function () {
            resource.delete({id: $scope.user.id}, function () {
                $scope.cancel();
            });
        };
    }])
    .controller("WorkTypesController", ['$scope', '$location', 'WorkTypeResource', function ($scope, $location, resource) {
        $scope.entities = resource.query(function () {
            sort();
        });

        $scope.create = function () {
            $location.url($location.url() + "/new");
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };

        var sort = function () {
            $scope.entities.sort(function (a, b) {
                return a.priority - b.priority;
            });
        };

        $scope.moveUp = function (entity) {
            var index = $scope.entities.indexOf(entity);
            if (index == 0) {
                return;
            }
            $scope.entities.splice(index, 1);
            $scope.entities.splice(index - 1, 0, entity);

            var entities = [];
            angular.forEach($scope.entities, function (item, index) {
                item.priority = index;
                entities.push({
                    id: item.id,
                    priority: item.priority
                });
            });

            sort();
            resource.updatePriority(entities);
        };

        $scope.moveDown = function (entity) {
            var index = $scope.entities.indexOf(entity);
            if (index == $scope.entities.length - 1) {
                return;
            }
            $scope.entities.splice(index, 1);
            $scope.entities.splice(index + 1, 0, entity);

            var entities = [];
            angular.forEach($scope.entities, function (item, index) {
                item.priority = index;
                entities.push({
                    id: item.id,
                    priority: item.priority
                });
            });

            sort();
            resource.updatePriority(entities);
        };
    }])
    .controller("WorkTypeController", ['$scope', '$location', 'WorkTypeResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        $scope.cancelable = true;
        if ($routeParams.id == 'new') {
            $scope.entity = new resource();
        } else {
            $scope.removable = true;
            $scope.entity = resource.get({'id': $routeParams.id});
        }

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };

        $scope.save = function () {
            if ($scope.editForm.$invalid) {
                return;
            }

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
            resource.delete({id: $scope.entity.id}, function () {
                $scope.cancel();
            });
        };
    }])
    .controller("UsersAdminController", ['$scope', 'UserResource', '$location', function ($scope, resource, $location) {
        $scope.entities = resource.query(function () {
            angular.forEach($scope.entities, function (entity) {
                if (entity.userLogs && entity.userLogs.length) {
                    entity.log = entity.userLogs[0];
                }
            });
        });

        $scope.$watch('expandAll', function (expand) {
            if ($scope.entities) {
                angular.forEach($scope.entities, function (entity) {
                    entity.expand = expand;
                });
            }
        });

        $scope.create = function () {
            $location.url($location.url() + "/new")
        };

        $scope.edit = function (user) {
            $location.url($location.url() + '/' + user.id);
        };
    }])
    .controller("UserAdminController", ['$scope', 'UserResource', '$location', '$routeParams', function ($scope, resource, $location, $routeParams) {
        var view = resource.get({
            "id": $routeParams.id
        }, function () {
            $scope.userLogs = view.userLogs;
            $scope.user = view.user;
            $scope.workGroups = view.workGroups;
            $scope.roles = [];

            angular.forEach(view.roleTypes, function (role) {
                var selected = false;

                if ($scope.user.roles) {
                    angular.forEach($scope.user.roles, function (userRole) {
                        if (userRole == role.name) {
                            selected = true;
                        }
                    });
                }

                $scope.roles.push({
                    role: role,
                    selected: selected
                });
            });

            if (view.user.id) {
                $scope.removable = true;
            }
        });

        $scope.addWorkGroup = function (workGroup) {
            var added = false;

            angular.forEach($scope.user.workGroups, function (w) {
                if (w.id == workGroup.id) {
                    added = true;
                }
            });

            if (!added) {
                $scope.user.workGroups.push(workGroup);
            }
        };

        $scope.remove = function (entity, entities) {
            removeFromList(entity, entities);
        };

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };

        $scope.save = function () {
            var view = new resource();
            view.user = $scope.user;
            view.user.roles = [];
            angular.forEach($scope.roles, function (role) {
                if (role.selected) {
                    view.user.roles.push(role.role.name);
                }
            });

            if ($scope.user.id) {
                view.$save({id: $scope.user.id}, function () {
                    $scope.cancel();
                });
            } else {
                view.$save(function () {
                    $scope.cancel();
                });
            }
        };

        $scope['delete'] = function () {
            resource.delete({id: $scope.user.id}, function () {
                $scope.cancel();
            });
        };
    }]);