module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-ts');
    require('time-grunt')(grunt);
    grunt.initConfig({
        ts: {
            gobi: {
                tsconfig: 'tsconfig.json'
            }
        }
    });
    grunt.registerTask('build_gobi', 'build js form ts sources', [
        'ts:gobi'
    ]);
    grunt.registerTask('default', ['build_gobi']);
}