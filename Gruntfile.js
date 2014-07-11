module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jasmine: {
            components: {
              src: [
              'components/*js'
              ],
              options: {
                specs: 'tests/spec/*Spec.js',
                keepRunner : true,
                //helpers: 'test/spec/*.js'
              }
            }
    }
  });

  // Load the plugin that provides the "jasmine" task.
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task(s).
  grunt.registerTast('default', []);
  grunt.registerTask('travis', ['jshint', 'jasmine']);

};

