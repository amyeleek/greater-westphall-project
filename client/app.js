(function(module){
	app = {}

	app.searchMedia = function(){
		var queryString = $("#search").find("input[name=search]").val();

		api.searchDB('Media', queryString);
	}

	module.app = app;
})(window)