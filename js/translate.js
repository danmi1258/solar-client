'use strict';

var languages = [
    {
        name: 'English',
        lang: 'en-US'
    },
    {
        name: '中文',
        lang: 'zh-CN'
    }
];

angular.module('solar.translate', [
    'ngCookies',
    'pascalprecht.translate'])
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });
        $translateProvider.useSanitizeValueStrategy('escape');
    }])
    .run(['$translate', '$cookieStore', function ($translate, $cookieStore) {
        var lang = $cookieStore.get('lang');
        if (!lang) {
            var lang = navigator.languages
                ? navigator.languages[0]
                : (navigator.language || navigator.userLanguage);
            lang && setLanguage($translate, $cookieStore, lang);
        } else {
            setLanguage($translate, $cookieStore, lang);
        }
    }]);

function setLanguage($translate, $cookieStore, language) {
    if (language && (language.indexOf('zh') !== -1 || language.indexOf('CN') !== -1)) {
        $translate.use(language);
        $cookieStore.put('lang', language);
    } else {
        language = 'en-US';
        $translate.use(language);
        $cookieStore.put('lang', language);
    }
}