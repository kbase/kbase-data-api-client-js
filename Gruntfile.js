    /*global require, module */
/*jslint white: true */
var path = require('path');
var fs = require('fs');
module.exports = function (grunt) {
    'use strict';

    // The runtime directory holds a build and dist directory and other files
    // required to actually run the build client and server.
    var runtimeDir = 'runtime';

    // The build directory is the destination for the KBase source, messaged
    // external dependencies, and other files needed to run the client and server
    // components. The build directory can be used directly in development mode,
    // since it contains normal, un-minified javascript.
    var buildDir = runtimeDir + '/build';

    var distDir = 'dist';

    var testDir = runtimeDir + '/test';

    // Make a path under the 'buildDir'
    function makeBuildPath(subdir) {
        if (subdir) {
            return path.normalize(buildDir + '/' + subdir);
        }
        return path.normalize(buildDir);
    }

    function makeDistPath(subdir) {
        if (subdir) {
            return path.normalize(distDir + '/' + subdir);
        }
        return path.normalize(distDir);
    }

    function makeRuntimePath(subdir) {
        if (subdir) {
            return path.normalize(runtimeDir + '/' + subdir);
        }
        return path.normalize(runtimeDir);
    }

    // Load grunt npm tasks..
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-markdown');
    // these 2 are for local debugging
    grunt.loadNpmTasks('grunt-connect');
    grunt.loadNpmTasks('grunt-open');

    /*
     *
     * notes on "fixers"
     * - add js lint config to decrease noise of harmless lint violations
     * - wrap in define
     * - set strict mode
     * - determine the name of the "subject" and return it as the module object
     * - modest code repair to assist in reducing lint noise (and of course improve code reliability)
     */
    function fixThriftTypes(content) {
        var namespaceRe = /^if \(typeof ([^\s\+]+)/m,            
            namespace = content.match(namespaceRe)[1],            
            lintDecls = '/*global define */\n/*jslint white:true */',
            requireJsStart = 'define(["thrift"], function (Thrift) {\n"use strict";',
            requireJsEnd = 'return ' + namespace + ';\n});',
            fixDeclRe = /if \(typeof ([^\s]+) === 'undefined'\) {\n[\s]*([^\s]+) = {};\n}/,
            fixRPosRe = /if \(.*? > 0 \) {\n\s*if \(input\.rstack\.length > input\.rpos\[input\.rpos\.length -1\] \+ 1\) {\n\s*input\.rstack\.pop\(\);\s*\}\s*\}/g,
            repairedContent = content
            .replace(fixDeclRe, 'var $1 = {};\n')
            .replace(/([^=!])==([^=])/g, '$1===$2')
            .replace(/!=([^=])/g, '!==$1')
            .replace(fixRPosRe, '// removed rpos bug');

        return [lintDecls, requireJsStart, repairedContent, requireJsEnd].join('\n');
    }
    function fixThriftApi(content) {
        var lintDecls = '/*global define */\n/*jslint white:true */',
            namespaceRe = /^([^\/\s\.]+)/m,
            namespace = content.match(namespaceRe)[1],
            requireJsStart = 'define(["thrift", "./' + namespace + '_types"], function (Thrift, ' + namespace + ') {\n"use strict";',
            requireJsEnd = 'return ' + namespace + ';\n});',
            fixRPosRe = /if \(.*? > 0 \) {\n\s*if \(input\.rstack\.length > input\.rpos\[input\.rpos\.length -1\] \+ 1\) {\n\s*input\.rstack\.pop\(\);\s*\}\s*\}/g,
            repairedContent = content
            .replace(/([^=!])==([^=])/g, '$1===$2')
            .replace(/!=([^=])/g, '!==$1')
            .replace(fixRPosRe, '// removed rpos bug');

        return [lintDecls, requireJsStart, repairedContent, requireJsEnd].join('\n');
    }
    function fixThriftLib(content) {
        var lintDecls = '/*global define */\n/*jslint white:true */',
            namespaceRe = /^var (.+?) = /m,
            namespace = content.match(namespaceRe)[1],
            requireJsStart = 'define(["jquery"], function (jQuery) {\n"use strict";',
            requireJsEnd = 'return ' + namespace + ';\n});',
            repairedContent = content
            .replace(/([^=!])==([^=])/g, '$1===$2')
            .replace(/!=([^=])/g, '!==$1');

        return [lintDecls, requireJsStart, repairedContent, requireJsEnd].join('\n');
    }
    function fixThriftBinaryLib(content) {
        var lintDecls = '/*global define */\n/*jslint white:true */',
            // namespaceRe = /^var (.+?) = /m,
            // namespace = content.match(namespaceRe)[1],
            namespace = 'Thrift',
            requireJsStart = 'define(["thrift"], function (' + namespace + ') {\n"use strict";',
            requireJsEnd = 'return ' + namespace + ';\n});',
            repairedContent = content
            .replace(/([^=!])==([^=])/g, '$1===$2')
            .replace(/!=([^=])/g, '!==$1');

        return [lintDecls, requireJsStart, repairedContent, requireJsEnd].join('\n');
    }

    // Bower magic.
    /*
     * This section sets up a mapping for bower packages.
     * Believe it or not this is shorter and easier to maintain
     * than plain grunt-contrib-copy.
     * NB: please keep this list in alpha order by dir and then name.
     *
     */
    var bowerFiles = [
        {
            name: 'bluebird',
            cwd: 'js/browser',
            src: ['bluebird.js']
        },
        {
            name: 'jquery',
            cwd: 'dist',
            src: ['jquery.js']
        },
        {
            name: 'underscore'
        },
        {
            name: 'bootstrap',
            cwd: 'dist',
            src: '**/*',
        },
         {
            name: 'font-awesome',
            src: ['css/font-awesome.css', 'fonts/*']
        },
        {
            dir: 'requirejs',
            name: 'require'
        },
        {
            name: 'yaml',
            dir: 'require-yaml'
        },
        {
            name: 'js-yaml',
            cwd: 'dist'
        },
        {
            name: 'text',
            dir: 'requirejs-text'
        },
        {
            name: 'require-css',
            src: 'css.js'
        },
        {
            dir: 'thrift-binary-protocol',
            cwd: 'src',
            src: ['**/*']
        },
        {
            name: 'kbase-common-js',
            cwd: 'dist',
            src: ['**/*'],
            dest: '/'
        }
    ],
        bowerCopy = bowerFiles.map(function (cfg) {
            // path is like dir/path/name
            var path = [];
            // dir either dir or name is the first level directory.
            // path.unshift(cfg.dir || cfg.name);

            // If there is a path (subdir) we add that too.
            if (cfg.path) {
                path.unshift(cfg.path);
            }

            // Until we get a path which we use as a prefix to the src.
            var pathString = path
                .filter(function (el) {
                    if (el === null || el === undefined || el === '') {
                        return false;
                    }
                    return true;
                })
                .join('/');

            var srcs = (function () {
                if (cfg.src === undefined) {
                    return [cfg.name + '.js'];
                } else {
                    if (typeof cfg.src === 'string') {
                        return [cfg.src];
                    } else {
                        return cfg.src;
                    }
                }
            }());

            var sources = srcs.map(function (s) {
                return [pathString, s]
                    .filter(function (el) {
                        if (el === null || el === undefined || el === '') {
                            return false;
                        }
                        return true;
                    })
                    .join('/');
            });

            var cwd = cfg.cwd;
            if (cwd && cwd.charAt(0) === '/') {
            } else {
                cwd = 'bower_components/' + (cfg.dir || cfg.name) + (cwd ? '/' + cwd : '');
            }
            
            var dest;
            if (cfg.dest) {
                dest = cfg.dest;
            } else {
                dest = 'bower_components' + '/' + (cfg.dir || cfg.name);
            }
            return {
                nonull: true,
                expand: true,
                cwd: cwd,
                src: sources,
                dest: makeBuildPath(dest)
            };
        });


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            bower: {
                files: bowerCopy
            },
            'bower-package': {
                files: [
                    {
                        cwd: 'runtime/build',
                        src: 'kb/data/**/*',
                        dest: makeDistPath(),
                        expand: true
                    }
                ]
            },
            runtime: {
                files: [
                    {
                        // copy the sample test config into the runtime semi-permanent config.
                        cwd: 'src/config',
                        src: 'test.yml',
                        dest: makeRuntimePath('config'),
                        expand: true,
                        filter: function (sourceFilePath) {
                            var path = require('path'),
                                dest = path.join(makeRuntimePath('config/test.yml'));
                            if (grunt.file.exists(dest)) {
                                return false;
                            }
                            return true;
                        }
                    }
                ]
            },
            build: {
                files: [
                    {
                        cwd: 'src/js',
                        src: '**/*',
                        dest: makeBuildPath('kb/data'),
                        expand: true
                    },
                    // Files for "eyeball" browser testing and development
                    {
                        cwd: 'src/htdocs',
                        src: '**/*',
                        dest: makeBuildPath('htdocs'),
                        expand: true
                    },
                    // Copy the runtime test config into the main client config.
                    // runtime/config/test.yml is first copied and then hand-maintained
                    // the copy task will not overwrite it
                    {
                        src: makeRuntimePath('config/test.yml'),
                        dest: makeBuildPath('config/config.yml')
                    }
                ]
            },
            thriftLib1: {
                files: [
                    {
                        cwd: 'node_modules/kbase-data-api/thrift/stubs/javascript/taxonomy/taxon',
                        src: 'taxon_types.js',
                        dest: makeBuildPath('kb/data/taxon'),
                        expand: true
                    },
                    {
                        cwd: 'node_modules/kbase-data-api/thrift/stubs/javascript/sequence/assembly',
                        src: 'assembly_types.js',
                        dest: makeBuildPath('kb/data/assembly'),
                        expand: true
                    },
                    {
                        cwd: 'node_modules/kbase-data-api/thrift/stubs/javascript/annotation/genome_annotation',
                        src: 'genome_annotation_types.js',
                        dest: makeBuildPath('kb/data/genomeAnnotation'),
                        expand: true
                    }
                ],
                options: {
                    process: function (content) {
                        return fixThriftTypes(content);
                    }
                }
            },
            thriftLib2: {
                files: [
                    {
                        cwd: 'node_modules/kbase-data-api/thrift/stubs/javascript/taxonomy/taxon',
                        src: 'thrift_service.js',
                        dest: makeBuildPath('kb/data/taxon'),
                        expand: true
                    },
                    {
                        cwd: 'node_modules/kbase-data-api/thrift/stubs/javascript/sequence/assembly',
                        src: 'thrift_service.js',
                        dest: makeBuildPath('kb/data/assembly'),
                        expand: true
                    },
                    {
                        cwd: 'node_modules/kbase-data-api/thrift/stubs/javascript/annotation/genome_annotation',
                        src: 'thrift_service.js',
                        dest: makeBuildPath('kb/data/genomeAnnotation'),
                        expand: true
                    }
                ],
                options: {
                    process: function (content) {
                        return fixThriftApi(content);
                    }
                }
            },
            thriftLib: {
                files: [
                    {
                        cwd: 'bower_components/thrift/lib/js/src',
                        src: 'thrift.js',
                        dest: makeBuildPath('js/thrift'),
                        expand: true
                    }
                ],
                options: {
                    process: function (content) {
                        return fixThriftLib(content);
                    }
                }
            },
            thriftBinaryLib: {
                files: [
                    {
                        cwd: 'bower_components/thrift-binary-protocol/src',
                        src: '*.js',
                        dest: makeBuildPath('js/thrift'),
                        expand: true
                    }
                ],
                options: {
                    process: function (content) {
                        return fixThriftBinaryLib(content);
                    }
                }
            }
        },
        clean: {
            build: {
                src: [
                    makeBuildPath(), 
                    makeDistPath()
                ],
                // We force, because our build directory may be up a level
                // in the runtime directory.
                options: {
                    force: true
                }
            },
            runtime: {
                src: []
            },
            dist: {
                src: 'dist'
            },
            temp: {
                src: 'temp'
            },
            deps: {
                src: ['node_modules', 'bower_components']
            }
        },
        shell: {
            compileTaxon: {
                command: [
                    'thrift',
                    '-gen js:jquery',
                    '-out temp/taxon',
                    '<%= corepath %>/thrift/specs/taxonomy/taxon/taxon.thrift'
                ].join(' '),
                options: {
                    stderr: false
                }
            },
            compileAssembly: {
                command: [
                    'thrift',
                    '-gen js:jquery',
                    '-out temp/assembly',
                    '<%= corepath %>/thrift/specs/sequence/assembly/assembly.thrift'
                ].join(' '),
                options: {
                    stderr: false
                }
            },
            compileGenomeAnnotation: {
                command: [
                    'thrift',
                    '-gen js:jquery',
                    '-out temp/genome_annotation',
                    '<%= corepath %>/thrift/specs/annotation/genome_annotation/genome_annotation.thrift'
                ].join(' '),
                options: {
                    stderr: false
                }
            },
           bowerUpdate: {
              command: [
                 'bower', 'update'
              ].join(' ')
           }
        },
        mkdir: {
            temp: {
                options: {
                    create: ['temp/taxon', 'temp/assembly', 'temp/genome_annotation']
                }
            }
        },
        bower: {
            install: {
                options: {
                    // base: '..',
                    copy: false
                }
            }
        },
        jsdoc: {
            build: {
                src: ['src/js/*.js', 'src/docs/types.js'],
                dest: 'runtime/build/htdocs/jsdocs'
            }
        },
        markdown: {
            build: {
                files: [
                    {
                        cwd: 'src/docs',
                        src: '*.md',
                        dest: 'runtime/build/htdocs/docs',
                        ext: '.html',
                        expand: true
                    }
                ],
                options: {
                    markdownOptions: {
                        gfm: true,
                        tables: true
                    }
                }
            }
        },
        open: {
           dev: {
               path: 'http://localhost:8000/htdocs/'
           }
        },

        connect: {
           server: {
               port: 8000,
               base: 'runtime/build',
               keepalive: false,
               onCreateServer: function (server, connect, options) {
                   console.log('created...');
               }
           }
        },

        // This is the path to the root of the Data API core
        // directory, which contains the Thrift specs and other cool things.
        corepath: 'node_modules/kbase-data-api'
        
    });

    grunt.registerTask('build', [
        'shell:bowerUpdate',
        'copy:runtime',
        'copy:bower',
        'copy:build',
        'build-thrift-libs',
        'copy:bower-package',
        // disable temporarily -- it breaks under some generated code.
        // 'jsdoc:build',
        'markdown:build'
    ]);
    
    grunt.registerTask('clean-build', [
        'clean:build'
    ]);

    // Do a build w/o Thrift for TravisCI
    grunt.registerTask('build-travis', [
        'shell:bowerUpdate',
        'jsdoc:build',
        'markdown:build',
        'copy:runtime',
        'copy:bower',
        'copy:build',
        'copy:bower-package'
    ]);

    grunt.registerTask('build-thrift-libs', [
        'clean:temp',
        'mkdir:temp',
        //'shell:compileTaxon',
        //'shell:compileAssembly',
        'copy:thriftLib1',
        'copy:thriftLib2',
        'copy:thriftLib',
        'copy:thriftBinaryLib'
    ]);


    // Starts a little server and runs the app in a page.
    // Should be run after 'grunt build'.
   grunt.registerTask('preview', [
       'open:dev',
       'connect'
   ]);
    
   grunt.registerTask('clean-all', [
       'clean:build', 'clean:dist', 'clean:temp', 'clean:deps'
   ])
};
