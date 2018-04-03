'use strict';

angular.module("solar.user", [])
    .factory('ClientResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/client/:id', {}, {});
        }])
    .factory('ClientSummaryResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/client/:id/summary', {}, {});
        }])
    .factory('TaskResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/user/task/:id', {}, {});
        }])
    .factory('JobFileResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/user/job/file/:id', {}, {});
        }])
    .factory('ClientSearchResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/search', {}, {});
        }])
    .factory('TeamResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/user/team/:id', {}, {});
        }])
    .factory('WorkQueryResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/user/work-query', {}, {
                search: {isArray: false, method: 'POST', headers: {'Async-Request': true}}
            });
        }])
    .factory('WorkResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/user/work/:id', {}, {});
        }])
    .factory('JobResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/user/job/:id', {}, {});
        }])
    .factory('FollowUpResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/user/follow-up/:id', {}, {});
        }])
    .factory('ClientMt4LoginResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/client-mt4/:id', {}, {});
        }])
    .factory('ClientFundWithdrawalResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/fund/admin/fund-withdrawal/:id', {}, {
                confirm: {isArray: false, method: 'POST'}
            });
        }])
    .factory('ClientLeverageUpdateProfileResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/account/admin/leverage-update/:id', {}, {
                confirm: {isArray: false, method: 'POST'}
            });
        }])
    .factory('ClientMt4GroupSwitchResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/account/admin/mt4-group-switch/:action/:id', {}, {
                confirm: {params: {action: 'confirm'}, isArray: false, method: 'POST'},
                process: {params: {action: 'process'}, isArray: false, method: 'POST'}
            });
        }])
    .factory('ClientFundTransferAdminResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/fund/admin/fund-transfer/:id', {}, {
                process: {isArray: false, method: 'POST'}
            });
        }])
    .factory('ClientMt4ClientSwitchResource', ['$resource',
        function ($resource) {
            return $resource(REST_PREFIX + '/client/account/admin/mt4-client-switch/:action/:id', {}, {
                confirm: {params: {action: 'confirm'}, isArray: false, method: 'POST'},
                process: {params: {action: 'process'}, isArray: false, method: 'POST'}
            });
        }])
    .controller("ClientMt4ClientSwitchController", ['$scope', 'ClientMt4ClientSwitchResource', 'toaster', '$http', function ($scope, resource, toaster, $http) {
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

        $scope.doConfirm = function () {
            var profile = resource.confirm({
                "id": $scope.$parent.view.mt4ClientSwitchProfile.id
            }, $scope.$parent.view.mt4ClientSwitchProfile, function () {
                $scope.$parent.view.mt4ClientSwitchProfile = profile;
            });
        };

        $scope.doProcess = function () {
            var profile = resource.process({
                "id": $scope.$parent.view.mt4ClientSwitchProfile.id
            }, null, function () {
                popMessage(toaster, 'success', 'Your request has been processed.');
                $scope.$parent.view.mt4ClientSwitchProfile = profile;
            });
        };
    }])
    .controller("ClientFundTransferAdminController", ['$scope', 'ClientFundTransferAdminResource', 'toaster', function ($scope, resource, toaster) {
        $scope.client = resource.get({
            "id": $scope.$parent.view.fundTransferProfile.id
        });

        $scope.doProcess = function () {
            var profile = resource.process({
                "id": $scope.$parent.view.fundTransferProfile.id
            }, null, function () {
                popMessage(toaster, 'success', 'Your request has been submitted.');
                $scope.$parent.view.fundTransferProfile = profile;
            });
        };
    }])
    .controller('ClientSummaryController', ['$scope', 'ClientSummaryResource', '$routeParams', function ($scope, resource, $routeParams) {
        $scope.entity = resource.get({
            id: $routeParams.id
        });
    }])
    .controller("ClientLeverageUpdateProfileController", ['$scope', 'ClientLeverageUpdateProfileResource', 'toaster', function ($scope, resource, toaster) {
        $scope.save = function () {
            resource.confirm({
                "id": $scope.$parent.view.leverageUpdateProfile.id
            }, null, function () {
                popMessage(toaster, 'success', 'Your request has been submitted.');
            });
        };
    }])
    .controller("ClientMt4GroupSwitchController", ['$scope', 'ClientMt4GroupSwitchResource', 'toaster', function ($scope, resource, toaster) {
        $scope.doConfirm = function () {
            var profile = resource.confirm({
                "id": $scope.$parent.view.mt4GroupSwitchProfile.id
            }, $scope.$parent.view.mt4GroupSwitchProfile, function () {
                $scope.$parent.view.mt4GroupSwitchProfile = profile;
            });
        };

        $scope.doProcess = function () {
            var profile = resource.process({
                "id": $scope.$parent.view.mt4GroupSwitchProfile.id
            }, null, function () {
                popMessage(toaster, 'success', 'Your request has been submitted.');
                $scope.$parent.view.mt4GroupSwitchProfile = profile;
            });
        };
    }])
    .controller("ClientFundWithdrawalController", ['$scope', 'ClientFundWithdrawalResource', 'toaster', function ($scope, resource, toaster) {
        $scope.bankAccount = resource.get({
            "id": "bank-account",
            "bank-account-id": $scope.$parent.view.withdrawProfile.bankAccount.id
        });

        $scope.save = function () {
            var profile = resource.confirm({
                "id": $scope.$parent.view.withdrawProfile.id
            }, null, function () {
                popMessage(toaster, 'success', 'Your request has been submitted.');
                $scope.$parent.view.withdrawProfile = profile;
            });
        };
    }])
    .controller("ClientMt4LoginController", ['$scope', 'ClientMt4LoginResource', '$location', '$routeParams',
        function ($scope, resource, $location, $routeParams) {
            $scope.entities = resource.query({
                "id": $routeParams.id
            });
        }])
    .controller("FollowUpController", ['$scope', '$location', 'FollowUpResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        var load = function () {
            $scope.entity = resource.get({
                'id': $routeParams.id
            });
        };

        load();

        $scope.download = function (entity, file) {
            location.assign(REST_PREFIX + "/client/user/follow-up/download/" + entity.id + "/" + file.id);
        };

        $scope.completeFollowUp = function () {
            resource.get({
                'id': 'complete',
                'follow-up-id': $routeParams.id
            }, function () {
                load();
            });
        };

        $scope.cancelFollowUp = function () {
            resource.get({
                'id': 'cancel',
                'follow-up-id': $routeParams.id
            }, function () {
                load();
            });
        };
    }])
    .controller("JobHomeController", ['$scope', '$location', 'JobResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        $scope.initializedTabs = {0: true};
        $scope.asyncLoad = true;
        $scope.activateTab = function (index) {
            $scope.initializedTabs[index] = true;
        };

        $scope.back = function () {
            $scope.cancel();
        };

        $scope.load = function () {
            $scope.view = resource.get({
                'id': $routeParams.id ? $routeParams.id : 'new',
                'team-id': $routeParams.team_id,
                'client-id': $routeParams.client_id
            }, function () {
                if ($scope.view.job && $scope.view.job.id) {
                    $scope.jobId = parseInt($scope.view.job.id);
                }

                $scope.view.teams = [];
                if ($scope.view.job.dueDate) {
                    $scope.view.job.dueDate = JSONToDate($scope.view.job.dueDate);
                }
                if ($scope.view.job.cancelled) {
                    $scope.view.job.cancelled = JSONToDate($scope.view.job.cancelled);
                }
                if ($scope.view.job.completed) {
                    $scope.view.job.completed = JSONToDate($scope.view.job.completed);
                }
                if ($routeParams.team_id) {
                    $scope.view.team = $scope.view.job.jobLink.team;
                    $scope.view.team.jobs = $scope.view.teamJobs;
                    $scope.view.teams.push($scope.view.team);

                    if ($scope.view.team.jobs && $scope.view.team.jobs.length == 1) {
                        $scope.view.job.jobDefinitionVersion = $scope.view.team.jobs[0];
                    }
                } else if ($routeParams.client_id) {
                    $scope.view.client = $scope.view.job.jobLink.client;
                    angular.forEach($scope.view.clientJobs, function (clientJob) {
                        var team = clientJob.team;
                        team.jobs = clientJob.jobDefinitionVersions;
                        $scope.view.teams.push(team);
                    });

                    if ($scope.view.teams && $scope.view.teams.length == 1) {
                        $scope.view.team = $scope.view.teams[0];

                        if ($scope.view.team.jobs && $scope.view.team.jobs.length == 1) {
                            $scope.view.job.jobDefinitionVersion = $scope.view.team.jobs[0];
                        }
                    }
                } else if ($routeParams.id && $scope.view.job.jobLink.team) {
                    $scope.view.team = $scope.view.job.jobLink.team;
                    $scope.view.job.jobDefinitionVersion = $scope.view.job.jobDefinitionVersion;
                    $scope.view.teams.push($scope.view.team);
                    $scope.view.team.jobs = [$scope.view.job.jobDefintionVersion];
                } else if ($routeParams.id && $scope.view.job.jobLink.client) {
                    $scope.view.client = $scope.view.job.jobLink.client;
                    $scope.view.job.jobDefinitionVersion = $scope.view.job.jobDefinitionVersion;
                    $scope.view.teams.push($scope.view.job.jobDefinitionVersion.jobDefinition.team);
                    $scope.view.team = $scope.view.teams[0];
                    $scope.view.team.jobs = [$scope.view.job.jobDefinitionVersion];
                }
            });
        };

        $scope.load();

        $scope.addWorkNote = function (job) {
            $location.url('/user/job/' + job.id + '/work/new');
        };

        $scope.completeJob = function (job) {
            resource.get({
                'id': 'complete',
                'job-id': job.id
            }, function () {
                $scope.load();
            });
        };

        $scope.cancelJob = function (job) {
            resource.get({
                'id': 'cancel',
                'job-id': job.id
            }, function () {
                $scope.load();
            });
        };

        $scope.reopenJob = function (job) {
            resource.get({
                'id': 'reopen',
                'job-id': job.id
            }, function () {
                $scope.load();
            });
        };

        $scope.cancel = function () {
            if ($scope.view.job.id) {
                if ($scope.view.job.jobLink.team) {
                    $location.url('/user/team/' + $scope.view.job.jobLink.team.id + '/home');
                } else if ($scope.view.job.jobLink.client) {
                    $location.url('/user/client/' + $scope.view.job.jobLink.client.id);
                }
            } else if ($routeParams.team_id) {
                $location.url('/user/team/' + $routeParams.team_id + '/home');
            } else if ($routeParams.client_id) {
                $location.url('/user/client/' + $routeParams.client_id);
            }
        };
    }])
    .controller("JobSummaryController", ['$scope', '$location', 'JobResource', 'toaster', function ($scope, $location, resource, toaster) {
        $scope.save = function () {
            if ($scope.editForm.$invalid) {
                return;
            }

            var job = $scope.$parent.view.job;
            var entity = {
                id: job.id,
                dueDate: job.dueDate,
                instructions: job.instructions
            };
            if (entity.id) {
                resource.save({id: entity.id}, entity, function () {
                    $scope.$parent.load();
                    popMessage(toaster, 'success', 'Job has been updated.');
                });
            } else {
                var ret = resource.save(null, job, function () {
                    popMessage(toaster, 'success', 'Job has been created.');
                    $location.url('/user/job/' + ret.id);
                });
            }
        };

        $scope.$watch('view.job.jobDefinitionVersion', function (val) {
            if (!val) {
                return;
            }

            if (!$scope.view.job.id) {
                $scope.view.job.name = $scope.view.job.jobDefinitionVersion.jobDefinition.name;
            }
        });
    }])
    .controller("JobFilesController", ['$scope', '$location', 'JobFileResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        var view = resource.get({
            "id": $routeParams.id
        }, function () {
            $scope.workList = view.workList;
        });

        $scope.download = function (work, file) {
            location.assign(REST_PREFIX + "/client/user/job/file/download/" + work.id + "/" + file.id);
        };

        $scope.getFormattedMinutes = function (minutes) {
            return formatMinutes(minutes);
        };
    }])
    .controller("JobTasksController", ['$scope', '$location', 'TaskResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        var jobId = $routeParams.id;

        var load = function () {
            var view = resource.get({
                'job-id': jobId
            }, function () {
                $scope.taskEditView = false;
                $scope.tasks = view.tasks;
                $scope.users = view.users;

                angular.forEach($scope.users, function (user) {
                    angular.forEach($scope.tasks, function (task) {
                        if (task.assignee && task.assignee.id == user.id) {
                            task.assignee = user;
                        }
                    });
                });

                angular.forEach($scope.tasks, function (task) {
                    if (task.dueDate) {
                        task.dueDate = JSONToDate(task.dueDate);
                    }
                    if (task.cancelled) {
                        task.cancelled = JSONToDate(task.cancelled);
                    }
                    if (task.completed) {
                        task.completed = JSONToDate(task.completed);
                    }
                });
            });
        };

        load();

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

        $scope.remove = function (entity, entities) {
            removeFromList(entity, entities);
        };

        $scope.completeTask = function (task) {
            resource.get({
                'id': 'complete',
                'task-id': task.id
            }, function () {
                load();
            });
        };

        $scope.cancelTask = function (task) {
            resource.get({
                'id': 'cancel',
                'task-id': task.id
            }, function () {
                load();
            });
        };

        $scope.save = function () {
            var tasks = $scope.tasks;
            angular.forEach(tasks, function (task, index) {
                task.priority = index;
            });

            resource.save({'job-id': jobId}, tasks, function () {
                load();
            });
        };
    }])
    .controller("ClientJobsController", ['$scope', '$location', 'JobResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        var clientId = $routeParams.id;
        $scope.view = {
            includeArchived: false
        };

        var date = new Date();
        $scope.archivedJobParams = {
            startDate: new Date(date.getFullYear(), date.getMonth(), 1),
            endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate())
        };

        $scope.view.activeJobs = resource.query({
            'client-id': clientId
        }, function () {
            angular.forEach($scope.view.activeJobs, function (job) {
                var tasks = job.tasks;
                if (tasks && tasks.length) {
                    var completedTasks = 0;
                    angular.forEach(tasks, function (task) {
                        if (task.cancelled || task.completed) {
                            completedTasks++;
                        }
                    });

                    job.completedTasks = completedTasks;
                }
            });
        });

        $scope.searchArchivedJobs = function () {
            $scope.view.archivedJobs = resource.query({
                'client-id': clientId,
                'archived': true,
                'start-date': $scope.archivedJobParams.startDate ? $scope.archivedJobParams.startDate : null,
                'end-date': $scope.archivedJobParams.endDate ? $scope.archivedJobParams.endDate : null
            });
        };

        $scope.$watch('view.includeArchived', function (newVal) {
            if (newVal && !$scope.view.archivedJobs) {
                $scope.searchArchivedJobs();
            }
        });
    }])
    .controller("TeamJobsController", ['$scope', '$location', 'JobResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        var teamId = $routeParams.id;
        $scope.view = {
            includeArchived: false
        };

        $scope.view.activeJobs = resource.query({
            'team-id': teamId
        }, function () {
            angular.forEach($scope.view.activeJobs, function (job) {
                var tasks = job.tasks;
                if (tasks && tasks.length) {
                    var completedTasks = 0;
                    angular.forEach(tasks, function (task) {
                        if (task.cancelled || task.completed) {
                            completedTasks++;
                        }
                    });

                    job.completedTasks = completedTasks;
                }
            });
        });

        $scope.$watch('view.includeArchived', function (newVal) {
            if (newVal && !$scope.view.archivedJobs) {
                $scope.view.archivedJobs = resource.query({
                    'team-id': teamId,
                    'archived': true
                });
            }
        });
    }])
    .controller("WorkNotesController", ['$scope', '$location', 'WorkQueryResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        $scope.search = {};
        if ($scope.jobId) {
            $scope.search.job = {
                id: $scope.jobId
            };
        } else if ($scope.teamId) {
            $scope.search.team = {
                id: $scope.teamId
            };
        } else if ($scope.clientId) {
            $scope.search.client = {
                id: $scope.clientId
            };
        }

        var today = new Date();
        $scope.search.endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        $scope.search.startDate = new Date(today.getFullYear(), today.getMonth(), 1);

        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 20,
            currentPage: 1,
            maxSize: 10
        };

        $scope.load = function (currentPage) {
            if (currentPage) {
                $scope.pageParams.currentPage = currentPage;
            }

            $scope.loading = true;
            var searchResult = resource.search($scope.search, function () {
                $scope.searchResult = {};
                angular.copy(searchResult, $scope.searchResult);
                $scope.searchResult.columns = 6;
                $scope.pageParams.totalItems = $scope.searchResult.totalItems;
                $scope.loading = false;
                angular.forEach($scope.searchResult.users, function (user) {
                    if ($scope.search.user && $scope.search.user.id == user.id) {
                        $scope.search.user = user;
                    }
                });
                angular.forEach($scope.searchResult.workTypes, function (workType) {
                    if ($scope.search.workType && $scope.search.workType.id == workType.id) {
                        $scope.search.workType = workType;
                    }
                });
                $scope.searchResult.includeEdit = true;

                if ($scope.searchResult.includeEntityName) {
                    $scope.searchResult.columns++;
                }
                if ($scope.searchResult.includeJobName) {
                    $scope.searchResult.columns++;
                }
                if ($scope.searchResult.includeTaskName) {
                    $scope.searchResult.columns++;
                }
                if ($scope.searchResult.includeEdit) {
                    $scope.searchResult.columns++;
                }
            });
        };

        $scope.load();

        $scope.edit = function (work) {
            $location.url('/user/work/' + work.id);
        };

        $scope.download = function (work, file) {
            location.assign(REST_PREFIX + "/client/user/work-query/download/" + work.id + "/" + file.id);
        };

        $scope.getFormattedMinutes = function (minutes) {
            return formatMinutes(minutes);
        };
    }])
    .controller("WorkNoteController", ['$scope', '$location', 'WorkResource', '$routeParams', 'FileUploader', 'toaster', function ($scope, $location, resource, $routeParams, FileUploader, toaster) {
        $scope.load = function () {
            $scope.view = resource.get({
                'id': $routeParams.id ? $routeParams.id : 'new',
                'team-id': $routeParams.team_id,
                'client-id': $routeParams.client_id,
                'job-id': $routeParams.job_id
            }, function () {
                $scope.view.work.sendSms = false;
                $scope.view.work.sendEmail = false;

                $scope.view.jobRequired = $routeParams.job_id;
                if ($routeParams.id && $routeParams.id != 'new') {
                    $scope.removable = true;
                    $scope.view.work.date = JSONToDate($scope.view.work.date);
                } else {
                    $scope.view.work.date = new Date();
                }

                var selectedJob = null;
                angular.forEach($scope.view.jobs, function (job) {
                    if ($scope.view.work.workLink.job && $scope.view.work.workLink.job.id == job.id) {
                        $scope.view.work.workLink.job = job;
                        selectedJob = job;
                    }
                });

                if (selectedJob) {
                    angular.forEach(selectedJob.tasks, function (task) {
                        if ($scope.view.work.workLink.task && $scope.view.work.workLink.task.id == task.id) {
                            $scope.view.work.workLink.task = task;
                        }
                    });
                }

                angular.forEach($scope.view.workTypes, function (workType) {
                    if ($scope.view.work.workType && $scope.view.work.workType.id == workType.id) {
                        $scope.view.work.workType = workType;
                    }
                });

                if (!$scope.view.work.workType && $scope.view.workTypes) {
                    $scope.view.work.workType = $scope.view.workTypes[0];
                }

                if ($scope.view.work.followUps && $scope.view.work.followUps.length) {
                    angular.forEach($scope.view.work.followUps, function (followUp) {
                        if (followUp.dueDate) {
                            followUp.dueDate = JSONToDate(followUp.dueDate);
                        }
                    });

                    angular.forEach($scope.view.users, function (user) {
                        angular.forEach($scope.view.work.followUps, function (followUp) {
                            if (followUp.assignee.id == user.id) {
                                followUp.assignee = user;
                            }
                        });
                    });
                }
            });
        };

        $scope.load();

        $scope.addUser = function (user) {
            var added = false;
            angular.forEach($scope.view.work.followUps, function (followUp) {
                if (followUp.assignee.id == user.id) {
                    added = true;
                }
            });

            if (!added) {
                $scope.view.work.followUps.push({
                    assignee: user
                });
            }
        };

        $scope.save = function () {
            var work = $scope.view.work;
            if (work.id) {
                resource.save({'id': work.id}, work, function () {
                    $scope.cancel();
                });
            } else {
                resource.save(null, work, function () {
                    $scope.cancel();
                });
            }
        };

        $scope['delete'] = function () {
            resource.delete({id: $scope.entity.id}, function () {
                $scope.cancel();
            });
        };

        $scope.remove = function (entity, entities) {
            removeFromList(entity, entities);
        };

        $scope.uploader = createFileUploader(FileUploader, toaster, function (response) {
            if (!$scope.view.work.fileRecords) {
                $scope.view.work.fileRecords = [];
            }

            $scope.view.work.fileRecords.push({
                id: response.id,
                filename: response.filename
            });
        });

        $scope.cancel = function () {
            if ($scope.view.work.id) {
                if ($scope.view.work.workLink.job) {
                    $location.url('/user/job/' + $scope.view.work.workLink.job.id);
                } else if ($scope.view.work.workLink.team) {
                    $location.url('/user/team/' + $scope.view.work.workLink.team.id + '/home');
                } else if ($scope.view.work.workLink.client) {
                    $location.url('/user/client/' + $scope.view.work.workLink.client.id + '/home');
                }
            } else if ($routeParams.job_id) {
                $location.url('/user/job/' + $routeParams.job_id);
            } else if ($routeParams.team_id) {
                $location.url('/user/team/' + $routeParams.team_id + '/home');
            } else if ($routeParams.client_id) {
                $location.url('/user/client/' + $routeParams.client_id + '/home');
            }
        };
    }])
    .controller("TeamHomeController", ['$scope', '$location', 'TeamResource', '$routeParams', function ($scope, $location, resource, $routeParams) {
        $scope.teamId = parseInt($routeParams.id);
        $scope.entity = resource.get({
            "id": "view",
            "team-id": $routeParams.id
        });

        $scope.back = function () {
            $location.url('/user/team');
        };

        $scope.initializedTabs = {0: true};
        $scope.activateTab = function (index) {
            $scope.initializedTabs[index] = true;
        };

        $scope.getTemplate = function (template) {
            var ret = template.replace(":team_id", $scope.teamId);
            return ret;
        };
    }])
    .controller("TeamsController", ['$scope', '$location', 'TeamResource', function ($scope, $location, resource) {
        $scope.view = resource.get();

        $scope.create = function () {
            $location.url($location.url() + "/new");
        };

        $scope.viewSummary = function (entity) {
            $location.url($location.url() + "/" + entity.id + "/home");
        };

        $scope.edit = function (entity) {
            $location.url($location.url() + "/" + entity.id);
        };
    }])
    .controller("ClientSearchController", ['$scope', '$location', 'ClientSearchResource', function ($scope, $location, resource) {
        $scope.pageParams = {
            totalItems: 0,
            itemsPerPage: 20,
            currentPage: 1,
            maxSize: 10
        };

        $scope.search = function () {
            $scope.entities = resource.query({
                "searchTerm": $scope.searchTerm
            }, function () {
                $scope.pageParams.totalItems = $scope.entities.length;
            });
        };

        $scope.view = function (entity) {
            $location.url('/user/client/' + entity.id + '/home');
        };
    }])
    .controller('ClientHomeController', ['$scope', 'ClientResource', '$routeParams', function ($scope, resource, $routeParams) {
        window.scrollTo(0, 0);

        $scope.clientId = parseInt($routeParams.id);

        $scope.client = resource.get({
            id: $routeParams.id
        });

        $scope.initializedTabs = {0: true};
        $scope.activateTab = function (index) {
            $scope.initializedTabs[index] = true;
        };

        $scope.getTemplate = function (template) {
            var ret = template.replace(":client_id", $scope.clientId);
            return ret;
        };
    }])
    .controller("HomeScreenFollowUpsController", ['$scope', '$location', 'HomeScreenResource', '$timeout', function ($scope, $location, resource, $timeout) {
        var retry = 0;

        var load = function () {
            if (retry > 10) {
                return;
            }

            retry++;
            if (!$scope.$parent.homeScreenUser && !$scope.$parent.mainFollowUpScreen) {
                $timeout(load, 500);
                return;
            }

            var view = resource.followUps({
                "user": $scope.$parent && $scope.$parent.homeScreenUser ? $scope.$parent.homeScreenUser.id : null
            }, function () {
                $scope.followUpsAssignedByUser = view.followUpsByUser;
                $scope.followUpsAssignedToUser = view.followUpsToUser;
            });
        };

        load();

        $scope.view = function (followUp) {
            $location.url('/user/follow-up/' + followUp.id);
        };
    }])
    .controller("HomeScreenTasksController", ['$scope', '$location', 'HomeScreenResource', function ($scope, $location, resource) {
        var load = function () {
            $scope.tasks = resource.tasks({
                "user": $scope.$parent && $scope.$parent.homeScreenUser ? $scope.$parent.homeScreenUser.id : null
            });
        };

        load();
    }])
    .controller("HomeScreenJobsController", ['$scope', '$location', 'HomeScreenResource', function ($scope, $location, resource) {
        var view = resource.jobs({
            "user": $scope.$parent && $scope.$parent.homeScreenUser ? $scope.$parent.homeScreenUser.id : null
        }, function () {
            $scope.clientJobsAssignedByUser = view.clientJobsAssignedByUser;
            $scope.clientJobsAssignedToUser = view.clientJobsAssignedToUser;
            $scope.teamJobsAssignedByUser = view.teamJobsAssignedByUser;
            $scope.teamJobsAssignedToUser = view.teamJobsAssignedToUser;

            computeTasks($scope.clientJobsAssignedByUser);
            computeTasks($scope.clientJobsAssignedToUser);
            computeTasks($scope.teamJobsAssignedByUser);
            computeTasks($scope.teamJobsAssignedToUser);
        });

        var computeTasks = function (jobs) {
            angular.forEach(jobs, function (job) {
                var tasks = job.tasks;
                if (tasks && tasks.length) {
                    var completedTasks = 0;
                    angular.forEach(tasks, function (task) {
                        if (task.cancelled || task.completed) {
                            completedTasks++;
                        }
                    });

                    job.completedTasks = completedTasks;
                }
            });
        };
    }]);