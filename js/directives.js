'use strict';

/* Directives */
angular.module('solar.directives', [])
    .directive('bindUnsafeHtml', [function () {
        return {
            template: "{{directiveData.message|translate}}"
        };
    }])
    .directive('solarCrudButtons', function () {
        return {
            restrict: 'A',
            scope: true,
            link: function link(scope, iElement, iAttrs) {

            },
            templateUrl: 'directives/crud-buttons.html'
        };
    })
    .directive('float', function () {
        var FLOAT_REGEXP = /^\-?\d+((\.)\d\d?)?$/;
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (!viewValue) {
                        ctrl.$setValidity('float', true);
                        return viewValue;
                    }
                    if (FLOAT_REGEXP.test(viewValue)) {
                        ctrl.$setValidity('float', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('float', false);
                        return undefined;
                    }
                });
            }
        };
    })
    .directive('integer', function () {
        var FLOAT_REGEXP = /^\-?\d+$/;
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (!viewValue) {
                        ctrl.$setValidity('integer', true);
                        return viewValue;
                    }
                    if (FLOAT_REGEXP.test(viewValue)) {
                        ctrl.$setValidity('integer', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('integer', false);
                        return undefined;
                    }
                });
            }
        };
    })
    .directive('onlyDigits', function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return;
                ngModel.$parsers.unshift(function (inputValue) {
                    var digits = inputValue.split('').filter(function (s) {
                        return (!isNaN(s) && s != ' ');
                    }).join('');
                    ngModel.$viewValue = digits;
                    ngModel.$render();
                    return digits;
                });
            }
        };
    });


