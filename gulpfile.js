var config = require('./app/lib/config')
var log = require('./app/lib/log')
var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);

gulp.task('compile-dashboard', function(){
	log.info('Starting gulp task: compile-dashboard')
	gulp.src(dashboardSource())
		.pipe(gulp.dest(config.get('SERVER_PUBLIC_DIRECTORY')));
});

gulp.task('watch-dashboard', function(){
	log.info('Starting gulp task: watch-dashboard')
	gulp.watch(dashboardSource(), ['compile-dashboard']);
});

function dashboardSource() {
	var dashboardSource = config.get('DASHBOARD_SOURCE_DIRECTORY');
	if (!dashboardSource) {process.exit();}
	return dashboardSource + '/**/*';
}