# =================================
# do
#
# install growlnotify
#
# $ npm install -g coffee-script
# $ npm install
#
# Then...
# =================================
# $ grunt
# =================================

module.exports = (grunt) ->

  grunt.task.loadNpmTasks 'grunt-contrib-watch'
  grunt.task.loadNpmTasks 'grunt-contrib-concat'
  grunt.task.loadNpmTasks 'grunt-contrib-uglify'
  grunt.task.loadNpmTasks 'grunt-contrib-sass'
  grunt.task.loadNpmTasks 'grunt-contrib-cssmin'

  grunt.initConfig

    sass:
      cssAll:
        src: 'assets/css/c4u.scss'
        dest: 'assets/css/c4u.css'

    cssmin:
      cssAll:
        src: '<%= sass.cssAll.dest %>'
        dest: 'assets/css/c4u.min.css'

    concat:
      # jsSrc:
      #   src: [
      #     'assets/js/src/c4u.___.js'
      #   ]
      #   dest: 'assets/js/c4u.min.js'

      jsLibs:
        src: [
          'assets/js/vender/modernizr.custom.js',
          'assets/js/vender/jquery-2.1.0.min.js',
          'assets/js/vender/three.min.js',
          'assets/js/vender/cv.js',
          'assets/js/vender/aruco.js',
          'assets/js/vender/svd.js',
          'assets/js/vender/posit1.js',
        ]
        dest: 'assets/js/libs.js'

    uglify:
      jsSrc:
        src: 'assets/js/src/c4u.js'
        dest: 'assets/js/c4u.min.js'

    watch:
      js:
        files: ['assets/js/src/*.js']
        tasks: [ 'uglify:jsSrc' ]

      jsLibs:
        files: ['assets/js/vendor/*.js']
        tasks: [ 'concat:jsLibs' ]

      sass:
        files: ['assets/css/*.scss' ]
        tasks: ['sass', 'cssmin' ]

  grunt.registerTask 'default', [
    'sass'
    'cssmin'
    'concat'
    'uglify'
  ]

