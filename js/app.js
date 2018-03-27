'use strict';

var $routeProviderReference;
var loggedIn = true;

angular.module('solar', [
    'ngRoute',
    'ngResource',
    'ngSanitize',
    'ngCookies',
    'ngAnimate',
    'ngTouch',
    'toaster',
    'angularFileUpload',
    'pascalprecht.translate',
    'angular-loading-bar',
    'ui.bootstrap',
    'oc.lazyLoad',
    'solar.translate',
    'solar.directives',
    'solar.filters',
    'solar.services'])
    .config(function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    })
    .config(['$routeProvider', function ($routeProvider) {
        $routeProviderReference = $routeProvider;
    }])
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.latencyThreshold = 500;
        cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
    }])
    .factory('SystemResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/system', {}, {});
        }])
    .factory('SystemMessageResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/system-message/:id', {}, {
                acknowledge: {
                    headers: {'Async-Request': true},
                    params: {id: 'acknowledge'},
                    method: "POST",
                    isArray: false
                }
            });
        }])
    .factory('HomeScreenResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/user/home-screen/:id', {}, {
                users: {params: {id: 'users'}, headers: {'Async-Request': true}, isArray: true},
                jobs: {params: {id: 'jobs'}, isArray: false},
                followUps: {params: {id: 'follow-ups'}, headers: {'Async-Request': true}, isArray: false},
                tasks: {params: {id: 'tasks'}, isArray: true}
            });
        }])
    .factory('CommonProfileResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/profile', {}, {});
        }])
    .factory('CommonPasswordUpdateResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/password', {}, {});
        }])
    .factory('CommonEmailUpdateResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/core/email', {}, {});
        }])
    .run(['$http', '$rootScope', 'SystemResource', '$route', '$ocLazyLoad', function ($http, $rootScope, resource, $route, $ocLazyLoad) {
        $rootScope.menus = [];
        $rootScope.integrationPoints = {};
        $rootScope.routeMap = {};
        $rootScope.systemMenu = null;

        var loadRoutes = function (routes) {
            angular.forEach(routes, function (route) {
                $routeProviderReference.when(route.route, {
                    templateUrl: route.template
                });
            });
            $routeProviderReference.when('/', {
                templateUrl: "app/home.html"
            }).otherwise({
                redirectTo: '/'
            });
        };

        var loadMenus = function (menus) {
            angular.forEach(menus, function (menu) {
                if (menu.menuItems) {
                    angular.forEach(menu.menuItems, function (item) {
                        item.menu = menu;
                        $routeProviderReference.when(item.route.route, {
                            templateUrl: item.route.template
                        });
                        $rootScope.routeMap[item.route.route] = item;

                        if (item.routes) {
                            angular.forEach(item.routes, function (route) {
                                $routeProviderReference.when(route.route, {
                                    templateUrl: route.template
                                });
                                $rootScope.routeMap[route.route] = item;
                            });
                        }
                    });
                }

                if (menu.systemMenu) {
                    $rootScope.systemMenu = menu;
                } else {
                    $rootScope.menus.push(menu);
                }
            });

            $route.reload();
        };

        var loadIntegrationPoints = function (integrations) {
            angular.forEach(integrations, function (integration) {
                $rootScope.integrationPoints[integration.name] = integration.integrationPoints;
            });
        };

        var loadDependencies = function (scripts, callback) {
            var libs = [];
            angular.forEach(scripts, function (script) {
                libs.push(script.file);
            });
            $ocLazyLoad.load(libs, {cache: false}).then(function () {
                callback && callback();
            });
        };

        var loadSystemData = function () {
            var systemData = resource.get({
                date: new Date().getTime()
            }, function () {
                $rootScope.currentUser = systemData.user;
                loadRoutes(systemData.routes);
                loadIntegrationPoints(systemData.integrations);
                loadDependencies(systemData.scripts, function () {
                    loadMenus(systemData.menus);
                });
            });
        };

        var init = function () {
            loadSystemData();
        };

        $http({
            method: 'GET',
            url: REST_PREFIX + "/public/status",
            params: {
                date: new Date().getTime()
            }
        }).then(function (response) {
            if (response.status < 200 || response.status >= 300) {
                location.assign("/");
            } else {
                var authentication = response.headers('Authentication');
                if (authentication !== "true") {
                    location.assign("/");
                } else {
                    init();
                }
            }
        }, function (response) {
            location.assign("/");
        });
    }])
    .controller("SystemMessagesCtrl", ['$scope', 'SystemMessageResource', function ($scope, resource) {
        if (!loggedIn) {
            return;
        }

        var load = function () {
            $scope.entities = resource.query();
        };

        load();

        $scope.acknowledge = function (entity) {
            if (!entity.messageBody) {
                var view = resource.acknowledge({
                    "system-message-id": entity.id
                }, null, function () {
                    entity.messageBody = view.messageBody;
                    entity.acknowledged = view.acknowledged;
                    entity.expand = !entity.expand;
                });
            } else {
                entity.expand = !entity.expand;
            }
        };

        $scope.dismiss = function (entity) {
            resource.delete({id: entity.id}, function () {
                load();
            });
        };
    }])
    .controller("HomeController", ['$scope', 'SystemMessageResource', 'HomeScreenResource', function ($scope, resource, HomeScreenResource) {
        if (!loggedIn) {
            return;
        }

        var view = resource.get({
            "id": "unread"
        }, function () {
            if (view.count) {
                if (view.count == 1) {
                    $scope.message = "You have an unread message.";
                } else {
                    $scope.message = "You have unread messages.";
                }
            }
        });

        $scope.users = HomeScreenResource.users(function () {
            $scope.homeScreenUser = $scope.users[0];
        });

        $scope.closeAlert = function () {
            $scope.message = null;
        };

        $scope.initializedTabs = {0: true};
        $scope.activeTabIndex = 0;
        $scope.activateTab = function (index) {
            $scope.initializedTabs[index] = true;
        };

        var templateMap = {};
        $scope.updateUserView = function () {
            templateMap = {};
            $scope.initializedTabs = {};
            $scope.activateTab($scope.activeTabIndex);
        };

        $scope.getTemplate = function (template) {
            if (!templateMap[template]) {
                templateMap[template] = template + "?time=" + new Date().getTime();
            }

            return templateMap[template];
        };
    }])
    .controller("NavController", ['$scope', '$http', '$timeout', '$location', '$cookieStore', '$translate', '$route', '$rootScope', 'HttpStatusManager',
        function ($scope, $http, $timeout, $location, $cookieStore, $translate, $route, $rootScope, HttpStatusManager) {
            if (!loggedIn) {
                return;
            }

            $scope.languages = languages;

            $scope.$on('$routeChangeSuccess', function (event) {
                var route = $route.current.originalPath;

                angular.forEach($rootScope.routeMap, function (item) {
                    item.selected = false;
                });
                $rootScope.selectedItem = null;

                if ($rootScope.routeMap[route]) {
                    var item = $rootScope.routeMap[route];
                    item.selected = true;
                    $rootScope.selectedItem = item;
                }
            });

            $scope.setLanguage = function (lang) {
                setLanguage($translate, $cookieStore, lang.lang);
            };

            $scope.navigateHome = function () {
                $location.url('/');
                window.scrollTo(0, 0);
            };

            $scope.navigate = function (route) {
                $location.url(route.route);
                window.scrollTo(0, 0);
            };

            $scope.logout = function () {
                $scope.loading = true;
                loggedIn = false;
                $http({
                    url: "logout",
                    params: {
                        "time": new Date().getTime()
                    }
                }).then(function (response) {
                    $cookieStore.remove("JSESSIONID");
                    $cookieStore.remove("SSORECORDID");
                    location.assign("/");
                }, function (response) {
                    $cookieStore.remove("JSESSIONID");
                    $cookieStore.remove("SSORECORDID");
                    location.assign("/");
                });
            };

            var updateStatus = function () {
                var lastRequest = HttpStatusManager.lastRequest;
                if (lastRequest) {
                    var diff = new Date().getTime() - lastRequest.getTime();
                    if (diff < 180 * 1000) {
                        return;
                    }
                }

                $http({
                    method: 'GET',
                    url: REST_PREFIX + "/public/status",
                    params: {
                        date: new Date().getTime()
                    },
                    headers: {'Async-Request': true}
                }).then(function (response) {
                }, function (response) {
                });
            };

            $timeout(updateStatus, 5000);
            window.setInterval(updateStatus, 180 * 1000);
            watchIdleEvent($scope.logout);
        }])
    .controller("CommonEmailUpdateController", ['$scope', 'CommonEmailUpdateResource', 'toaster', function ($scope, resource, toaster) {
        $scope.entity = resource.get();

        $scope.save = function () {
            $scope.entity.$save(function () {
                $scope.entity = resource.get();

                popMessage(toaster, 'success', "Your email has been updated.");
                $scope.editForm.$setPristine();
            });
        };
    }])
    .controller("CommonPasswordUpdateController", ['$scope', 'CommonPasswordUpdateResource', 'toaster', function ($scope, resource, toaster) {
        $scope.entity = new resource();

        $scope.update = function () {
            $scope.entity.$save(function () {
                $scope.entity = new resource();

                popMessage(toaster, 'success', "Your password has been updated.");
                $scope.editForm.$setPristine();
            });
        };
    }])
    .controller("CommonProfileController", ['$scope', 'CommonProfileResource', 'toaster', function ($scope, resource, toaster) {
        $scope.entity = resource.get();

        $scope.save = function () {
            var view = new resource();
            view.email = $scope.entity.email;
            view.mobilePh = $scope.entity.contact.mobilePh;
            view.contactPh = $scope.entity.contact.contactPh;

            view.$save(function () {
                popMessage(toaster, 'success', "Your profile has been updated.");
                $scope.entity = resource.get();
            });
        };
    }]);

