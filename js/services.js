'use strict';

/* Services */
angular.module('solar.services', ['ngResource'])
    .value('version', '0.1')
    .factory("HttpStatusManager", ['$rootScope', function ($rootScope) {
        var HttpStatusManager = {
            activeCount: 0,
            error: false,   //System error
            errors: null,
            messages: null,
            lastRequest: null
        };

        HttpStatusManager.updateSession = function () {
            HttpStatusManager.lastRequest = new Date();
        };

        HttpStatusManager.httpRequestStarted = function () {
            $rootScope.loading = true;
            HttpStatusManager.activeCount++;
        };

        HttpStatusManager.requestDone = function () {
            if (HttpStatusManager.activeCount > 0) {
                HttpStatusManager.activeCount--;
            }

            if (HttpStatusManager.activeCount == 0) {
                $rootScope.loading = false;
            }
        };

        HttpStatusManager.requestError = function () {
            HttpStatusManager.activeCount = 0;
            HttpStatusManager.error = true;
            HttpStatusManager.errors = null;
            $rootScope.loading = false;
        };

        $rootScope.HttpStatusManager = HttpStatusManager;
        return HttpStatusManager;
    }])
    .factory('loadingScreenHttpInterceptor', ['$q', 'HttpStatusManager', 'toaster', function ($q, HttpStatusManager, toaster) {
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

            if (rejection.status == 404) {
                HttpStatusManager.errors = ["Page Not Found."];
                popMessages(HttpStatusManager.errors);
            } else if (rejection.status <= 0) {
                HttpStatusManager.errors = ["Server is not available at the moment. Please try it later."];
                popMessages(HttpStatusManager.errors);
            } else if (rejection.status >= 500) {
                popMessages(['Failed to proceed your request.']);
            }
        };

        var handleAuthentication = function (response) {
            var authentication = response.headers('Authentication');
            if (authentication === "false") {
                location.reload(true);
            } else if (response.status == 403 && authentication !== "true") {
                location.reload(true);
            }

            if (authentication === "true") {
                var token = response.headers('Token');
                if (!HttpStatusManager.token) {
                    HttpStatusManager.token = token;
                } else if (HttpStatusManager.token != token) {
                    location.reload(true);
                }
            }
        };

        var updateBadges = function (response) {
            var messages = response.headers('messages');
            var followUps = response.headers('followUps');
            var jobs = response.headers('jobs');
            var tasks = response.headers('tasks');

            var elements;
            if (followUps != null) {
                elements = document.getElementsByName("follow-up-badge");
                if (elements) {
                    angular.forEach(elements, function (e) {
                        e.innerText = followUps;
                    });
                }
            }

            if (jobs != null) {
                elements = document.getElementsByName("job-badge");
                if (elements) {
                    angular.forEach(elements, function (e) {
                        e.innerText = jobs;
                    });
                }
            }

            if (tasks != null) {
                elements = document.getElementsByName("task-badge");
                if (elements) {
                    angular.forEach(elements, function (e) {
                        e.innerText = tasks;
                    });
                }
            }

            if (messages != null) {
                elements = document.getElementsByName("message-badge");
                if (elements) {
                    angular.forEach(elements, function (e) {
                        e.innerText = messages;
                    });
                }
            }
        };

        return {
            request: function (config) {
                if (config.headers['Async-Request'] != null) {
                    return config || $q.when(config);
                }
                if (config.url && config.url.indexOf("uib") != 0) {
                    HttpStatusManager.error = false;
                    HttpStatusManager.errors = null;
                    HttpStatusManager.messages = null;
                }
                HttpStatusManager.httpRequestStarted();
                return config || $q.when(config);
            },

            response: function (response) {
                handleAuthentication(response);
                HttpStatusManager.updateSession();
                updateBadges(response);

                if (response.config.headers['Async-Request'] != null) {
                    return response || $q.when(response);
                }
                HttpStatusManager.requestDone();
                return response || $q.when(response);
            },

            responseError: function (rejection) {
                handleAuthentication(rejection);
                HttpStatusManager.updateSession();
                HttpStatusManager.activeCount = 0;
                HttpStatusManager.requestDone();
                handleError(rejection);
                return $q.reject(rejection);
            }
        };
    }])
    .config(['$httpProvider', function ($httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

        $httpProvider.interceptors.push('loadingScreenHttpInterceptor');
    }]);
