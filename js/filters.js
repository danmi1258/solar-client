'use strict';

/* Filters */

angular.module('solar.filters', [])
    .filter('formattedDate', function ($filter) {
        var dateFilter = $filter('date');
        return function (dateStr) {
            if (dateStr == null) {
                return null;
            }

            if (typeof dateStr === 'string' || dateStr instanceof String) {
                var date = JSONToDate(dateStr);
                return date == null ? null : dateFilter(date, 'yyyy-MM-dd');
            }

            return dateFilter(dateStr, 'yyyy-MM-dd');
        }
    })
    .filter('formattedTime', function ($filter) {
        var dateFilter = $filter('date');
        return function (dateStr) {
            if (dateStr == null) {
                return null;
            }

            if (typeof dateStr === 'string' || dateStr instanceof String) {
                var date = JSONToDate(dateStr);
                return date == null ? null : dateFilter(date, 'yyyy-MM-dd HH:mm:ss');
            }

            return dateFilter(dateStr, 'yyyy-MM-dd HH:mm:ss');
        }
    })
    .filter('contains', function () {
        return function (input, text) {
            if (!input) {
                return false;
            }
            if (!text) {
                return true;
            }

            if (Array.isArray(input)) {
                for (var i = 0; i < input.length; ++i) {
                    if (input[i].toLowerCase().indexOf(text.toLowerCase()) != -1) {
                        return true;
                    }
                }
            } else if (input.toLowerCase().indexOf(text.toLowerCase()) != -1) {
                return true;
            }

            return false;
        }
    })
    .filter("emptyToEnd", function () {
        return function (array, key) {
            if (!angular.isArray(array)) return;
            if (!key) {
                return array;
            }
            var parts = key.split(".");
            var present = array.filter(function (item) {
                var val = item;
                for (var i = 0; i < parts.length; ++i) {
                    try {
                        val = val[parts[i]];
                    } catch (ex) {
                        val = null;
                    }

                }
                return val || val == 0;
            });
            var empty = array.filter(function (item) {
                var val = item;
                for (var i = 0; i < parts.length; ++i) {
                    try {
                        val = val[parts[i]];
                    } catch (ex) {
                        val = null;
                    }
                }
                return !val && val != 0;
            });
            return present.concat(empty);
        };
    });