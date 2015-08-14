var config = require('./app/lib/config')
var gulp = require('gulp');


var dashboardSource = config.get('DASHBOARD_SOURCE_DIRECTORY') + '/**/*';

gulp.task('compile-dashboard', function(){
	gulp.src(dashboardSource)
		.pipe(gulp.dest(config.get('SERVER_PUBLIC_DIRECTORY')));
});

gulp.task('watch-dashboard', function(){
	gulp.watch(dashboardSource, ['compile-dashboard']);
});