# grunt-http-server
> Provides static files server integration to Grunt

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=NYVPSL7GBYD6A&lc=US&item_name=Oscar%20Brito&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)


[![Divhide](http://site.divhide.com/assets/img/github_powered_by.jpg)](http://site.divhide.com/) 
---

```js


npm install grunt-http-server

```

## Getting Started

If you need to serve static files in your grunt directory you can add tasks with _grunt-http-server_.

Just add this task to Gruntfile:

```js


grunt.initConfig({

	'http-server': {
	
		'dev': {
		
			// the server root directory
			root: <path>,

			port: 8282,
			// port: function() { return 8282; }
				
			host: "127.0.0.1",

			cache: <sec>,
			showDir : true,
			autoIndex: true,
			defaultExt: "html",

			// run in parallel with other tasks
			runInBackground: true|false
			
		}
		
	}
});

grunt.loadNpmTasks('grunt-http-server');


```

And run:

```js


grunt http-server:dev

```

Now your static files are available in _http://127.0.0.1:8282/_. 


## More information
http://blog.divhide.com/2013/07/grunt-http-server-npm-js-file-server-on.html

[Oscar Brito](http://divhide.com)
