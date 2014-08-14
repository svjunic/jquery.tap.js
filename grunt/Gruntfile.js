// #"Last Change: 11-Aug-2014."

var EXAMPLE_ROOT = '../example/';
var BUILD_ROOT   = '../build/';
var SRC_ROOT     = '../src/';

function createJsHeader( info ) {
  var date = new Date();
  var jsHeader = '';
  jsHeader += '/*\n';
  jsHeader += ' * Last Change: ' + date + '\n';
  jsHeader += ' * @project ' + info.name + '\n';
  jsHeader += ' * @version ' + info.version + '\n';
  jsHeader += ' * @author ' + info.author + '\n';
  jsHeader += ' * @url ' + info.url + '\n';
  jsHeader += '*/\n';
  return jsHeader;
}


module.exports = function(grunt) {

 'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    connect: {
        livereload: {
            options: {
                livereload : true
            }
        }
    },
    watch:{
       src_js : {
         files: [
            SRC_ROOT + '*.js'
         ],
         tasks: [ 'clean:build', 'clean:example_js','uglify:build', 'rename:min','copy:example' ]
       },
       example_js : {
         options: {
            livereload: true,
            nospawn: true
         },
         files: [
            EXAMPLE_ROOT + '*.js'
         ],
         tasks: []
       },

       html : {
         options: {
            livereload: true,
            nospawn: true
         },
         files: [ 
             EXAMPLE_ROOT + '*.html',
             EXAMPLE_ROOT + '**/*.html'
         ],
         tasks: []
       }
    },

    clean : {
      options: {
        force: true
      },
      build      : [ BUILD_ROOT + '*.js' ],
      example_js : [ EXAMPLE_ROOT + '*.js' ]
    },

    /* uglify
     * */
    uglify : {
      build : {
        options: {
          banner: createJsHeader( {
            name   :'<%= pkg.name %>',
            version:'<%= pkg.version %>',
            author :'<%= pkg.author %>',
            url    :'<%= pkg.url %>'
          })
        },
        files: [{
          expand: true,
          cwd: SRC_ROOT,
          src: 'jquery.tap.js',
          dest: BUILD_ROOT
        }]
      }
    },

    /* rename 
     * */
    rename: {
      options: {
        force: true
      },
      min: {
        src  : BUILD_ROOT + '<%= pkg.src_filename %>',
        dest : BUILD_ROOT + '<%= pkg.build_filename %>'
      }
    },

    /* copy 
     * */
    copy : {
      options: {
        force: true
      },
      example : {
        expand: true,
        cwd: BUILD_ROOT,
        src: ['*.js'],
        dest: EXAMPLE_ROOT
      }
    }
  });

  //プラグインの読み
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-rename');

  grunt.registerTask("default", ["connect","watch"]);
};
