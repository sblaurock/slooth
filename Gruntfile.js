module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    version: grunt.file.readJSON('package.json').version,
    outFile: 'public/js/slooth.min.js',
    banner: [
      '/*',
      ' * Slooth <%= version %>',
      ' * https://github.com/sblaurock/slooth',
      ' * @sblaurock - <%= grunt.template.today("yyyy-mm-dd") %> - Licensed MIT',
      ' */\n\n'
    ].join('\n'),

    requirejs: {
      compile: {
        options: {
          namespace: 'slooth',
          baseUrl: './',
          name: 'src/initialize',
          paths: {
            audio: 'src/audio',
            data: 'src/data',
            host: 'src/host',
            session: 'src/session',
            subscriber: 'src/subscriber'
          },
          include: [
            'lib/require'
          ],
          out: '<%= outFile %>',
          optimize: 'uglify2'
        }
      }
    },

    concat: {
      options: {
        stripBanners: false,
        banner: '<%= banner %>',
      },
      dist: {
        src: '<%= outFile %>',
        dest: '<%= outFile %>',
      }
    },

    watch: {
      library: {
        files: [
          'Gruntfile.js',
          'src/*'
        ],
        tasks: [
          'requirejs',
          'concat'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    'requirejs',
    'concat',
    'watch'
  ]);
};