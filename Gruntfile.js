module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: ['*.js', 'src/*.js', 'test/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        connect: {
            test: {
                options: {
                    port: 8123,
                    base: '.'
                }
            },
            dev: {
                options: {
                    port: 8124,
                    base: '.',
                    keepalive: true
                }
            }
        },

        mochaTest: {
            all: {
                options: {
                    reporter: 'dot'
                },
                src: ['test/unit.js']
            }
        },

        mocha_phantomjs: {
            all: {
                options: {
                    reporter: 'dot'
                },
                src: ['test/unit.html']
            }
        },

        execute: {
            target: {
                src: ['test/example.js']
            }
        }
    });

    // Load the plugin(s)
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-execute');

    // Tasks
    grunt.registerTask('dev', ['connect:dev']);
    grunt.registerTask('example', ['jshint', 'execute']);
    grunt.registerTask('default', ['jshint', 'connect:test', 'mochaTest:all', 'mocha_phantomjs']);
};