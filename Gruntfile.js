module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    version: grunt.file.readJSON('package.json').version,

    requirejs: {
      compile: {
        options: {
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
          out: "public/js/slooth.js",
          preserveLicenseComments: false,
          optimize: 'none'
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('default', [
    'requirejs'
  ]);
};