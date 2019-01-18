'use strict';

//basic configuration object used by gulp tasks
module.exports = {
    port: 4000,
    uiPort: 4001,
    ghostMode: false,
    tmp: 'build/tmp',
    dist: 'build/dist',
    base: 'src',
    tpl: 'src/src/**/*.hbs',
    tplNameSpace: 'TPLS',
    mainScss: 'src/css/*.css',
    js: 'src/js/**/*.js',
    index: [
        'src/**/*.html'
    ],

    images: 'src/img/**/*',
    banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''
    ].join('\n')
};
