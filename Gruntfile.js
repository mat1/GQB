'use strict';

module.exports = function(grunt) {
  
  grunt.initConfig({
    distdir: 'dist',
    pkg: grunt.file.readJSON('package.json'),
    src: {
      js: ['gqb/app/js/**/*.js'],
      html: ['gqb/app/index.html'],
      css: ['gqb/app/css/**/*.css'],
      tpl: 'gqb/app/partials/',
      img: 'gqb/app/img/',
      data: 'gqb/app/data/',
      server: 'gqb/app/server',
      test: {
        unit: ['gqb/test/unit/**/*Spec.js'],
        e2e: ['gqb/test/e2e/**/*Scenario.js']
      }
    },
    clean: {
      build: {
        src: ['<%= distdir %>']
      }
    },
    concat: {
      css: {
        src: ['<%= src.css %>'],
        dest: '<%= distdir %>/css/app.css'
      },
      libs: {
        src: ['gqb/app/lib/jquery/jquery.min.js',
          'gqb/app/lib/bootstrap/bootstrap.min.js',
          'gqb/app/lib/d3/d3.min.js',
          'gqb/app/lib/angular/angular.min.js',
          'gqb/app/lib/angularui/angular-ui-states.min.js',
          'gqb/app/lib/underscore/underscore.min.js'],
        dest: '<%= distdir %>/lib/libs.js'
      }
    },
    copy: {
      img: {
        files: [
          {
            expand: true,
            cwd: '<%= src.img %>',
            src: '**',
            dest: '<%= distdir %>/img/'
          }
        ]
      },
      data: {
        files: [
          {
            expand: true,
            cwd: '<%= src.data %>',
            src: '**',
            dest: '<%= distdir %>/data/'
          }
        ]
      },
      partials: {
        files: [
          {
            expand: true,
            cwd: '<%= src.tpl %>',
            src: '**',
            dest: '<%= distdir %>/partials/'
          }
        ]
      },
      server: {
        files: [
          {
            expand: true,
            cwd: '<%= src.server %>',
            src: '**',
            dest: '<%= distdir %>/server/'
          }
        ]
      }
    },
    jshint: {
      files: ['gruntfile.js', '<%= src.js %>'],
      options: {
        globalstrict: true,
        globals: {
          angular: true,
          module: true,
          d3: true,
          gqb: true,
          _: true
        }
      }
    },
    connect: {
      test: {
        options: {
          port: 8000,
          base: 'dist/'
        }
      }
    },
    karma: {
      unit: {
        configFile: 'gqb/config/karma.conf.js',
        singleRun: true
      },
      e2e: {
        configFile: 'gqb/config/karma-e2e.conf.js',
        singleRun: true
      },
      unitCI: {
        configFile: 'gqb/config/karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: ['junit']
      }
    },
    plato: {
      stats: {
        options: {
          jshint: false
        },
        files: {
          'reports': ['<%= src.js %>']
        }
      }
    },
    recess: {
      min: {
        options: {
          compress: true
        },
        files: {
          '<%= distdir %>/css/app.css': [
            '<%= distdir %>/css/app.css'
          ]
        }
      }
    },
    uglify: {
      options: {
        mangle: false,
        compress: {sequences: false}
      },
      target: {
        files: {
          '<%= distdir %>/<%= pkg.name %>.js': ['<%= src.js %>']
        }
      }
    },
    htmlrefs: {
      dist: {
        src: '<%= src.html %>',
        dest: '<%= distdir %>'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-htmlrefs');
  grunt.loadNpmTasks('grunt-sftp-deploy');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  grunt.loadNpmTasks('grunt-plato');

  grunt.registerTask('prepare', ['clean']);
  grunt.registerTask('build', ['jshint', 'concat', 'recess', 'copy', 'uglify', 'htmlrefs']);
  grunt.registerTask('stats', 'plato');

  grunt.registerTask('default', ['prepare', 'karma:unit', 'build', 'connect:test', 'karma:e2e']);
};