function watchIdleEvent(evt) {
    var interval = 10;
    var idleTimeOut = 60 * 60 / interval; //1 hour
    var idleSecondsCounter = 0;
    document.onclick = function () {
        idleSecondsCounter = 0;
    };
    document.onmousemove = function () {
        idleSecondsCounter = 0;
    };
    document.onkeypress = function () {
        idleSecondsCounter = 0;
    };
    var checkIdleTime = function () {
        idleSecondsCounter++;
        if (idleSecondsCounter >= idleTimeOut) {
            evt && evt();
        }
    };

    window.setInterval(checkIdleTime, interval * 1000);
}

function dateToJSON(date) {
    if (!date) {
        return null;
    }

    var year = date.getFullYear();
    var month = "" + (date.getMonth() + 1);
    if (month.length == 1) {
        month = "0" + month;
    }
    var dateStr = "" + date.getDate();
    if (dateStr.length == 1) {
        dateStr = "0" + dateStr;
    }

    var hour = date.getHours ? "" + date.getHours() : '00';
    if (hour.length == 1) {
        hour = "0" + hour;
    }

    var minute = date.getMinutes ? "" + date.getMinutes() : '00';
    if (minute.length == 1) {
        minute = "0" + minute;
    }

    var second = date.getSeconds ? "" + date.getSeconds() : '00';
    if (second.length == 1) {
        second = "0" + second;
    }

    return "" + year + "-" + month + "-" + dateStr + " " + hour + ":" + minute + ":" + second;
}

function JSONToDate(dateStr) {
    if (dateStr) {
        var year = dateStr.substring(0, 4);
        var month = dateStr.substring(5, 7);
        var date = dateStr.substring(8, 10);
        var hour = 0;
        var minute = 0;
        var second = 0;
        if (dateStr.length == 19) {
            hour = dateStr.substring(11, 13);
            minute = dateStr.substring(14, 16);
            second = dateStr.substring(17, 19);
        }
        return new Date(year, month - 1, date, hour, minute, second);
    } else {
        return null;
    }
}

Date.prototype.toISOString = function () {
    return dateToJSON(this);
};