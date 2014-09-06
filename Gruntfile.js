module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        connect: {
            server: {
                options: {
                    livereload: true,
                    open: {
                        target: 'http://127.0.0.1:8000/dist/index.html'
                    }
                }
            }
        },

        copy: {
            dev: {
                files: [{
                    expand: true,
                    cwd: 'src/views',
                    src: '**/*.html',
                    dest: 'dist/'
                }, {
                    expand: true,
                    cwd: 'bower_components/font-awesome/fonts',
                    src: '**/*',
                    dest: 'dist/fonts/'
                }, {
                    expand: true,
                    cwd: 'src/sass',
                    src: '*.css',
                    dest: 'dist/css'
                }, {
                    expand: true,
                    cwd: 'bower_components/foundation/css',
                    src: 'foundation.css',
                    dest: 'dist/css'
                }]
            }
        },

        imagemin: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/img',
                    src: ['**/*.{png,jpg}'],
                    dest: 'dist/img'
                }]
            }
        },

        jshint: {
            dev: {
                files: {
                    src: ['src/js/**/*.js']
                }
            }
        },

        sass: {
            dev: {
                files: {
                    'dist/css/main.css': 'src/sass/main-page.scss'
                }
            }
        },

        uglify: {
            dev: {
                options: {
                    compress: false,
                    mangle: false,
                    beautify: true
                },
                files: {
                    'dist/js/base.min.js': [
                        'bower_components/modernizr/modernizr.js',
                        'bower_components/jquery/dist/jquery.min.js',
                        'bower_components/jquery-ui/jquery-ui.min.js',
                        'bower_components/foundation/js/foundation.min.js',
                        'bower_components/lodash/dist/lodash.min.js',
                        'bower_components/angular/angular.min.js',
                        'bower_components/angular-cookies/angular-cookies.min.js',
                        'bower_components/angular-foundation/mm-foundation.min.js',
                        'bower_components/angular-foundation/mm-foundation-tpls.min.js',
                        'src/ext/**/*.js',
                        'src/js/**/*.js'
                    ]
                }
            }
        },

        watch: {
            dev: {
                files: ['src/js/**/*.js', 'src/sass/**/*.scss', 'src/views/**/*.html'],
                tasks: ['build'],
                options: {
                    livereload: true
                }
            }
        }
    });

    grunt.log.warn = grunt.warn;

    grunt.registerTask('build', ['jshint:dev', 'newer:uglify:dev', 'newer:sass:dev', 'newer:imagemin:build', 'newer:copy:dev']);
    grunt.registerTask('dev', ['build', 'connect:server', 'watch:dev']);
    grunt.registerTask('default', ['dev']);

};