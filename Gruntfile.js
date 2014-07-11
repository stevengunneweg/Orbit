module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jasmine: {
            components: {
              src: [
		'test/spec/SpecHelper.js',
		'orbitGame/*.js',
		'orbitGame/lib/game/*.js',
		'orbitGame/lib/game/entities/*.js',
		'orbitGame/lib/game/gamestates/*.js'
              ],
              options: {
                specs: 'test/spec/*Spec.js',
                keepRunner : true,
                //helpers: 'test/spec/*.js'
              }
            }
    }
  });

  // Load the plugin that provides the "jasmine" task.
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task(s).
  grunt.registerTask('default', []);
  grunt.registerTask('travis', ['jshint', 'jasmine']);
};

