'use strict';

angular.module("solar.core-system-administrator", [])
    .factory('SystemAdminDomainResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/domain/:id', {}, {});
        }])
    .factory('SystemAdminConfigurationResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/configuration/:id', {}, {});
        }])
    .factory('SystemAdminDomainSummaryResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/domain-summary', {}, {});
        }])
    .factory('ScheduleResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/schedule/schedule/:id', {}, {
                nameMappings: {params: {id: 'new'}, isArray: true},
                listNameMap: {params: {id: 'nameMap'}, isArray: false},
                runTask: {params: {id: 'run'}, isArray: false, method: 'GET'}
            });
        }])
    .controller("SchedulesController", ['$scope', 'ScheduleResource', '$location', function ($scope, resource, $location) {
        $scope.listNameMap = resource.listNameMap();
        $scope.entities = resource.query();

        $scope.create = function () {
            $location.url($location.url() + "/new");
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };
    }])
    .controller("ScheduleController", ['$scope', 'ScheduleResource', '$location', '$routeParams', function ($scope, resource, $location, $routeParams) {
        if ($routeParams.id == 'new') {
            $scope.entity = new resource();
            $scope.entity.$nameMappings = resource.nameMappings();
            $scope.entity.enabled = true;
        } else {
            $scope.removable = true;
            $scope.entity = resource.get({'id': $routeParams.id});
        }

        $scope.runTask = function () {
            $scope.taskResult = resource.runTask({
                'instance-id': parseInt($routeParams.id)
            });
        };

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
    .controller('SystemDomainSummaryController', ['$scope', 'SystemAdminDomainSummaryResource', function ($scope, resource) {
        $scope.entities = resource.query();
    }])
    .controller('SystemAdminConfigurationController', ['$scope', 'SystemAdminConfigurationResource', '$location', '$routeParams', function ($scope, resource, $location, $routeParams) {
        $scope.entity = resource.get({
            "id": $routeParams.id
        }, function () {
            if ($routeParams.id != 'new') {
                $scope.removable = true;
            }
        });

        $scope.cancel = function () {
            var url = $location.url();
            $location.url(url.substr(0, url.lastIndexOf("/")));
        };

        $scope.save = function () {
            if ($scope.editForm && $scope.editForm.$invalid) {
                return;
            }

            if ($scope.entity.id || $scope.entity.id == 0) {
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
    .controller('SystemAdminConfigurationsController', ['$scope', 'SystemAdminConfigurationResource', '$location', function ($scope, resource, $location) {
        $scope.entities = resource.query();

        $scope.create = function () {
            $location.url($location.url() + "/new");
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };
    }])
    .controller('SystemAdminDomainsController', ['$scope', 'SystemAdminDomainResource', '$location', function ($scope, resource, $location) {
        $scope.entities = resource.query();

        $scope.create = function () {
            $location.url($location.url() + "/new");
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };
    }])
    .controller('SystemAdminDomainController', ['$scope', 'SystemAdminDomainResource', '$location', '$routeParams', 'FileUploader', 'toaster',
        function ($scope, resource, $location, $routeParams, FileUploader, toaster) {
            if ($routeParams.id == 'new') {
                $scope.entity = resource.get({'id': $routeParams.id}, function () {
                    $scope.entity.domainImage = {};
                    $scope.entity.domainConfiguration = {};
                    $scope.user = {};
                    $scope.contact = {};
                    $scope.timezones = $scope.entity.timezones;
                    $scope.languageTypes = $scope.entity.languageTypes;
                    $scope.entity.languageTypes = null;
                    $scope.entity.timezones = null;
                });
            } else {
                $scope.entity = resource.get({'id': $routeParams.id}, function () {
                    if (!$scope.entity.domainImage) {
                        $scope.entity.domainImage = {};
                    }
                    if (!$scope.entity.domainConfiguration) {
                        $scope.entity.domainConfiguration = {};
                    }
                    $scope.timezones = $scope.entity.timezones;
                    $scope.languageTypes = $scope.entity.languageTypes;
                    $scope.entity.languageTypes = null;
                    $scope.entity.timezones = null;
                });
            }

            $scope.save = function () {
                if ($scope.entity.id) {
                    $scope.entity.$save({id: $scope.entity.id}, function () {
                        $scope.cancel();
                    });
                } else {
                    var view = new resource();
                    view.domain = $scope.entity;
                    view.user = $scope.user;
                    view.contact = $scope.contact;

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

            $scope.cancel = function () {
                var url = $location.url();
                $location.url(url.substr(0, url.lastIndexOf("/")));
            };

            $scope.logoUploader = createFileUploader(FileUploader, toaster, function (response) {
                if (!$scope.entity.domainImage) {
                    $scope.entity.domainImage = {};
                }

                $scope.entity.domainImage.logo = {
                    id: response.id
                };
            });

            $scope.thumbUploader = createFileUploader(FileUploader, toaster, function (response) {
                if (!$scope.entity.domainImage) {
                    $scope.entity.domainImage = {};
                }

                $scope.entity.domainImage.thumbnail = {
                    id: response.id
                };
            });

            $scope.icoUploader = createFileUploader(FileUploader, toaster, function (response) {
                if (!$scope.entity.domainImage) {
                    $scope.entity.domainImage = {};
                }

                $scope.entity.domainImage.ico = {
                    id: response.id
                };
            });
        }]);