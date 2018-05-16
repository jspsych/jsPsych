const gulp = require('gulp');
const umd = require('gulp-umd')
const patterns = require('umd-templates');
const path =require('path')

console.log(patterns.jqueryPlugin)

gulp.task('umd', function() {
  gulp.src('lib/plugins/*.js')
    .pipe(umd({
       namespace: function(file) {
            return 'jsPsych.plugins["' + path.basename(file.path).replace('jspsych-', '').replace('.js','') + '"]';
        },
    	dependencies: function() {
    		return [
	    		{
                        name: 'jspsych',
                        amd: 'jspsych',
                        cjs: 'jspsych',
                        global: 'jsPsych',
                        param: 'jsPsych'
	            }
    		]
    	},
        template: path.resolve(__dirname, 'templates', 'jsPsychPlugin.js')
    }))
    .pipe(gulp.dest('build/plugins'));
  gulp.src('lib/jspsych.js')
    .pipe(umd({
          exports: function(file) {
                return 'jsPsych';
            },
        namespace:function() { 
            return 'jsPsych'
        },
        template: patterns.returnExportsGlobal.path
    }))
    .pipe(gulp.dest('build'));
});