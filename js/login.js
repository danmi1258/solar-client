'use strict';

var tag = new Date().getTime();
angular.module('login', [
    'ngRoute',
    'ngResource',
    'ngAnimate',
    'toaster',
    'angularFileUpload',
    'pascalprecht.translate',
    'ngCookies',
    'solar.translate',
    'ui.bootstrap'])
    .config(function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    })
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'login.html'
        }).otherwise({
            redirectTo: '/'
        });
    }])
    .directive('bindUnsafeHtml', [function () {
        return {
            template: "{{directiveData.message|translate}}"
        };
    }])
    .factory('loadingScreenHttpInterceptor', ['$q', 'toaster', function ($q, toaster) {
        var popMessages = function (messages) {
            angular.forEach(messages, function (message) {
                toaster.pop({
                    type: 'error',
                    body: 'bind-unsafe-html',
                    bodyOutputType: 'directive',
                    directiveData: {
                        message: message
                    }
                });
            });
        };

        var handleError = function (rejection) {
            if (rejection.headers('Validation-Error')) {
                var message = rejection.headers('Validation-Error');
                popMessages([message]);
                return;
            }

            if (rejection.status <= 0 || rejection.status == 404 || rejection.status == 502) {
                popMessages(["Server is not available at the moment. Please try it later."]);
            } else if (rejection.status >= 500) {
                popMessages(['Failed to proceed your request.']);
            }
        };

        return {
            request: function (config) {
                return config || $q.when(config);
            },

            response: function (response) {
                return response || $q.when(response);
            },

            responseError: function (rejection) {
                handleError(rejection);
                return $q.reject(rejection);
            }
        };
    }])
    .factory("noCacheInterceptor", [function () {
        var noCacheFolders = ["app", "frame"];

        var shouldApplyNoCache = function (config) {
            // The logic in here can be anything you like, filtering on
            // the HTTP method, the URL, even the request body etc.
            for (var i = 0; i < noCacheFolders.length; i++) {
                var folder = noCacheFolders[i];
                if (config.url.indexOf(folder + "/") === 0) {
                    return true;
                }
            }
            return false;
        };

        var applyNoCache = function (config) {
            if (config.url.indexOf("?") !== -1) {
                config.url += "&";
            } else {
                config.url += "?";
            }
            config.url += "nocache=" + tag;
        };

        var interceptor = {
            request: function (config) {
                if (shouldApplyNoCache(config)) {
                    applyNoCache(config);
                }
                return config;
            }
        };

        return interceptor;
    }])
    .config(['$httpProvider', function ($httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
        $httpProvider.interceptors.push('loadingScreenHttpInterceptor');
        $httpProvider.interceptors.push("noCacheInterceptor");
    }])
    .factory('SignUpResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/public/sign-up/:id', {}, {});
        }])
    .controller("SignUpController", ['$scope', 'SignUpResource', 'FileUploader', '$location', '$routeParams', '$rootScope', 'toaster',
        function ($scope, resource, FileUploader, $location, $routeParams, $rootScope, toaster) {
            var count = 0;
            var queryStr = "";
            angular.forEach($location.search(), function (value, key) {
                if (key && value) {
                    if (!count) {
                        queryStr = "?";
                    }
                    count++;
                    queryStr += key + "=" + value;
                }
            });
            $rootScope.queryStr = queryStr;

            $scope.view = resource.get(function () {
                $scope.clientDocumentTypes = $scope.view.clientDocumentTypes;

                $scope.entity = new resource();
                $scope.entity.client = {
                    contact: {}
                };
                $scope.entity.clientDocuments = [];
                $scope.entity.client.clientType = $scope.view.clientTypes[0].label;
            });

            $scope.save = function () {
                if (!$scope.entity.clientDocuments.length) {
                    popMessage(toaster, 'warning', "Attachment is required.");
                    return;
                }

                var params = {};
                angular.forEach($location.search(), function (value, key) {
                    if (key && value) {
                        params[key] = value;
                    }
                });

                $scope.entity.$save(params, function () {
                    window.scrollTo(0, 0);
                    $scope.message = "Thank you! Your application has been submitted and will be processed soon.";
                });
            };

            $scope.cancel = function () {
                $location.url('/');
            };

            $scope.remove = function (entity, entities) {
                removeFromList(entity, entities);
            };

            $scope.fileUploader = createFileUploader(FileUploader, toaster, function (response) {
                $scope.entity.clientDocuments.push({
                    clientDocumentType: $scope.view.clientDocumentType,
                    fileRecord: {
                        id: response.id,
                        filename: response.filename
                    }
                });
                $scope.view.clientDocumentType = null;
            });
        }])
    .controller("LoginController", ['$scope', '$cookieStore', '$http', '$timeout', '$translate', '$rootScope', '$location', 'toaster',
        function ($scope, $cookieStore, $http, $timeout, $translate, $rootScope, $location, toaster) {
            $http({
                method: 'GET',
                url: REST_PREFIX + "/public/status",
                params: {
                    date: new Date().getTime()
                }
            }).then(function (response) {
                console.log(response.status);
                if (response.status >= 200 && response.status <300) {
                    var authentication = response.headers('Authentication');
                    if (authentication && authentication === "true") {
                        location.assign("/main.html");
                    }
                }
            });

            $scope.errors = [];
            $scope.collapsed = false;
            $scope.failed = false;
            $scope.form = {};
            $scope.resetPasswordForm = {};
            $scope.languages = languages;
            $scope.forgotPassword = false;

            var count = 0;
            var queryStr = "";
            angular.forEach($location.search(), function (value, key) {
                if (key && value) {
                    if (!count) {
                        queryStr = "?";
                    }
                    count++;
                    queryStr += key + "=" + value;
                }
            });
            $rootScope.queryStr = queryStr;

            $scope.collapse = function () {
                $scope.collapsed = false;
            };

            $scope.setLanguage = function (lang) {
                $scope.collapse();
                setLanguage($translate, $cookieStore, lang.lang);
            };

            var doLogin = function () {
                $cookieStore.remove("JSESSIONID");
                $cookieStore.remove("SSORECORDID");

                $scope.errors = null;
                var username = $scope.form.username;
                var password = $scope.form.password;
                $http({
                    method: 'POST',
                    url: "sign-in",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: "email=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password)
                }).then(function (response) {
                    $cookieStore.put('login-email', username);
                    $scope.failed = false;
                    $timeout(function () {
                        location.assign("main.html");
                    });
                    $scope.loading = false;
                }, function (response) {
                    $scope.form.password = null;
                    if (response.status == 401) {
                        $scope.errors = ["Invalid username/password"];
                        $scope.failed = true;
                    } else if (response.status == 403) {
                        $scope.errors = ["Your attempts have reached the maximum limit. Please try it later."];
                        $scope.failed = true;
                    } else {
                        $scope.errors = ["Failed to login."];
                        $scope.failed = true;
                    }

                    $scope.loading = false;
                });
            };

            var loginUserName = $cookieStore.get('login-email');
            if (loginUserName) {
                $scope.form.username = loginUserName;
            }

            $scope.login = function () {
                if ($scope.loading) {
                    return;
                }

                $scope.loading = true;
                doLogin();
            };

            $scope.resetPassword = function () {
                if ($scope.loading) {
                    return;
                }

                $scope.loading = true;
                $http({
                    method: 'POST',
                    url: REST_PREFIX + "/public/password",
                    data: $scope.resetPasswordForm
                }).then(function (response) {
                    $scope.loading = false;
                    popMessage(toaster, 'success', "Your new password has been sent to your email.");
                    $scope.resetPasswordForm = {};
                    $scope.forgotPasswordForm.$setPristine();
                }, function (response) {
                    $scope.loading = false;
                });
            };
        }]);
